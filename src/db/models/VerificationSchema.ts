import { model, Schema } from "mongoose";

const VerificationSchema = new Schema(
  {
    email: {
      type: String,
      index: true,
      required: [true, "This Field is required"],
      validate: {
        validator: (value: string) => {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: "Not a Valid Email",
      },
    },
    code: {
      type: String,
      required: true,
    },
		used: {
			type: Boolean,
			default: false
		}
  },
  {
    timestamps: true,
  }
);

export default model('verification', VerificationSchema)