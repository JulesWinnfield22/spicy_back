import { Request, Response } from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  addPermissionsToRole,
  removePermissionsFromRole,
} from "./rolesDbCall";
import RoleDTO from "../../dtos/RoleDto";
import { Status } from "../../interface";
import { Pagination } from "../../utils/utils";

/**
 * Get all roles with pagination
 */
export async function getAllRolesController(req: Request, res: Response) {
  try {
    const qr = req.query;
    const result = await getAllRoles(qr as any);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message,
      });
    }

    return res.json({
      success: true,
      ...result.data,
      response: result.data.response.map(RoleDTO as any),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching roles",
    });
  }
}

/**
 * Get a role by ID
 */
export async function getRoleByIdController(req: Request, res: Response) {
  try {
    const { roleId } = req.params;
    const result = await getRoleById(roleId);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message,
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      data: RoleDTO(result.data as any),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the role",
    });
  }
}

/**
 * Create a new role
 */
export async function createRoleController(req: Request, res: Response) {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    const roleData = {
      name,
      description,
      permissions: permissions || [],
      status: Status.ACTIVE,
    };

    const result = await createRole(roleData);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message,
      });
    }

    return res.status(201).json({
      success: true,
      data: RoleDTO(result.data as any),
      message: "Role created successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while creating the role",
    });
  }
}

/**
 * Update a role
 */
export async function updateRoleController(req: Request, res: Response) {
  try {
    const { roleId } = req.params;
    const { name, description, status } = req.body;

    if (!name && !description && !status) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (name, description, or status) is required for update",
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (status && Object.values(Status).includes(status)) {
      updateData.status = status;
    } else if (status) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const result = await updateRole(roleId, updateData);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message,
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      data: RoleDTO(result.data as any),
      message: "Role updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the role",
    });
  }
}

/**
 * Delete a role (soft delete by setting status to DISABLED)
 */
export async function deleteRoleController(req: Request, res: Response) {
  try {
    const { roleId } = req.params;
    const result = await deleteRole(roleId);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message,
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the role",
    });
  }
}

/**
 * Add permissions to a role
 */
export async function addPermissionsToRoleController(
  req: Request,
  res: Response
) {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Permission IDs array is required",
      });
    }

    const result = await addPermissionsToRole(roleId, permissionIds);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message,
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      data: RoleDTO(result.data as any),
      message: "Permissions added to role successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while adding permissions to the role",
    });
  }
}

/**
 * Remove permissions from a role
 */
export async function removePermissionsFromRoleController(
  req: Request,
  res: Response
) {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Permission IDs array is required",
      });
    }

    const result = await removePermissionsFromRole(roleId, permissionIds);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message,
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      data: RoleDTO(result.data as any),
      message: "Permissions removed from role successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while removing permissions from the role",
    });
  }
}
