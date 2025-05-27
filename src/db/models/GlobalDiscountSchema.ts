import { Schema, model } from "mongoose";
import { DiscountStatus } from "src/utils/utils";

const globalDiscountSchema = new Schema({
  discountPercentage: {
    type: Number,
    required: [true, "Discount percentage is required"],
    min: [0, "Discount percentage cannot be negative"],
    max: [100, "Discount percentage cannot exceed 100%"]
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
    validate: {
      validator: function(startDate: Date) {
        return startDate >= new Date();
      },
      message: "Start date must be in the future"
    }
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function(endDate: Date) {
        console.log(this);
        return endDate > new Date();
      },
      message: "End date must be after start date"
    }
  },
  status: {
    type: String,
    enum: Object.values(DiscountStatus),
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Index for automatic expirationzx
globalDiscountSchema.index({ endDate: 1 });

export default model("globalDiscount", globalDiscountSchema);