import GlobalDiscount from "../../db/models/GlobalDiscountSchema";
import {
  asyncCall,
  DiscountStatus,
  paginate,
  Pagination,
} from "../../utils/utils";
import { applyGlobalDiscount as applyDiscount } from "../../utils/discountManager";
import mongoose from "mongoose";

export interface CreateGlobalDiscountInput {
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
}

export const getGlobalDiscounts = async (pagination?: Pagination) => {
  return asyncCall(paginate(GlobalDiscount, pagination));
};

export const getGlobalDiscountById = async (discountId: string) => {
  return await asyncCall(
    GlobalDiscount.findOne({
      _id: new mongoose.Types.ObjectId(discountId),
    })
  );
};

export const createGlobalDiscount = async (
  discount: CreateGlobalDiscountInput
) => {
  // Use the utility function from discountManager to apply the discount
  // Since applyDiscount now returns a Result object, we don't need to wrap it in asyncCall
  return await applyDiscount(
    discount.discountPercentage,
    discount.startDate,
    discount.endDate
  );
};

export const updateGlobalDiscount = async (
  discountId: string,
  updates: Partial<CreateGlobalDiscountInput>
) => {
  return await asyncCall(
    GlobalDiscount.findByIdAndUpdate(discountId, updates, { new: true })
  );
};

export const deactivateGlobalDiscount = async (discountId: string) => {
  return await asyncCall(
    GlobalDiscount.findByIdAndUpdate(
      discountId,
      { status: DiscountStatus.REMOVED },
      { new: true }
    )
  );
};

/**
 * Check if there are any active global discounts
 * @returns Result object with boolean indicating if active discounts exist
 */
export const hasActiveGlobalDiscounts = async () => {
  return await asyncCall(
    GlobalDiscount.exists({
      status: DiscountStatus.ACTIVE,
      endDate: { $gt: new Date() }
    })
  );
};

/**
 * Get all active global discounts
 * @returns Result object with array of active global discounts
 */
export const getActiveGlobalDiscounts = async () => {
  return await asyncCall(
    GlobalDiscount.find({
      status: DiscountStatus.ACTIVE,
      endDate: { $gt: new Date() }
    })
  );
};
