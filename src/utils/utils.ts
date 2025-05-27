import { Types, type Model } from "mongoose";
// We'll define our own Result type, so we don't need to import FunctionResponse
import transport from "./emailConfig";

export const DiscountStatus = {
  ACTIVE: "ACTIVE",
  REMOVED: "REMOVED",
  INACTIVE: "INACTIVE",
};

export const ProductsStatus = {
  VISIBLE: "VISIBLE",
  HIDDEN: "HIDDEN",
};

export const weightUnit = ["g", "kg", "ml", "l"];

export const passwordErrorMessage = {
  field: "password",
  message: `
    Must be between 6 and 16 characters long.
    Must include at least one uppercase letter (A-Z).
    Must include at least one lowercase letter (a-z).
    Must include at least one number (0-9).
    Must include at least one special character (e.g., !@#$%^&*)
  `,
};
function alpha(value: string) {
  let regex = /^[^0-9!@#$%^&*()_+={}\[\]:;"'<>?,./`~]+$/;
  return regex.test(value);
}

export interface Pagination {
  page?: string;
  limit?: string;
  search?: string;
}

export function getPagination(pagination?: Pagination) {
  const page = parseInt(pagination?.page || "") ?? 1;
  const limit = parseInt(pagination?.limit || "") ?? 25;
  return { page, limit };
}

export function generateVerificationCode(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let verificationCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    verificationCode += characters[randomIndex];
  }

  return verificationCode;
}

type NestedPopulate = {
  path: string;
  populate?: NestedPopulate;
};

export function nestPopulate(name: string): NestedPopulate {
  const names = name.split(".");
  console.log(name, names);

  if (names.length == 1) {
    return { path: name };
  }
  return {
    path: names[0],
    populate: nestPopulate(names.slice(1).join(".")),
  };
}

export async function paginate<T>(
  model: Model<T>,
  pagination?: Pagination,
  filter?: any,
  populate?: string[]
) {
  const { page, limit } = getPagination(pagination);

  const find = Object.entries(model.schema.paths || {}).reduce(
    (state: any, [key, schemaType]) => {
      if (
        ["__v", "_id"].includes(key) ||
        !pagination?.search ||
        schemaType.options.ref ||
        schemaType.instance === "ObjectID" ||
        schemaType.instance == "Array"
      )
        return state;

      const searchValue = pagination?.search?.trim?.();

      // Skip empty search
      if (!searchValue) return state;

      // Handle different schema types
      switch (schemaType.instance) {
        case "String":
          state.push({
            [key]: { $regex: searchValue, $options: "i" },
          });
          break;

        case "Number":
          const numValue = Number(searchValue);
          if (!isNaN(numValue)) {
            state.push({ [key]: numValue });
          }
          break;

        case "Date":
          const dateValue = new Date(searchValue);
          if (!isNaN(dateValue.getTime())) {
            state.push({
              [key]: {
                $gte: new Date(dateValue.setHours(0, 0, 0, 0)),
                $lte: new Date(dateValue.setHours(23, 59, 59, 999)),
              },
            });
          }
          break;

        case "Array":
          state.push({
            [key]: { $elemMatch: { $regex: searchValue, $options: "i" } },
          });
          break;

        case "Boolean":
          if (["true", "false"].includes(searchValue.toLowerCase())) {
            state.push({ [key]: searchValue.toLowerCase() === "true" });
          }
          break;

        // For nested objects
        case "Object":
          const objectPaths = Object.keys(schemaType.schema.paths).map(
            (subKey) => `${key}.${subKey}`
          );
          objectPaths.forEach((path) => {
            state.push({
              [path]: { $regex: searchValue, $options: "i" },
            });
          });
          break;
      }

      return state;
    },
    []
  );

  const searchQuery = find.length > 0 ? { $or: find } : {};
  const finalFilter =
    Object.keys(filter ?? {}).length > 0
      ? { $and: [filter, searchQuery] }
      : searchQuery;

  const response = await model
    .find(finalFilter)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(
      (populate || []).map((el) => {
        return nestPopulate(el);
      })
    );
  return {
    response,
    page,
    limit,
  };
}

function isValidPassword(value: string) {
  let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,16}$/;
  return regex.test(value);
}

/**
 * Success result type with data and metadata
 */
export type Success<T> = {
  success: true;
  data: T;
  error: null;
  timestamp: Date;
  meta?: Record<string, any>;
};

/**
 * Failure result type with error details
 */
export type Failure<E = Error> = {
  success: false;
  data: null;
  error: E;
  timestamp: Date;
  meta?: Record<string, any>;
};

/**
 * Result type - discriminated union of Success and Failure
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Options for the asyncCall function
 */
export interface AsyncCallOptions<T, E = Error> {
  /**
   * Transform the successful result before returning
   */
  transformData?: (data?: T) => any;

  /**
   * Transform the error before returning
   */
  transformError?: (error: any) => E;

  /**
   * Additional metadata to include in the result
   */
  meta?: Record<string, any>;

  /**
   * Whether to convert Mongoose documents to plain objects
   * Default: true
   */
  convertMongoose?: boolean;
}

/**
 * Type for the async function to be executed
 */

/**
 * Enhanced async function wrapper that provides a structured Result object
 *
 * @param fn - Async function to execute
 * @param options - Configuration options
 * @returns A Result object with either data or error
 *
 * @example
 * // Basic usage
 * const result = await asyncCall(() => userModel.findById(id));
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 *
 * @example
 * // With transformation
 * const result = await asyncCall(
 *   () => userModel.findById(id),
 *   {
 *     transformData: user => ({ id: user._id, name: user.name }),
 *     meta: { source: 'database' }
 *   }
 * );
 */
async function asyncCall<T, E = Error>(
  fn: Promise<T>,
  options: AsyncCallOptions<T, E> = {}
): Promise<Result<T, E>> {
  const {
    transformData,
    transformError,
    meta = {},
    convertMongoose = true,
  } = options;

  try {
    let data = await fn;

    if (convertMongoose) {
      if (data && typeof (data as any).toObject === "function") {
        data = (data as any).toObject();
      }

      if (Array.isArray(data)) {
        const mappedData = data.map((item) =>
          item && typeof item.toObject === "function" ? item.toObject() : item
        );
        data = mappedData as any;
      }
    }
    if (transformData) {
      data = transformData(data);
    }
    return {
      success: true,
      data,
      error: null,
      timestamp: new Date(),
      meta,
    };
  } catch (error) {
    let processedError: E;

    if (transformError) {
      processedError = transformError(error);
    } else if (error instanceof Error) {
      processedError = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as unknown as E;
    } else {
      processedError = error as E;
    }

    return {
      success: false,
      data: null,
      error: processedError,
      timestamp: new Date(),
      meta,
    };
  }
}

interface Email {
  to: string;
  subj: string;
  msg: string;
}
export async function sendEmail(email: Email) {
  const result = await asyncCall(
    transport.sendMail({
      to: email.to,
      headers: {},
      from: '"MARBARAK TRADING" <admin@marbaraktrading.com>"',
      subject: email.subj,
      html: `<p>${email.msg}</p>`,
    })
  );

  // For backward compatibility, return a tuple
  if (result.success) {
    return [null, result.data];
  } else {
    return [result.error, null];
  }
}

// For backward compatibility
export type FunctionResponse<T> = [error: any | undefined, data: T | undefined];

export { alpha, isValidPassword, asyncCall };
