// src/features/orders/order.controller.ts
import { Request, Response } from "express";
import {
  createOrder,
  getOrderById,
  getOrders,
  getOrdersByUser,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderPaymentInfo,
} from "./ordersDbCall";
import orderModel from "../../db/models/OrderSchema";
import { asyncCall } from "../../utils/utils";

import { OrderStatus, PaymentStatus } from "../../db/models/OrderSchema";
import stripeManager from "../../utils/stripeManager";
import mongoose, { Types } from "mongoose";

import {
  checkMultipleProductsAvailability,
  reserveMultipleProductsInventory,
  releaseMultipleProductsInventory,
} from "../../utils/inventoryManager";

export async function createNewOrder(req: Request, res: Response) {
  const orderData = req.body;

  // Calculate total if not provided
  if (!orderData.total) {
    orderData.total =
      orderData.subtotal +
      (orderData.shippingCost || 0) +
      (orderData.tax || 0) -
      (orderData.discount || 0);
  }

  // Check product availability before creating the order
  const availabilityCheck = await checkMultipleProductsAvailability(
    orderData.orderItems
  );

  if (!availabilityCheck.success) {
    return res.status(400).json({
      success: false,
      message: "Some products are unavailable or have insufficient inventory",
      unavailableProducts: availabilityCheck.data?.unavailableProducts,
    });
  }

  // Create the order
  const result = await createOrder(orderData);

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.error.message,
    });
  }

  // If payment method is not STRIPE (e.g., CASH_ON_DELIVERY), reserve inventory immediately
  // For STRIPE payments, inventory will be reserved when payment is confirmed
  if (orderData.paymentInfo.paymentMethod !== "STRIPE") {
    await reserveMultipleProductsInventory(orderData.orderItems);
  }

  res.status(201).json({
    success: true,
    data: result.data,
  });
}

export async function createGuestOrder(req: Request, res: Response) {
  const {
    orderItems,
    customerInfo,
    shippingAddress,
    shippingCost = 0,
    tax = 0,
  } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order items are required",
    });
  }

  if (!customerInfo.customerEmail) {
    return res.status(400).json({
      success: false,
      message: "Customer email is required",
    });
  }

  // Check product availability before creating the order
  const availabilityCheck = await checkMultipleProductsAvailability(orderItems);

  if (!availabilityCheck.success) {
    return res.status(400).json({
      success: false,
      message: "Some products are unavailable or have insufficient inventory",
      unavailableProducts: availabilityCheck.data?.unavailableProducts,
    });
  }

  // Calculate subtotal and total
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + Number(shippingCost) + Number(tax);

  // Create customer info object with provided data or defaults
  const orderCustomerInfo = {
    fullName:
      `${customerInfo?.firstName} ${customerInfo?.lastName}` ||
      "Guest Customer",
    email: customerInfo?.customerEmail,
    phoneNumber: customerInfo?.phoneNumber || "+14165557890", // Default Canadian phone number
  };

  // Create shipping address object with provided data or defaults
  const orderShippingAddress = {
    streetAddress: shippingAddress?.streetAddress || "",
    apartment: shippingAddress?.apartment || "",
    city: shippingAddress?.city || "",
    province: shippingAddress?.province || "",
    postalCode: shippingAddress?.postalCode || "",
    country: shippingAddress?.country || "",
  };

  // Create the order data
  const orderData = {
    orderItems: orderItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      title: item.title,
      description: item.description,
      image: item.image,
    })),
    customerInfo: orderCustomerInfo,
    shippingAddress: orderShippingAddress,
    paymentInfo: {
      paymentMethod: "STRIPE",
    },
    subtotal,
    shippingCost: Number(shippingCost),
    tax: Number(tax),
    total,
  };

  // Create the order
  const result = await createOrder(orderData);

  if (result.success) {
    const stripe = await stripeManager.createCheckoutSession({
      orderId: result.data._id.toString(),
      customerEmail: customerInfo.customerEmail,
      successUrl: "http://localhost:7777/cart/success",
      cancelUrl: "http://localhost:7777/cart/cancel",
      orderItems: result.data.orderItems.map((el) => ({
        productId: el.product,
        name: el.title,
        amount: el.price,
        quantity: el.quantity,
        description: el.description,
        images: [el.image],
      })),
    });

    res.status(201).json({
      success: true,
      response: {stripe: stripe.data, data: result.data},
      message:
        "Guest order created. Proceed to checkout to complete the order.",
    });
  }

  if (result.error) {
    return res.status(400).json({
      success: false,
      message: result.error.message,
    });
  }

  // Note: For guest orders with STRIPE payment, we don't reserve inventory yet
  // Inventory will be reserved when the payment is confirmed via webhook
}

export async function getAllOrders(req: Request, res: Response) {
  const page = (req.query.page as string) || "1";
  const limit = (req.query.limit as string) || "10";

  const result = await getOrders({ page, limit });

  if (result.error) {
    return res.status(500).json({
      success: false,
      message: result.error.message,
    });
  }

  res.json({
    success: true,
    data: result.data,
  });
}

export async function getOrder(req: Request, res: Response) {
  const { orderId } = req.params;

  const result = await getOrderById(orderId);

  if (result.error) {
    return res.status(500).json({
      success: false,
      message: result.error.message,
    });
  }

  if (!result.data) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.json({
    success: true,
    data: result.data,
  });
}

export async function getUserOrders(req: Request, res: Response) {
  const userId = req.params.userId || (req.user as any)._id;
  const page = (req.query.page as string) || "1";
  const limit = (req.query.limit as string) || "10";

  const result = await getOrdersByUser(userId, { page, limit });

  if (result.error) {
    return res.status(500).json({
      success: false,
      message: result.error.message,
    });
  }

  res.json({
    success: true,
    data: result.data,
  });
}

export async function updateOrder(req: Request, res: Response) {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  if (!Object.values(OrderStatus).includes(orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  // Get the current order to check its status
  const currentOrderResult = await getOrderById(orderId);

  if (!currentOrderResult.success || !currentOrderResult.data) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const currentOrder = currentOrderResult.data;
  const oldStatus = currentOrder.orderStatus;

  // Handle inventory based on status change
  if (orderStatus !== oldStatus) {
    // If order is being cancelled or refunded, release inventory
    if (
      (orderStatus === OrderStatus.CANCELLED ||
        orderStatus === OrderStatus.REFUNDED) &&
      (oldStatus === OrderStatus.PENDING ||
        oldStatus === OrderStatus.PROCESSING ||
        oldStatus === OrderStatus.SHIPPED)
    ) {
      const releaseResult = await releaseMultipleProductsInventory(
        currentOrder.orderItems.map((item) => ({
          product: item.product.toString(),
          quantity: item.quantity,
        }))
      );

      if (!releaseResult.success) {
        console.error(
          `Failed to release inventory for order ${orderId}: ${releaseResult.error?.message}`
        );
        // Continue with status update even if inventory release fails
      } else {
        console.log(
          `Successfully released inventory for cancelled/refunded order ${orderId}`
        );
      }
    }

    // If order was cancelled/refunded and is now being processed again, reserve inventory
    if (
      (oldStatus === OrderStatus.CANCELLED ||
        oldStatus === OrderStatus.REFUNDED) &&
      (orderStatus === OrderStatus.PROCESSING ||
        orderStatus === OrderStatus.SHIPPED ||
        orderStatus === OrderStatus.DELIVERED)
    ) {
      const reserveResult = await reserveMultipleProductsInventory(
        currentOrder.orderItems.map((item) => ({
          product: item.product.toString(),
          quantity: item.quantity,
        }))
      );

      if (!reserveResult.success) {
        return res.status(400).json({
          success: false,
          message: `Cannot update order status: ${reserveResult.error?.message}`,
        });
      }

      console.log(
        `Successfully reserved inventory for reactivated order ${orderId}`
      );
    }
  }

  // Update the order status
  const result = await updateOrderStatus(orderId, orderStatus);

  if (result.error) {
    return res.status(500).json({
      success: false,
      message: result.error.message,
    });
  }

  if (!result.data) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.json({
    success: true,
    data: result.data,
  });
}

export async function createPaymentIntent(req: Request, res: Response) {
  const { orderId } = req.params;

  const orderResult = await getOrderById(orderId);

  if (orderResult.error || !orderResult.data) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const order = orderResult.data;

  if (!order.customerInfo) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  // Check product availability before creating payment intent
  const availabilityCheck = await checkMultipleProductsAvailability(
    order.orderItems.map((item) => ({
      product: item.product.toString(),
      quantity: item.quantity,
    }))
  );

  if (!availabilityCheck.success) {
    return res.status(400).json({
      success: false,
      message: "Some products are unavailable or have insufficient inventory",
      unavailableProducts: availabilityCheck.data?.unavailableProducts,
    });
  }

  // Create a Stripe customer
  const customerResult = await stripeManager.createCustomer(
    order.customerInfo.email,
    order.customerInfo.fullName,
    order.customerInfo.phoneNumber
  );

  if (!customerResult.success || !customerResult.data) {
    return res.status(500).json({
      success: false,
      message: customerResult.error,
    });
  }

  // Create a payment intent
  const amountInCents = Math.round(order.total * 100);
  const paymentIntentResult = await stripeManager.createPaymentIntent(
    amountInCents,
    "usd", // Change as needed
    { orderId: order._id.toString() }
  );

  if (!paymentIntentResult.success || !paymentIntentResult.data) {
    return res.status(500).json({
      success: false,
      message: paymentIntentResult.error,
    });
  }

  // Update order with payment intent and customer IDs
  await updateOrderPaymentInfo(orderId, {
    stripePaymentIntentId: paymentIntentResult.data.id,
    stripeCustomerId: customerResult.data.id,
  });

  res.json({
    success: true,
    clientSecret: paymentIntentResult.data.client_secret,
  });
}

export async function createCheckoutSession(req: Request, res: Response) {
  const { orderId } = req.params;
  const { successUrl, cancelUrl } = req.body;

  if (!successUrl || !cancelUrl) {
    return res.status(400).json({
      success: false,
      message: "Success URL and cancel URL are required",
    });
  }

  const orderResult = await getOrderById(orderId);

  if (!orderResult.success || !orderResult.data) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const order = orderResult.data;

  // Check product availability before creating checkout session
  const availabilityCheck = await checkMultipleProductsAvailability(
    order.orderItems.map((item) => ({
      product: item.product.toString(),
      quantity: item.quantity,
    }))
  );

  if (!availabilityCheck.success) {
    return res.status(400).json({
      success: false,
      message: "Some products are unavailable or have insufficient inventory",
      unavailableProducts: availabilityCheck.data?.unavailableProducts,
    });
  }

  // Create line items for checkout from order items
  const lineItems = order.orderItems.map((item) => ({
    productId: item.product,
    name: item.title,
    description: `Product ID: ${item.product}`,
    amount: Math.round(item.price * 100), // Convert to cents
    quantity: item.quantity,
    images: [item.image],
  }));

  // Create checkout session
  const checkoutResult = await stripeManager.createCheckoutSession({
    orderItems: lineItems,
    orderId: order._id.toString(),
    customerEmail: order.customerInfo?.email,
    successUrl,
    cancelUrl,
    metadata: {
      orderType: order.user ? "user_checkout" : "guest_checkout",
    },
  });

  if (!checkoutResult.success || !checkoutResult.data) {
    return res.status(500).json({
      success: false,
      message: checkoutResult.error || "Failed to create checkout session",
    });
  }

  // Update order with checkout session ID
  await updateOrderPaymentInfo(orderId, {
    stripePaymentIntentId: checkoutResult.data.payment_intent as string,
  });

  res.json({
    success: true,
    checkoutUrl: checkoutResult.data.url,
    sessionId: checkoutResult.data.id,
  });
}

export async function handleStripeWebhook(req: Request, res: Response) {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV !== "production";
  const signature = req.headers["stripe-signature"] as string;
  console.log("Stripe signature:", signature);

  let event;

  // In development mode, we might want to allow testing without a signature
  if (!signature) {
    console.warn("Webhook Warning: No Stripe signature found");

    if (isDevelopment && req.body.type) {
      // For testing in development, allow direct event objects
      console.log("Development mode: Using raw event object for testing");
      event = req.body;
    } else {
      return res.status(400).json({
        success: false,
        message: "No Stripe signature found",
      });
    }
  } else {
    // Normal flow with signature verification
    const eventResult = await stripeManager.handleWebhookEvent(
      req.body,
      signature
    );

    if (!eventResult.success || !eventResult.data) {
      console.error(`Webhook Error: ${eventResult.error}`);
      return res.status(400).json({
        success: false,
        message: eventResult.error,
      });
    }

    event = eventResult.data;
  }

  console.log(`Webhook received: ${event.type}`);

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Get the order to update inventory
        const orderResult = await getOrderById(orderId);
        if (orderResult.success && orderResult.data) {
          const order = orderResult.data;

          // Log whether this is a user order or guest order
          const orderType = order.user ? "user order" : "guest order";
          console.log(
            `Processing payment for ${orderType} with ID: ${orderId}`
          );

          // Reserve inventory for the ordered items
          const inventoryResult = await reserveMultipleProductsInventory(
            order.orderItems.map((el) => ({
              product: el.product.toString(),
              quantity: el.quantity as number,
            }))
          );

          if (!inventoryResult.success) {
            console.error(
              `Failed to reserve inventory for ${orderType} ${orderId}: ${inventoryResult.error?.message}`
            );
            // Continue processing the order even if inventory update fails
            // This is a business decision - you might want to handle this differently
          } else {
            console.log(
              `Successfully reserved inventory for ${orderType} ${orderId}`
            );
          }
        }

        // Update order payment status
        await updatePaymentStatus(orderId, PaymentStatus.PAID);
        await updateOrderStatus(orderId, OrderStatus.PROCESSING);

        // Update payment info with last 4 digits if available
        // Note: In a real implementation, you would need to retrieve the payment method
        // to get the card details, as they're not directly on the PaymentIntent
        const paymentMethod =
          await stripeManager.stripe.paymentMethods.retrieve(
            paymentIntent.payment_method as string
          );

        if (paymentMethod.card?.last4) {
          await updateOrderPaymentInfo(orderId, {
            lastFourDigits: paymentMethod.card.last4,
          });
        }

        break;
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        const failedOrderId = failedPaymentIntent.metadata.orderId;

        // No need to release inventory as it wasn't reserved yet
        // (inventory is only reserved on successful payment)

        // Update order payment status
        await updatePaymentStatus(failedOrderId, PaymentStatus.FAILED);

        break;
      case "checkout.session.completed":
        const session = event.data.object;
        const checkoutOrderId = session.metadata?.orderId;

        if (!checkoutOrderId) {
          console.error("No orderId found in session metadata");
          break;
        }

        // Get the order to update inventory
        const checkoutOrderResult = await getOrderById(checkoutOrderId);
        if (checkoutOrderResult.success && checkoutOrderResult.data) {
          const checkoutOrder = checkoutOrderResult.data;

          // Determine if this is a user order or guest order
          const orderType = checkoutOrder.user
            ? "user checkout"
            : "guest checkout";
          console.log(
            `Processing ${orderType} for order ID: ${checkoutOrderId}`
          );

          // Reserve inventory for the ordered items
          const checkoutInventoryResult =
            await reserveMultipleProductsInventory(
              checkoutOrder.orderItems.map((el) => ({
                product: el.product.toString(),
                quantity: el.quantity as number,
              }))
            );

          if (!checkoutInventoryResult.success) {
            console.error(
              `Failed to reserve inventory for ${orderType} ${checkoutOrderId}: ${checkoutInventoryResult.error?.message}`
            );
            // Continue processing the order even if inventory update fails
          } else {
            console.log(
              `Successfully reserved inventory for ${orderType} ${checkoutOrderId}`
            );
          }
        }

        // Update order payment status
        await updatePaymentStatus(checkoutOrderId, PaymentStatus.PAID);
        await updateOrderStatus(checkoutOrderId, OrderStatus.PROCESSING);

        // Update customer information if available from checkout
        if (session.customer_details) {
          // Get the order to update
          const orderToUpdate = await getOrderById(checkoutOrderId);

          if (orderToUpdate.success && orderToUpdate.data) {
            const order = orderToUpdate.data;

            // Create updated customer info
            const customerInfo = order.customerInfo || {
              fullName: "Guest Customer",
              email: "",
              phoneNumber: "",
            };

            const updatedCustomerInfo = {
              ...customerInfo,
              fullName: session.customer_details.name || customerInfo.fullName,
              email: session.customer_details.email || customerInfo.email,
              phoneNumber:
                session.customer_details.phone || customerInfo.phoneNumber,
            };

            // Create updated shipping address if available
            let updatedShippingAddress = order.shippingAddress;
            if (session.customer_details.address) {
              updatedShippingAddress = {
                streetAddress: session.customer_details.address.line1 || "",
                apartment: session.customer_details.address.line2 || "",
                city: session.customer_details.address.city || "",
                province: session.customer_details.address.state || "",
                postalCode: session.customer_details.address.postal_code || "",
                country: session.customer_details.address.country || "",
              };
            }

            // Update the order with the new information
            await asyncCall(
              orderModel.findByIdAndUpdate(
                checkoutOrderId,
                {
                  customerInfo: updatedCustomerInfo,
                  shippingAddress: updatedShippingAddress,
                },
                { new: true }
              )
            );
          }
        }

        // If there's a payment intent, we can get the payment method details
        if (session.payment_intent) {
          const checkoutPaymentIntent =
            await stripeManager.stripe.paymentIntents.retrieve(
              session.payment_intent as string
            );

          if (checkoutPaymentIntent.payment_method) {
            const checkoutPaymentMethod =
              await stripeManager.stripe.paymentMethods.retrieve(
                checkoutPaymentIntent.payment_method as string
              );

            if (checkoutPaymentMethod.card?.last4) {
              await updateOrderPaymentInfo(checkoutOrderId, {
                lastFourDigits: checkoutPaymentMethod.card.last4,
                stripePaymentIntentId: session.payment_intent as string,
              });
            }
          }
        }

        break;
      case "checkout.session.async_payment_succeeded":
        // Handle asynchronous payment success (e.g., bank transfers)
        const asyncSession = event.data.object;
        const asyncOrderId = asyncSession.metadata?.orderId;

        if (asyncOrderId) {
          // Get the order to update inventory
          const asyncOrderResult = await getOrderById(asyncOrderId);
          if (asyncOrderResult.success && asyncOrderResult.data) {
            const asyncOrder = asyncOrderResult.data;

            // Determine if this is a user order or guest order
            const orderType = asyncOrder.user
              ? "user async payment"
              : "guest async payment";
            console.log(
              `Processing ${orderType} for order ID: ${asyncOrderId}`
            );

            // Reserve inventory for the ordered items
            const asyncInventoryResult = await reserveMultipleProductsInventory(
              asyncOrder.orderItems.map((item) => ({
                product: item.product.toString(),
                quantity: item.quantity,
              }))
            );

            if (!asyncInventoryResult.success) {
              console.error(
                `Failed to reserve inventory for ${orderType} ${asyncOrderId}: ${asyncInventoryResult.error?.message}`
              );
              // Continue processing the order even if inventory update fails
            } else {
              console.log(
                `Successfully reserved inventory for ${orderType} ${asyncOrderId}`
              );
            }
          }

          await updatePaymentStatus(asyncOrderId, PaymentStatus.PAID);
          await updateOrderStatus(asyncOrderId, OrderStatus.PROCESSING);
          console.log(
            `Order ${asyncOrderId} payment succeeded via async payment`
          );
        }
        break;

      case "checkout.session.async_payment_failed":
        // Handle asynchronous payment failure
        const failedAsyncSession = event.data.object;
        const failedAsyncOrderId = failedAsyncSession.metadata?.orderId;

        if (failedAsyncOrderId) {
          // No need to release inventory as it wasn't reserved yet
          // (inventory is only reserved on successful payment)

          await updatePaymentStatus(failedAsyncOrderId, PaymentStatus.FAILED);
          console.log(
            `Order ${failedAsyncOrderId} payment failed via async payment`
          );
        }
        break;

      case "charge.succeeded":
        // Additional confirmation that payment was successful
        const charge = event.data.object;
        const chargePaymentIntentId = charge.payment_intent;

        if (chargePaymentIntentId) {
          // Find the order with this payment intent ID
          const orderWithPaymentIntent = await asyncCall(
            orderModel.findOne({
              "paymentInfo.stripePaymentIntentId": chargePaymentIntentId,
            })
          );

          if (orderWithPaymentIntent.success && orderWithPaymentIntent.data) {
            const orderToUpdate = orderWithPaymentIntent.data;
            await updatePaymentStatus(
              orderToUpdate._id.toString(),
              PaymentStatus.PAID
            );
            console.log(
              `Order ${orderToUpdate._id} payment confirmed via charge.succeeded`
            );
          }
        }
        break;

      case "charge.failed":
        // Handle charge failure
        const failedCharge = event.data.object;
        const failedChargePaymentIntentId = failedCharge.payment_intent;

        if (failedChargePaymentIntentId) {
          // Find the order with this payment intent ID
          const orderWithFailedCharge = await asyncCall(
            orderModel.findOne({
              "paymentInfo.stripePaymentIntentId": failedChargePaymentIntentId,
            })
          );

          if (orderWithFailedCharge.success && orderWithFailedCharge.data) {
            const orderToUpdate = orderWithFailedCharge.data;

            // Check if the order was previously paid and inventory was reserved
            if (orderToUpdate.paymentStatus === PaymentStatus.PAID) {
              // Release the inventory that was reserved
              const releaseResult = await releaseMultipleProductsInventory(
                orderToUpdate.orderItems.map((item) => ({
                  product: item.product.toString(),
                  quantity: item.quantity,
                }))
              );

              if (!releaseResult.success) {
                console.error(
                  `Failed to release inventory for order ${orderToUpdate._id}: ${releaseResult.error?.message}`
                );
              } else {
                console.log(
                  `Successfully released inventory for order ${orderToUpdate._id} due to charge failure`
                );
              }
            }

            await updatePaymentStatus(
              orderToUpdate._id.toString(),
              PaymentStatus.FAILED
            );
            console.log(
              `Order ${orderToUpdate._id} payment failed via charge.failed`
            );
          }
        }
        break;

      default:
        // Log unhandled event types
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(
      `Error processing webhook: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    // Don't return an error response to Stripe - they'll retry the webhook
    // Just log the error and return a 200 OK
  }

  // Always return a 200 OK to Stripe to acknowledge receipt of the webhook
  res.json({ received: true });
}
