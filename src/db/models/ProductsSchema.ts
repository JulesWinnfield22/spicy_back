import { Schema, model } from "mongoose";
import { asyncCall, ProductsStatus, weightUnit } from "src/utils/utils";
import CounterSchema from "./CounterSchema";

const productsSchema = new Schema(
  {
    product_id: {
      type: String,
    },
    title: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
      required: [true, "this field is required"],
    },
    images: {
      type: [String],
      required: [true, "this field is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one image is required",
      },
    },
    description: {
      type: String,
      required: [true, "this field is required"],
      trim: true,
      minLength: 395,
      maxLength: 1000,
    },
    ingredients: {
      type: [String],
      required: [true, "this field is required"],
      validate: [
        {
          validator: (v: string[]) => v.length > 0,
          message: "At least one ingredient is required",
        },
        {
          validator: (v: string[]) =>
            v.every((item) => item.length >= 2 && item.length <= 200),
          message: "Each ingredient must be between 2 and 100 characters",
        },
      ],
    },
    instructions: {
      type: [String],
      required: [true, "this field is required"],
      validate: [
        {
          validator: (v: string[]) => v.length > 0,
          message: "At least one instruction is required",
        },
        {
          validator: (v: string[]) =>
            v.every((item) => item.length >= 5 && item.length <= 500),
          message: "Each instruction must be between 5 and 200 characters",
        },
      ],
    },
    price: {
      type: Number,
      required: [true, "this field is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100%"],
      default: 0,
    },
    discountExpiry: {
      type: Date,
      default: null,
    },
    weight: {
      type: Number,
      required: [true, "this field is required"],
      min: [0, "Weight cannot be negative"],
    },
    weightUnit: {
      type: String,
      required: [true, "this field is required"],
      enum: weightUnit,
    },
    quantity: {
      type: Number,
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ProductsStatus),
      default: ProductsStatus.VISIBLE,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productsSchema.index({ product_id: 1 });

productsSchema.pre("save", async function () {
  const { error, data } = await asyncCall(
    CounterSchema.findOneAndUpdate(
      {
        for: "products",
      },
      {
        $inc: {
          counter: 1
        },
      },
      { new: true, upsert: true }
    )
  );


  if (error || !data) return false;

  this.product_id = `EID${data.counter}`;
});

// Virtual for discounted price
productsSchema.virtual("discountedPrice").get(function () {
  if (!this.discountPercentage || this.discountPercentage === 0) {
    return this.price;
  }

  // Check if discount has expired
  if (this.discountExpiry && this.discountExpiry < new Date()) {
    return this.price;
  }

  const discountMultiplier = 1 - this.discountPercentage / 100;
  return Math.round(this.price * discountMultiplier * 100) / 100; // Round to 2 decimal places
});

// Virtual for discount status
productsSchema.virtual("isDiscounted").get(function () {
  if (!this.discountPercentage || this.discountPercentage === 0) {
    return false;
  }

  if (this.discountExpiry && this.discountExpiry < new Date()) {
    return false;
  }

  return true;
});

export default model("products", productsSchema);
