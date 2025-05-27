import mongoose from "mongoose";
import RoleModel from "../../db/models/RoleSchema";
import { asyncCall, paginate, Pagination } from "../../utils/utils";
import { Role, Status } from "../../interface";
import PermissionModel from "../../db/models/PermissionSchema";
/**
 * Get all roles with pagination
 */
export async function getAllRoles(query: Pagination) {
  return await asyncCall(
    paginate(RoleModel, query, {}, ["permissions"])
  );
}

/**
 * Get a role by ID
 */
export async function getRoleById(roleId: string) {
  return await asyncCall(
    RoleModel.findById(roleId).populate("permissions")
  );
}

/**
 * Create a new role
 */
export async function createRole(roleData: any) {
  return await asyncCall(
    RoleModel.create(roleData)
  );
}

/**
 * Update a role
 */
export async function updateRole(roleId: string, updateData: any) {
  return await asyncCall(
    RoleModel.findByIdAndUpdate(
      roleId,
      updateData,
      { new: true }
    ).populate("permissions")
  );
}

/**
 * Delete a role (soft delete by setting status to DISABLED)
 */
export async function deleteRole(roleId: string) {
  return await asyncCall(
    RoleModel.findByIdAndUpdate(
      roleId,
      { status: Status.DISABLED },
      { new: true }
    )
  );
}

/**
 * Add permissions to a role
 */
export async function addPermissionsToRole(roleId: string, permissionIds: string[]) {
  return await asyncCall(
    RoleModel.findByIdAndUpdate(
      roleId,
      {
        $addToSet: {
          permissions: {
            $each: permissionIds.map(id => new mongoose.Types.ObjectId(id))
          }
        }
      },
      { new: true }
    ).populate("permissions")
  );
}

/**
 * Remove permissions from a role
 */
export async function removePermissionsFromRole(roleId: string, permissionIds: string[]) {
  return await asyncCall(
    RoleModel.findByIdAndUpdate(
      roleId,
      {
        $pull: {
          permissions: {
            $in: permissionIds.map(id => new mongoose.Types.ObjectId(id))
          }
        }
      },
      { new: true }
    ).populate("permissions")
  );
}
