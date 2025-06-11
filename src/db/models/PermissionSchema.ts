import { Schema, model } from 'mongoose';
import { Permission } from '../../interface';

export interface IPermission extends Permission {}

const PermissionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['product', 'view', 'user', 'order', 'content', 'system', 'analytics', 'marketing']
    },
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
PermissionSchema.index({ code: 1 });
PermissionSchema.index({ name: 1 });
PermissionSchema.index({ category: 1 });

export default model('permissions', PermissionSchema);
