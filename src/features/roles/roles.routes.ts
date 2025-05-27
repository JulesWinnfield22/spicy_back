import express from "express";
import { isLoogedIn } from "../auth/middleware/isLoogedIn";
import { requirePermission } from "../../auth/middleware/hasPermission";
import { Permission } from "../../auth/permissions";
import {
  getAllRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
  addPermissionsToRoleController,
  removePermissionsFromRoleController
} from "./roles.controller";

const router = express.Router();

router.get(
  "/",
  // isLoogedIn,
  // requirePermission(Permission.VIEW_USERS),
  getAllRolesController
);

router.get(
  "/:roleId",
  isLoogedIn,
  requirePermission(Permission.VIEW_USERS),
  getRoleByIdController
);

router.post(
  "/",
  isLoogedIn,
  requirePermission(Permission.CREATE_USER),
  createRoleController
);

router.put(
  "/:roleId",
  isLoogedIn,
  requirePermission(Permission.UPDATE_USER),
  updateRoleController
);

router.delete(
  "/:roleId",
  isLoogedIn,
  requirePermission(Permission.DELETE_USER),
  deleteRoleController
);

router.post(
  "/:roleId/permissions",
  isLoogedIn,
  requirePermission(Permission.UPDATE_USER),
  addPermissionsToRoleController
);

router.delete(
  "/:roleId/permissions",
  isLoogedIn,
  requirePermission(Permission.UPDATE_USER),
  removePermissionsFromRoleController
);

export default router;
