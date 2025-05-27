import PermissionModel from "../../db/models/PermissionSchema";
import { asyncCall, paginate, Pagination } from "../../utils/utils";
import { Status } from "../../interface";

/**
 * Get all permissions with pagination
 */
export async function getAllPermissions(query: Pagination) {
  return await asyncCall(
    paginate(PermissionModel, query, {})
  );
}

/**
 * Get permissions by category
 */
export async function getPermissionsByCategory(category: string) {
  return await asyncCall(
    PermissionModel.find({ 
      category, 
      status: Status.ACTIVE 
    })
  );
}

/**
 * Get a permission by ID
 */
export async function getPermissionById(permissionId: string) {
  return await asyncCall(
    PermissionModel.findById(permissionId)
  );
}

/**
 * Create a new permission
 */
export async function createPermission(permissionData: any) {
  return await asyncCall(
    PermissionModel.create(permissionData)
  );
}

/**
 * Update a permission
 */
export async function updatePermission(permissionId: string, updateData: any) {
  return await asyncCall(
    PermissionModel.findByIdAndUpdate(
      permissionId,
      updateData,
      { new: true }
    )
  );
}

/**
 * Delete a permission (soft delete by setting status to DISABLED)
 */
export async function deletePermission(permissionId: string) {
  return await asyncCall(
    PermissionModel.findByIdAndUpdate(
      permissionId,
      { status: Status.DISABLED },
      { new: true }
    )
  );
}
