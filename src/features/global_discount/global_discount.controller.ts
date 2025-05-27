import { Request, Response } from "express";
import {
  createGlobalDiscount,
  deactivateGlobalDiscount,
  getGlobalDiscountById,
  getGlobalDiscounts,
  updateGlobalDiscount,
  hasActiveGlobalDiscounts,
} from "./global_discountDbCall";
import GlobalDiscountDTO from "../../dtos/GlobalDiscountDTO";
import { cronJobManager } from "../../utils/cronJobManager";
import { applyProductDiscount, removeProductDiscount, resetExpiredDiscounts, resetGlobalDiscountFromProducts } from "../../utils/discountManager";
import { logger } from "../../utils/logger";

export async function getAllGlobalDiscounts(req: Request, res: Response) {
  const result = await getGlobalDiscounts(req.query as any);

  if (result.error) {
    console.log(result.error);

    res.status(500).json({
      message: result.error.message + " hehe",
    });
    return;
  }

  res.json({
    ...result.data,
    response: result.data.response?.map(GlobalDiscountDTO),
  });
}

export async function getGlobalDiscount(req: Request, res: Response) {
  const { discountId } = req.params;

  const result = await getGlobalDiscountById(discountId);

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Global discount not found",
    });
    return;
  }

  res.json(GlobalDiscountDTO(result.data));
}

export async function addGlobalDiscount(req: Request, res: Response) {
  const { discountPercentage, startDate, endDate } = req.body;

  if (!discountPercentage || !startDate || !endDate) {
    res.status(400).json({
      message: "Discount percentage, start date, and end date are required",
    });
    return;
  }

  // Check if there are any active global discounts
  const activeDiscountsResult = await hasActiveGlobalDiscounts();

  if (!activeDiscountsResult.success) {
    res.status(500).json({
      message: "Failed to check for active global discounts",
    });
    return;
  }

  if (activeDiscountsResult.data) {
    res.status(400).json({
      message: "There is already an active global discount. Please deactivate it before adding a new one.",
    });
    return;
  }

  const result = await createGlobalDiscount({
    discountPercentage,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  // Schedule a cron job to reset prices after expiry
  const endDateTime = new Date(endDate);
  const cronExpression = `${endDateTime.getMinutes()} ${endDateTime.getHours()} ${endDateTime.getDate()} ${
    endDateTime.getMonth() + 1
  } *`;

  if (!result.success) {
    const failureResult = result as { success: false, error: { message?: string } };

    res.status(500).json({
      message: failureResult.error?.message || "Failed to create global discount",
    });
    return;
  }

  if (!result.data) {
    res.status(500).json({
      message: "Failed to create global discount - no data returned",
    });
    return;
  }

  // Extract the ID from the document
  const document = result.data;
  const discountId = document._id?.toString() || document.id?.toString() || '';
  const jobName = `reset-discount-${discountId}`;

  cronJobManager.scheduleJob(jobName, cronExpression, resetExpiredDiscounts);

  logger.info(`Scheduled discount reset job: ${jobName} at ${cronExpression}`);

  res.status(201).json({
     ...GlobalDiscountDTO(result.data),
    scheduledReset: {
      jobName,
      cronExpression,
      resetTime: endDateTime
    }
  });
}

export async function editGlobalDiscount(req: Request, res: Response) {
  const { discountId } = req.params;
  const result = await updateGlobalDiscount(discountId, req.body);

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Global discount not found",
    });
    return;
  }

  // If the end date was updated, reschedule the cron job
  if (req.body.endDate) {
    const jobName = `reset-discount-${discountId}`;
    cronJobManager.stopJob(jobName);

    const endDateTime = new Date(req.body.endDate);
    const cronExpression = `${endDateTime.getMinutes()} ${endDateTime.getHours()} ${endDateTime.getDate()} ${
      endDateTime.getMonth() + 1
    } *`;

    cronJobManager.scheduleJob(jobName, cronExpression, resetExpiredDiscounts);

    logger.info(`Rescheduled discount reset job: ${jobName} at ${cronExpression}`);
  }

  res.json(GlobalDiscountDTO(result.data));
}

export async function deactivateDiscount(req: Request, res: Response) {
  const { discountId } = req.params;
  const result = await deactivateGlobalDiscount(discountId);

  if (!result.success) {
    // Type assertion to handle the TypeScript error
    const failureResult = result as { success: false, error: { message?: string } };

    res.status(500).json({
      message: failureResult.error?.message || "Failed to deactivate global discount",
    });
    return;
  }

  if (!result.data) {
    res.status(404).json({
      message: "Global discount not found",
    });
    return;
  }

  // Get the discount details to reset products with this discount
  const discountData = result.data;
  const discountPercentage = discountData.discountPercentage;
  const discountExpiry = discountData.endDate;

  // Reset all products that have this global discount applied
  const resetResult = await resetGlobalDiscountFromProducts(discountPercentage, discountExpiry);

  if (!resetResult.success) {
    logger.error('Failed to reset product discounts', resetResult.error);
    // Continue with the process even if resetting products failed
  } else {
    logger.info(`Reset discount for ${resetResult.data.modifiedCount} products after deactivating global discount`);
  }

  // Stop the scheduled cron job
  const jobName = `reset-discount-${discountId}`;
  cronJobManager.stopJob(jobName);

  logger.info(`Stopped discount reset job: ${jobName}`);

  res.json({
    message: "Global discount deactivated successfully",
    discount: GlobalDiscountDTO(result.data),
    productsUpdated: resetResult.success ? resetResult.data.modifiedCount : 0
  });
}

export async function addProductDiscount(req: Request, res: Response) {
  const { discountPercentage, endDate } = req.body;
  const productId = req.params.productId;

  if (!discountPercentage || !endDate || !productId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const result = await applyProductDiscount(productId, discountPercentage, new Date(endDate));

  if (!result.success) {
    return res.status(500).json({ message: result.error.message });
  }

  res.status(200).json(result.data);
}

export async function removeDiscount(req: Request, res: Response) {
  const productId = req.params.productId;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const result = await removeProductDiscount(productId);

  if (!result.success) {
    return res.status(500).json({ message: result.error.message });
  }

  res.status(200).json(result.data);
}
