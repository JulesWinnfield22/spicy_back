import productModel from "../../db/models/ProductsSchema";
import {
  asyncCall,
  paginate,
  Pagination,
  ProductsStatus,
} from "../../utils/utils";
import { Result } from "../../utils/utils";
import mongoose from "mongoose";

export interface CreateProductInput {
  title: string;
  images: string[];
  description: string;
  ingredients: string[];
  useInstructions: string[];
  price: number;
  weight: number;
  weightUnit: string;
  quantity: number;
  status?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  discountPercentage?: number;
  discountExpiry?: Date | null;
}

export const getProducts = async (
  pagination?: Pagination,
  filter: any = { status: ProductsStatus.VISIBLE }
) => {
  return await asyncCall(paginate(productModel, pagination, filter));
};

export const getProductById = async (productId: string) => {
  return await asyncCall(
    productModel.findOne({
      product_id: productId,
      status: ProductsStatus.VISIBLE,
    })
  );
};

export const createProduct = async (product: CreateProductInput) => {
  return await asyncCall(productModel.create(product));
};

export const updateProduct = async (
  productId: string,
  updates: UpdateProductInput
) => {
  return await asyncCall(
    productModel.findOneAndUpdate({ product_id: productId }, updates, {
      new: true,
    })
  );
};

export const removeProduct = async (productId: string) => {
  return await asyncCall(
    productModel.findByIdAndUpdate(
      productId,
      { status: ProductsStatus.HIDDEN },
      { new: true }
    )
  );
};

export const applyDiscountToProduct = async (
  productId: string,
  discountPercentage: number,
  discountExpiry: Date
) => {
  return await asyncCall(
    productModel.findByIdAndUpdate(
      productId,
      {
        discountPercentage,
        discountExpiry,
      },
      { new: true }
    )
  );
};

export const resetProductDiscount = async (productId: string) => {
  return await asyncCall(
    productModel.findByIdAndUpdate(
      productId,
      {
        discountPercentage: 0,
        discountExpiry: null,
      },
      { new: true }
    )
  );
};
