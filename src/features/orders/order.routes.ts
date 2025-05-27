import express from "express";
import {
  createNewOrder,
  createGuestOrder,
  getAllOrders,
  getOrder,
  getUserOrders,
  updateOrder,
  createPaymentIntent,
  createCheckoutSession,
  handleStripeWebhook
} from "./order.controller";
import { isLoogedIn } from "../auth/middleware/isLoogedIn";
import { ifAdmin } from "../auth/middleware/isAdmin";

const router = express.Router();

// Public routes
router.post("/", createNewOrder);
router.post("/guest", createGuestOrder);
router.post("/webhook", handleStripeWebhook);

// Protected routes
router.get("/", isLoogedIn, ifAdmin, getAllOrders);
router.get("/user", isLoogedIn, getUserOrders);
router.get("/user/:userId", isLoogedIn, ifAdmin, getUserOrders);
router.get("/:orderId", isLoogedIn, getOrder);
router.patch("/:orderId", isLoogedIn, ifAdmin, updateOrder);
router.post("/:orderId/payment-intent", isLoogedIn, createPaymentIntent);
router.post("/:orderId/checkout", createCheckoutSession);

export default router;