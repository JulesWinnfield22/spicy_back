import { model, Schema, Document } from 'mongoose';
import { IPermission } from './PermissionSchema';
import { Role } from 'src/interface';

export interface IRole extends Role {}

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    permissions: [{
      type: Schema.Types.ObjectId,
      ref: 'permissions',
      required: true
    }],
    status: {
      type: String,
      enum: ['ACTIVE', 'DISABLED', 'PENDING'],
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster lookups
RoleSchema.index({ name: 1 });
RoleSchema.index({ status: 1 });

export default model('roles', RoleSchema);
