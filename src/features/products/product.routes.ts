import express from "express";
import {
  addProduct,
  applyDiscount,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProduct,
  removeDiscount,
  getTopDeals
} from "./product.controller";
import { isLoogedIn } from "../auth/middleware/isLoogedIn";
import { ifAdmin } from "../auth/middleware/isAdmin";
import { Permission } from "../../auth/permissions";
import { requirePermission } from "../../auth/middleware/hasPermission";
import fileToFileName from "src/middlewares/fileToFileName";
import ProductsSchema from "src/db/models/ProductsSchema";
import validateDocData from "src/middlewares/validateData";

const routes = express.Router();

// Public routes
routes.get("/all", getAllProducts);
routes.get("/top-deals", getTopDeals);
routes.get("/:productId", getProduct);

routes.post(
  "/",
  isLoogedIn,
  requirePermission(Permission.CREATE_PRODUCT),
  fileToFileName("images", true),
  addProduct
);

routes.put(
  "/:productId",
  isLoogedIn,
  requirePermission(Permission.EDIT_PRODUCT),
  fileToFileName("images", true),
  editProduct
);

routes.delete(
  "/:productId",
  isLoogedIn,
  requirePermission(Permission.DELETE_PRODUCT),
  deleteProduct
);

// Discount routes
routes.post(
  "/:productId/discount",
  isLoogedIn,
  requirePermission(Permission.MANAGE_DISCOUNTS),
  applyDiscount
);

routes.delete(
  "/:productId/discount",
  isLoogedIn,
  requirePermission(Permission.MANAGE_DISCOUNTS),
  removeDiscount
);

export default routes;
