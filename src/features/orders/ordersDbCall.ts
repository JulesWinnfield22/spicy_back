import orderModel from "../../db/models/OrderSchema";
import { asyncCall, paginate, Pagination } from "../../utils/utils";
import mongoose from "mongoose";
import { OrderStatus, PaymentStatus } from "../../db/models/OrderSchema";

export interface CreateOrderInput {
  user?: string;
  orderItems: Array<{
    product: string;
    quantity: number;
    price: number;
    title: string;
    image: string;
  }>;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  shippingAddress: {
    streetAddress: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  paymentInfo: {
    paymentMethod: string;
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    lastFourDigits?: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
}

export const createOrder = async (orderData: CreateOrderInput) => {
  return await asyncCall(orderModel.create(orderData));
};

export const getOrders = async (pagination?: Pagination) => {
  return await asyncCall(paginate(orderModel, pagination));
};

export const getOrderById = async (orderId: string) => {
  return await asyncCall(
    orderModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
    })
  );
};

export const getOrdersByUser = async (userId: string, pagination?: Pagination) => {
  return await asyncCall(
    paginate(
      orderModel,
      pagination,
      {
        user: new mongoose.Types.ObjectId(userId),
      }
    )
  );
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  return await asyncCall(
    orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    )
  );
};

export const updatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
  return await asyncCall(
    orderModel.findByIdAndUpdate(
      orderId,
      { paymentStatus: status },
      { new: true }
    )
  );
};

export const updateOrderPaymentInfo = async (
  orderId: string,
  paymentInfo: Partial<{
    stripePaymentIntentId: string;
    stripeCustomerId: string;
    lastFourDigits: string;
  }>
) => {
  const updateFields: Record<string, any> = {};
  
  if (paymentInfo.stripePaymentIntentId) {
    updateFields["paymentInfo.stripePaymentIntentId"] = paymentInfo.stripePaymentIntentId;
  }
  
  if (paymentInfo.stripeCustomerId) {
    updateFields["paymentInfo.stripeCustomerId"] = paymentInfo.stripeCustomerId;
  }
  
  if (paymentInfo.lastFourDigits) {
    updateFields["paymentInfo.lastFourDigits"] = paymentInfo.lastFourDigits;
  }
  
  return await asyncCall(
    orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true }
    )
  );
};
