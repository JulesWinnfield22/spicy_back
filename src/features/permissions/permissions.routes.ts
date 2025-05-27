import express from "express";
import { isLoogedIn } from "../auth/middleware/isLoogedIn";
import { requirePermission } from "../../auth/middleware/hasPermission";
import { Permission } from "../../auth/permissions";
import {
  getAllPermissionsController,
  getPermissionByIdController,
  createPermissionController,
  updatePermissionController,
  deletePermissionController,
  getPermissionsByCategoryController
} from "./permissions.controller";

const router = express.Router();

// Get all permissions
router.get(
  "/",
  isLoogedIn,
  requirePermission(Permission.VIEW_USERS),
  getAllPermissionsController
);

// Get permissions by category
router.get(
  "/category/:category",
  isLoogedIn,
  requirePermission(Permission.VIEW_USERS),
  getPermissionsByCategoryController
);

// Get a permission by ID
router.get(
  "/:permissionId",
  isLoogedIn,
  requirePermission(Permission.VIEW_USERS),
  getPermissionByIdController
);

// Create a new permission
router.post(
  "/",
  isLoogedIn,
  requirePermission(Permission.CREATE_USER),
  createPermissionController
);

// Update a permission
router.put(
  "/:permissionId",
  isLoogedIn,
  requirePermission(Permission.UPDATE_USER),
  updatePermissionController
);

// Delete a permission
router.delete(
  "/:permissionId",
  isLoogedIn,
  requirePermission(Permission.DELETE_USER),
  deletePermissionController
);

export default router;
