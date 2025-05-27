import { NextFunction, Request, Response } from "express";
import { Permission as LegacyPermission, hasPermission as legacyHasPermission, hasAllPermissions as legacyHasAllPermissions, hasAnyPermission as legacyHasAnyPermission } from "../permissions";
import { Role as LegacyRole, getPermissionsForRole } from "../roles";
import mongoose from "mongoose";
import Role from "../../db/models/RoleSchema";
import PermissionModel from "../../db/models/PermissionSchema";

/**
 * Middleware to check if a user has a specific permission
 * @param permissionCode The permission code to check
 * @returns Express middleware
 */
export const requirePermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If no user is attached to the request, deny access
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized - User not authenticated",
        });
      }

      // Get user permissions
      const hasPermission = await checkUserPermission(req.user, permissionCode);

      // Check if user has the required permission
      if (hasPermission) {
        return next();
      }

      // If not, deny access
      return res.status(403).json({
        message: "Forbidden - Insufficient permissions",
      });
    } catch (error) {
      console.error("Error checking permission:", error);
      return res.status(500).json({
        message: "Internal server error while checking permissions",
      });
    }
  };
};

/**
 * Middleware to check if a user has all of the specified permissions
 * @param permissionCodes Array of permission codes to check
 * @returns Express middleware
 */
export const requireAllPermissions = (permissionCodes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If no user is attached to the request, deny access
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized - User not authenticated",
        });
      }

      // Check all permissions
      for (const code of permissionCodes) {
        const hasPermission = await checkUserPermission(req.user, code);
        if (!hasPermission) {
          return res.status(403).json({
            message: "Forbidden - Insufficient permissions",
          });
        }
      }

      // If all permissions are granted, proceed
      return next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      return res.status(500).json({
        message: "Internal server error while checking permissions",
      });
    }
  };
};

/**
 * Middleware to check if a user has any of the specified permissions
 * @param permissionCodes Array of permission codes to check
 * @returns Express middleware
 */
export const requireAnyPermission = (permissionCodes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If no user is attached to the request, deny access
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized - User not authenticated",
        });
      }

      // Check if user has any of the required permissions
      for (const code of permissionCodes) {
        const hasPermission = await checkUserPermission(req.user, code);
        if (hasPermission) {
          return next();
        }
      }

      // If no permissions are granted, deny access
      return res.status(403).json({
        message: "Forbidden - Insufficient permissions",
      });
    } catch (error) {
      console.error("Error checking permissions:", error);
      return res.status(500).json({
        message: "Internal server error while checking permissions",
      });
    }
  };
};

/**
 * Helper function to check if a user has a specific permission
 * Handles both the new roles/permissions system and the legacy role system
 * @param user User object
 * @param permissionCode Permission code to check
 * @returns Boolean indicating if user has the permission
 */
export async function checkUserPermission(user: any, permissionCode: string): Promise<boolean> {
  try {
    // First, try to use the new role-based system
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Check if roles are already populated
      const roleIds = user.roles.map((role: any) => {
        if (typeof role === 'string' || role instanceof mongoose.Types.ObjectId) {
          return role;
        } else if (role._id) {
          return role._id;
        }
        return null;
      }).filter(Boolean);

      if (roleIds.length > 0) {
        // Find the permission by code
        const permission = await PermissionModel.findOne({ code: permissionCode });

        if (!permission) {
          console.warn(`Permission with code ${permissionCode} not found in database`);
          return false;
        }

        // Find roles that have this permission
        const roles = await Role.find({
          _id: { $in: roleIds },
          permissions: permission._id
        });

        return roles.length > 0;
      }
    }

    // Fall back to legacy system if new system check fails
    // Try to convert the permission code to a legacy permission enum
    try {
      const legacyPermission = permissionCode as LegacyPermission;

      // Check legacy permissions array
      if (user.legacyPermissions && Array.isArray(user.legacyPermissions) && user.legacyPermissions.length > 0) {
        return legacyHasPermission(user.legacyPermissions as LegacyPermission[], legacyPermission);
      }

      // Check legacy roles array
      if (user.legacyRoles && Array.isArray(user.legacyRoles) && user.legacyRoles.length > 0) {
        const permissions = user.legacyRoles.flatMap((role: string) =>
          getPermissionsForRole(role as LegacyRole)
        );
        return legacyHasPermission(permissions, legacyPermission);
      }

      // Check legacy role field
      if (user.role) {
        const permissions = getPermissionsForRole(user.role as LegacyRole);
        return legacyHasPermission(permissions, legacyPermission);
      }
    } catch (error) {
      console.warn("Error checking legacy permissions:", error);
    }

    // If all checks fail, deny permission
    return false;
  } catch (error) {
    console.error("Error in checkUserPermission:", error);
    return false;
  }
}
