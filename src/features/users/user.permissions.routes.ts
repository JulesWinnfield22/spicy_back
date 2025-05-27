import express from "express";
import { changePassword, getAllUsers, removeUser, updateUser } from "./user.controller";
import { isLoogedIn } from "../auth/middleware/isLoogedIn";
import { validatePassword } from "../auth/middleware/validatePassword";
import { Permission } from "../../auth/permissions";
import { requirePermission, requireAllPermissions } from "../../auth/middleware/hasPermission";

/**
 * Example of how to use the new permission-based middleware
 * This is an alternative to the existing user.routes.ts that uses the new permission system
 */
const routes = express.Router();

// Route that requires a single permission
routes.put(
  "/change_password",
  isLoogedIn, // First authenticate the user
  requirePermission(Permission.UPDATE_USER), // Then check for specific permission
  changePassword
);

// Route that requires multiple permissions
routes.patch(
  "/remove/:userId", 
  isLoogedIn,
  requirePermission(Permission.DELETE_USER),
  removeUser
);

// Route that requires a single permission
routes.get(
  "/all", 
  isLoogedIn,
  requirePermission(Permission.VIEW_USERS),
  getAllUsers
);

// Route that requires multiple permissions
routes.put(
  "/:userId", 
  isLoogedIn,
  requireAllPermissions([Permission.VIEW_USERS, Permission.UPDATE_USER]),
  updateUser
);

export default routes;
