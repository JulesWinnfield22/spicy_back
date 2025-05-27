import express from "express";
import {
  addGlobalDiscount,
  deactivateDiscount,
  editGlobalDiscount,
  getAllGlobalDiscounts,
  getGlobalDiscount,
  addProductDiscount,
  removeDiscount,
} from "./global_discount.controller";
import { isLoogedIn } from "../auth/middleware/isLoogedIn";
import { requirePermission } from "../../auth/middleware/hasPermission";
import { Permission } from "../../auth/permissions";

const router = express.Router();

router.get("/", getAllGlobalDiscounts);

router.get("/:discountId", getGlobalDiscount);

router.put(
  "/",
  isLoogedIn,
  requirePermission(Permission.CREATE_DISCOUNT),
  addGlobalDiscount
);

router.post(
  "/product/:productId",
  isLoogedIn,
  requirePermission(Permission.CREATE_DISCOUNT),
  addProductDiscount
);

router.delete(
  "/product/:productId",
  isLoogedIn,
  requirePermission(Permission.DELETE_DISCOUNT),
  removeDiscount
);

router.put(
  "/:discountId",
  isLoogedIn,
  requirePermission(Permission.EDIT_DISCOUNT),
  editGlobalDiscount
);

router.delete(
  "/:discountId",
  isLoogedIn,
  requirePermission(Permission.DELETE_DISCOUNT),
  deactivateDiscount
);

export default router;
