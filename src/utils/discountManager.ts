import GlobalDiscount from "../db/models/GlobalDiscountSchema";
import Products from "../db/models/ProductsSchema";
import { logger } from "./logger";
import { asyncCall, DiscountStatus } from "./utils";

export async function applyGlobalDiscount(
  percentage: number,
  startDate: Date,
  endDate: Date
) {
  const discountResult = await asyncCall(
    GlobalDiscount.create({
      discountPercentage: percentage,
      startDate,
      endDate,
    })
  );

  if (!discountResult.success) {
    logger.error("Failed to create global discount", discountResult.error);
    return discountResult;
  }

  // Apply discount only to products without a specific discount
  const updateResult = await asyncCall(
    Products.updateMany(
      {
        $or: [
          { discountPercentage: 0 },
          { discountPercentage: { $exists: false } },
        ],
      },
      {
        $set: {
          discountPercentage: percentage,
          discountExpiry: endDate,
        },
      }
    )
  );

  if (!updateResult.success) {
    logger.error(
      "Failed to apply global discount to products",
      updateResult.error
    );
  } else {
    logger.info(
      `Applied ${percentage}% global discount to ${updateResult.data.modifiedCount} products`
    );
  }

  return discountResult;
}

export async function resetExpiredDiscounts() {
  const now = new Date();
  logger.info("Checking for expired product discounts");

  const result = await asyncCall(
    Products.updateMany(
      {
        discountExpiry: { $lte: now },
      },
      {
        $set: {
          discountPercentage: 0,
          discountExpiry: null,
        },
      }
    )
  );

  if (result.success) {
    logger.info(`Reset ${result.data.modifiedCount} expired product discounts`);
  } else {
    logger.error("Failed to reset expired product discounts", result.error);
  }

  return result;
}

export async function applyProductDiscount(
  productId: string,
  discountPercentage: number,
  endDate: Date
) {
  const result = await asyncCall(
    Products.findOneAndUpdate(
      {
        product_id: productId,
      },
      {
        $set: {
          discountPercentage,
          discountExpiry: endDate,
        },
      },
      { new: true }
    )
  );

  if (result.success) {
    logger.info(
      `Applied ${discountPercentage}% discount to product ${productId}`
    );
  } else {
    logger.error(
      `Failed to apply discount to product ${productId}`,
      result.error
    );
  }

  return result;
}

export async function removeProductDiscount(productId: string) {
  // First, get the current product to check its discount
  const productResult = await asyncCall(
    Products.findOne({ product_id: productId })
  );

  if (!productResult.success || !productResult.data) {
    logger.error(`Failed to find product ${productId}`, productResult.error);
    return productResult;
  }

  const currentProduct = productResult.data;
  const currentDiscountPercentage = currentProduct.discountPercentage || 0;

  // Check if there's an active global discount
  const activeGlobalDiscountResult = await asyncCall(
    GlobalDiscount.findOne({
      status: DiscountStatus.ACTIVE,
      endDate: { $gt: new Date() },
    })
  );

  if (
    (activeGlobalDiscountResult.success &&
      activeGlobalDiscountResult.data &&
      activeGlobalDiscountResult.data.discountPercentage ==
        currentDiscountPercentage) ||
    activeGlobalDiscountResult.data?.discountPercentage == 0
  ) {
    logger.info(
      `Product ${productId} already has the same discount (${currentDiscountPercentage}%) as the global discount. Removing discount completely.`
    );
    // Remove the discount completely
    const result = await asyncCall(
      Products.findOneAndUpdate(
        { product_id: productId },
        {
          $set: {
            discountPercentage: 0,
            discountExpiry: null,
          },
        },
        { new: true }
      )
    );

    if (result.success) {
      logger.info(`Removed discount from product ${productId}`);
    } else {
      logger.error(
        `Failed to remove discount from product ${productId}`,
        result.error
      );
    }

    return result;
  } else if (activeGlobalDiscountResult.data) {
    const result = await asyncCall(
      Products.findOneAndUpdate(
        { product_id: productId },
        {
          $set: {
            discountPercentage:
              activeGlobalDiscountResult.data.discountPercentage,
            discountExpiry: activeGlobalDiscountResult.data.endDate,
          },
        },
        { new: true }
      )
    );

    if (result.success) {
      logger.info(
        `Applied global discount of ${activeGlobalDiscountResult.data.discountPercentage}% to product ${productId}`
      );
    } else {
      logger.error(
        `Failed to apply global discount to product ${productId}`,
        result.error
      );
    }

    return result;
  }
  return activeGlobalDiscountResult;
}

/**
 * Resets discounts for all products that have a specific discount percentage and expiry date
 * This is used when deactivating a global discount to ensure all affected products have their discounts removed
 *
 * @param percentage - The discount percentage to match
 * @param endDate - The discount expiry date to match
 * @returns Result object with the update operation result
 */
export async function resetGlobalDiscountFromProducts(
  percentage: number,
  endDate: Date
) {
  logger.info(
    `Resetting global discount of ${percentage}% from all affected products`
  );

  const result = await asyncCall(
    Products.updateMany(
      {
        discountPercentage: percentage,
        discountExpiry: endDate,
      },
      {
        $set: {
          discountPercentage: 0,
          discountExpiry: null,
        },
      }
    )
  );

  if (result.success) {
    logger.info(`Reset discount for ${result.data.modifiedCount} products`);
  } else {
    logger.error("Failed to reset global discount from products", result.error);
  }

  return result;
}
