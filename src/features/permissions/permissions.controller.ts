import { Request, Response } from "express";
import {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  getPermissionsByCategory
} from "./permissionsDbCall";
import { PermissionDTO } from "../../dtos/RoleDto";
import { Status } from "../../interface";

/**
 * Get all permissions with pagination
 */
export async function getAllPermissionsController(req: Request, res: Response) {
  try {
    const result = await getAllPermissions(req.query as any);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    return res.json({
      success: true,
      ...result.data,
      response: result.data.response?.map(PermissionDTO as any)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching permissions"
    });
  }
}

/**
 * Get permissions by category
 */
export async function getPermissionsByCategoryController(req: Request, res: Response) {
  try {
    const { category } = req.params;
    const result = await getPermissionsByCategory(category);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    return res.json({
      success: true,
      data: result.data.map(PermissionDTO as any)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching permissions by category"
    });
  }
}

/**
 * Get a permission by ID
 */
export async function getPermissionByIdController(req: Request, res: Response) {
  try {
    const { permissionId } = req.params;
    const result = await getPermissionById(permissionId);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    return res.json({
      success: true,
      data: PermissionDTO(result.data as any)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the permission"
    });
  }
}

/**
 * Create a new permission
 */
export async function createPermissionController(req: Request, res: Response) {
  try {
    const { name, description, code, category } = req.body;

    if (!name || !description || !code || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, code, and category are required"
      });
    }

    const permissionData = {
      name,
      description,
      code,
      category,
      status: Status.ACTIVE
    };

    const result = await createPermission(permissionData);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    return res.status(201).json({
      success: true,
      data: PermissionDTO(result.data as any),
      message: "Permission created successfully"
    });
  } catch (error: any) {
    // Check for duplicate key error (code must be unique)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Permission code already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while creating the permission"
    });
  }
}

/**
 * Update a permission
 */
export async function updatePermissionController(req: Request, res: Response) {
  try {
    const { permissionId } = req.params;
    const { name, description, category, status } = req.body;

    if (!name && !description && !category && !status) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name, description, category, or status) is required for update"
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (status && Object.values(Status).includes(status)) {
      updateData.status = status;
    } else if (status) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const result = await updatePermission(permissionId, updateData);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    return res.json({
      success: true,
      data: PermissionDTO(result.data as any),
      message: "Permission updated successfully"
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the permission"
    });
  }
}

/**
 * Delete a permission (soft delete by setting status to DISABLED)
 */
export async function deletePermissionController(req: Request, res: Response) {
  try {
    const { permissionId } = req.params;
    const result = await deletePermission(permissionId);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    return res.json({
      success: true,
      message: "Permission deleted successfully"
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the permission"
    });
  }
}
