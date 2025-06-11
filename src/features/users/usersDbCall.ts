import userModel from "../../db/models/UsersSchema";
import RoleSchema from "../../db/models/RoleSchema";
import { FunctionResponse, RegisterUser, User } from "../../interface";
import { asyncCall } from "../../utils/utils";
import mongoose, { QueryOptions } from "mongoose";
import PermissionSchema from "../../db/models/PermissionSchema";

export const getUsers = async () => {
  return await userModel.find();
};

export const createUser = async (user: RegisterUser) => {
  return await asyncCall<User | null>(
    userModel.findOneAndUpdate(
      {
        email: user.email,
      },
      user,
      {
        new: true,
        upsert: true,
      }
    )
  );
};

export const findUserByEmail = async (
  email: string,
  options?: QueryOptions
) => {
  const res = await asyncCall<User | null>(
    userModel.findOne({ email }).populate({
      path: "roles",
      model: RoleSchema,
      populate: {
        path: "permissions",
        model: PermissionSchema,
      },
    })
  );
  console.log(res);
  return res;
};

export const findUserByPhone = async (
  phone_number: string,
  options?: QueryOptions
) => {
  return await asyncCall<User | null>(userModel.findOne({ phone_number }));
};

export const findUserById = async (id: string, options?: QueryOptions) => {
  return await asyncCall<User | null>(
    userModel.findById(id).populate({
      path: "roles",
      model: RoleSchema,
      populate: {
        path: "permissions",
        model: PermissionSchema,
      },
    })
  );
};
