import { alpha } from "../../utils/utils";
import { Schema, model } from "mongoose";

const AboutusSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
		  trim: true,
      minLength: 3,
      maxLength: 25,
      required: [true, "This Field is required"],
    },
    description: {
      type: String,
      trim: true,
      minLength: 20,
      maxLength: 500,
      required: [true, "This Field is required"],
    },
    aboutus_photo: {
      type: String,
      required: [true, "This Field is required"],
    },
    image_tag: {
      type: String,
      minLength: 10,
      maxLength: 30,
    }
  },
  {
    timestamps: true,
  }
);

export default model("about", AboutusSchema);
