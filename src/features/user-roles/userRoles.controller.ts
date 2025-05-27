import { Request, Response } from "express";
import { 
  assignRolesToUser, 
  getUserRoles, 
  removeRolesFromUser 
} from "./userRolesDbCall";
import UserDTO from "../../dtos/UserDTO";
import RoleDTO from "../../dtos/RoleDto";

/**
 * Get roles for a specific user
 */
export async function getUserRolesController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const result = await getUserRoles(userId);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      data: {
        user: UserDTO(result.data),
        roles: result.data.roles?.map(RoleDTO) || []
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching user roles"
    });
  }
}

/**
 * Assign roles to a user
 */
export async function assignRolesToUserController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Role IDs array is required"
      });
    }

    const result = await assignRolesToUser(userId, roleIds);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      data: {
        user: UserDTO(result.data),
        roles: result.data.roles?.map(RoleDTO) || []
      },
      message: "Roles assigned to user successfully"
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while assigning roles to the user"
    });
  }
}

/**
 * Remove roles from a user
 */
export async function removeRolesFromUserController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Role IDs array is required"
      });
    }

    const result = await removeRolesFromUser(userId, roleIds);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error.message
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      data: {
        user: UserDTO(result.data),
        roles: result.data.roles?.map(RoleDTO) || []
      },
      message: "Roles removed from user successfully"
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while removing roles from the user"
    });
  }
}
