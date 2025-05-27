import { Status, User } from "../../interface";
import { alpha } from "../../utils/utils";
import { Schema, model } from "mongoose";
// Import legacy roles and permissions for backward compatibility during migration
import { Role as LegacyRole } from "../../auth/roles";
import { Permission as LegacyPermission } from "../../auth/permissions";

const UserSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      minLength: 3,
      trim: true,
      maxLength: 25,
      required: [true, "This Field is required"],
      validate: {
        validator: alpha,
        message: "Must only Contain Letters",
      },
    },
    fathersName: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 25,
      required: [true, "This Field is required"],
      validate: {
        validator: alpha,
        message: "Must only Contain Letters",
      },
    },
    grandFathersName: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 25,
      required: false,
      validate: {
        validator: alpha,
        message: "Must only Contain Letters",
      },
    },
    profile_pic: {
      trim: true,
      type: String,
    },
    // New fields for enhanced roles and permissions system
    roles: [{
      type: Schema.Types.ObjectId,
      ref: 'roles'
    }],
    email: {
      type: String,
      unique: true,
      index: true,
      required: [true, "This Field is required"],
      validate: {
        validator: (value: string) => {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: "Not a Valid Email",
      },
    },
    phone_number: {
      type: String,
      unique: true,
      index: true,
      required: [true, "This Field is required"],
      validate: {
        validator: (value: string) => {
          return /^(\+?251(9|7)|(09|07))[0-9]{8}$/.test(value);
        },
        message: "Not a Valid Phone Number",
      },
    },
    password: {
      type: String,
      unique: true,
      required: [true, "This Field is required"],
    },
    salt: {
      unique: true,
      type: String,
      required: [true, "This Field is required"],
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

export default model("users", UserSchema);
