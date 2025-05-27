// src/db/models/OrderSchema.ts
import { Schema, model, Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

const OrderItemSchema = new Schema({
  product: {
    type: String,
    ref: 'products',
    required: [true, "Product is required"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"]
  },
  price: {
    type: Number,
    required: [true, "Price is required"]
  },
  title: {
    type: String,
    required: [true, "Product title is required"]
  },
  image: {
    type: String,
    required: [true, "Product image is required"]
  },
  description: {
    type: String,
    required: [true, "Product description is required"]
  }
}, { _id: true });

const ShippingAddressSchema = new Schema({
  streetAddress: {
    type: String,
    required: [true, "Street address is required"],
    trim: true
  },
  apartment: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true
  },
  province: {
    type: String,
    required: [true, "Province/State is required"],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, "Postal code is required"],
    trim: true
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true
  }
}, { _id: false });

const OrderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'users'
    },
    orderItems: {
      type: [OrderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: (items: any[]) => items.length > 0,
        message: "At least one order item is required"
      }
    },
    customerInfo: {
      fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minLength: [2, "Full name must be at least 2 characters"],
        maxLength: [100, "Full name cannot exceed 100 characters"]
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        validate: {
          validator: (value: string) => {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
          },
          message: "Not a valid email"
        }
      },
      phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
      }
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: [true, "Shipping address is required"]
    },
    paymentInfo: {
      paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        enum: ["STRIPE", "CASH_ON_DELIVERY"],
        default: 'STRIPE'
      },
      stripePaymentIntentId: {
        type: String
      },
      stripeCustomerId: {
        type: String
      },
      lastFourDigits: {
        type: String
      }
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"]
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: [true, "Total is required"]
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    notes: {
      type: String,
      maxLength: 500
    },
    trackingNumber: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default model("orders", OrderSchema);