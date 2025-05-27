import productModel from "../db/models/ProductsSchema";
import { asyncCall } from "./utils";
import { logger } from "./logger";
import mongoose from "mongoose";
import { ProductsStatus } from "./utils";

/**
 * Check if a product has sufficient inventory
 * @param productId Product ID to check
 * @param requestedQuantity Quantity requested
 * @returns Result with success/error and available quantity
 */
export async function checkProductAvailability(
  productId: string,
  requestedQuantity: number
) {
  try {
    const product = await productModel.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      status: ProductsStatus.VISIBLE,
    });

    if (!product) {
      return {
        success: false,
        error: new Error("Product not found"),
        data: null,
        timestamp: new Date(),
      };
    }

    const available = product.quantity >= requestedQuantity;

    return {
      success: available,
      error: available
        ? null
        : new Error(
            `Insufficient inventory. Only ${product.quantity} available.`
          ),
      data: {
        productId,
        availableQuantity: product.quantity,
        requestedQuantity,
        isAvailable: available,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error(`Error checking product availability: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error checking product availability"),
      data: null,
      timestamp: new Date(),
    };
  }
}

/**
 * Check if multiple products have sufficient inventory
 * @param items Array of product IDs and quantities
 * @returns Result with success/error and availability details
 */
export async function checkMultipleProductsAvailability(
  items: Array<{ product: string; quantity: number }>
) {
  try {
    const productIds = items.map((item) => item.product);

    const result = await asyncCall(
      productModel.find({
        product_id: { $in: productIds },
        status: ProductsStatus.VISIBLE,
      })
    );

    if (result.error) {
      return {
        error: result.error.message,
        success: false,
      };
    }

    // Create a map for quick lookup
    const productMap = new Map();
    result.data.forEach((product) => {
      productMap.set(product.product_id?.toString?.(), product);
    });

    // Check availability for each item
    const availabilityResults = items.map((item) => {
      const product = productMap.get(item.product);

      if (!product) {
        return {
          product_id: item.product,
          availableQuantity: 0,
          requestedQuantity: item.quantity,
          isAvailable: false,
          error: "Product not found",
        };
      }

      const available = product.quantity >= item.quantity;

      return {
        product_id: item.product,
        title: product.title,
        availableQuantity: product.quantity,
        requestedQuantity: item.quantity,
        isAvailable: available,
        error: available
          ? null
          : `Insufficient inventory. Only ${product.quantity} available.`,
      };
    });

    // Check if all products are available
    const allAvailable = availabilityResults.every(
      (result) => result.isAvailable
    );

    // Get unavailable products
    const unavailableProducts = availabilityResults.filter(
      (result) => !result.isAvailable
    );

    return {
      success: allAvailable,
      error: allAvailable
        ? null
        : new Error(
            "Some products are unavailable or have insufficient inventory"
          ),
      data: {
        allAvailable,
        availabilityResults,
        unavailableProducts,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error(`Error checking multiple products availability: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error checking products availability"),
      data: null,
      timestamp: new Date(),
    };
  }
}

/**
 * Reserve inventory for a product (reduce quantity)
 * @param productId Product ID
 * @param quantity Quantity to reserve
 * @returns Result with success/error
 */
export async function reserveProductInventory(
  productId: string,
  quantity: number
) {
  return await asyncCall(
    productModel.findByIdAndUpdate(
      productId,
      { $inc: { quantity: -quantity } },
      { new: true }
    )
  );
}

/**
 * Reserve inventory for multiple products
 * @param items Array of product IDs and quantities
 * @returns Result with success/error and updated products
 */
export async function reserveMultipleProductsInventory(
  items: Array<{ product: string; quantity: number }>
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedProducts = [];

    for (const item of items) {
      const result = await productModel.findOneAndUpdate(
        { product_id: item.product },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );

      if (!result) {
        // If any product update fails, abort the transaction
        await session.abortTransaction();
        session.endSession();

        return {
          success: false,
          error: new Error(`Product ${item.product} not found`),
          data: null,
          timestamp: new Date(),
        };
      }

      // Check if the quantity went negative
      if (result.quantity < 0) {
        await session.abortTransaction();
        session.endSession();

        return {
          success: false,
          error: new Error(
            `Insufficient inventory for product ${result.title}`
          ),
          data: null,
          timestamp: new Date(),
        };
      }

      updatedProducts.push(result);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      error: null,
      data: updatedProducts,
      timestamp: new Date(),
    };
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error reserving inventory: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error reserving inventory"),
      data: null,
      timestamp: new Date(),
    };
  }
}

/**
 * Release reserved inventory (increase quantity)
 * @param productId Product ID
 * @param quantity Quantity to release
 * @returns Result with success/error
 */
export async function releaseProductInventory(
  productId: string,
  quantity: number
) {
  return await asyncCall(
    productModel.findByIdAndUpdate(
      productId,
      { $inc: { quantity: quantity } },
      { new: true }
    )
  );
}

/**
 * Release inventory for multiple products
 * @param items Array of product IDs and quantities
 * @returns Result with success/error
 */
export async function releaseMultipleProductsInventory(
  items: Array<{ product: string; quantity: number }>
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedProducts = [];

    for (const item of items) {
      const result = await productModel.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: item.quantity } },
        { new: true, session }
      );

      if (!result) {
        // If any product update fails, abort the transaction
        await session.abortTransaction();
        session.endSession();

        return {
          success: false,
          error: new Error(`Product ${item.product} not found`),
          data: null,
          timestamp: new Date(),
        };
      }

      updatedProducts.push(result);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      error: null,
      data: updatedProducts,
      timestamp: new Date(),
    };
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error releasing inventory: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error releasing inventory"),
      data: null,
      timestamp: new Date(),
    };
  }
}

/**
 * Update the order status and handle inventory accordingly
 * @param orderId Order ID
 * @param newStatus New order status
 * @param oldStatus Previous order status
 * @returns Result with success/error
 */
export async function handleInventoryForOrderStatusChange(
  orderItems: Array<{ product: string; quantity: number }>,
  newStatus: string,
  oldStatus: string
) {
  // If order is cancelled or refunded, release the inventory
  if (
    (newStatus === "CANCELLED" || newStatus === "REFUNDED") &&
    (oldStatus === "PENDING" ||
      oldStatus === "PROCESSING" ||
      oldStatus === "SHIPPED")
  ) {
    return await releaseMultipleProductsInventory(orderItems);
  }

  // If order was cancelled or refunded and is now being processed again, reserve inventory
  if (
    (oldStatus === "CANCELLED" || oldStatus === "REFUNDED") &&
    (newStatus === "PROCESSING" ||
      newStatus === "SHIPPED" ||
      newStatus === "DELIVERED")
  ) {
    return await reserveMultipleProductsInventory(orderItems);
  }

  // For other status changes, no inventory action needed
  return {
    success: true,
    error: null,
    data: null,
    timestamp: new Date(),
  };
}
