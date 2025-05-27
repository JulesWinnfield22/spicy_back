import cron from 'node-cron';
import GlobalDiscount from '../db/models/GlobalDiscountSchema';
import { resetExpiredDiscounts, resetGlobalDiscountFromProducts } from './discountManager';
import { logger } from './logger';
import { DiscountStatus } from './utils';

/**
 * CronJobManager - Handles scheduling and management of cron jobs
 *
 * This class provides a centralized way to manage all cron jobs in the application.
 * It includes methods for starting, stopping, and managing various scheduled tasks.
 */
class CronJobManager {
  private jobs: Map<string, cron.ScheduledTask>;

  constructor() {
    this.jobs = new Map();
  }

  /**
   * Schedule a new cron job
   *
   * @param jobName - Unique identifier for the job
   * @param schedule - Cron schedule expression (e.g., '0 * * * *' for every hour)
   * @param task - Function to execute when the job runs
   * @returns boolean indicating success or failure
   */
  public scheduleJob(jobName: string, schedule: string, task: () => void): boolean {
    try {
      if (this.jobs.has(jobName)) {
        logger.warn(`Job with name ${jobName} already exists. Stopping existing job.`);
        this.stopJob(jobName);
      }

      const job = cron.schedule(schedule, task, {
        scheduled: true,
        timezone: 'UTC' // Use UTC timezone for consistency
      });

      this.jobs.set(jobName, job);
      logger.info(`Scheduled job: ${jobName} with schedule: ${schedule}`);
      return true;
    } catch (error) {
      logger.error(`Failed to schedule job: ${jobName}`, error);
      return false;
    }
  }

  /**
   * Stop a running cron job
   *
   * @param jobName - Name of the job to stop
   * @returns boolean indicating success or failure
   */
  public stopJob(jobName: string): boolean {
    try {
      const job = this.jobs.get(jobName);
      if (job) {
        job.stop();
        this.jobs.delete(jobName);
        logger.info(`Stopped job: ${jobName}`);
        return true;
      }
      logger.warn(`Job with name ${jobName} not found`);
      return false;
    } catch (error) {
      logger.error(`Failed to stop job: ${jobName}`, error);
      return false;
    }
  }

  /**
   * Get all currently scheduled jobs
   *
   * @returns Array of job names
   */
  public getScheduledJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Initialize discount cron jobs from active global discounts in the database
   * This should be called on application startup
   */
  public async initializeDiscountJobs(): Promise<void> {
    try {
      logger.info('Initializing discount cron jobs from database...');

      // Find all active global discounts
      const activeDiscounts = await GlobalDiscount.find({
        status: DiscountStatus.ACTIVE
      });

      logger.info(`Found ${activeDiscounts.length} active global discounts`);

      const now = new Date();

      // For each active discount, schedule a cron job if it hasn't expired
      for (const discount of activeDiscounts) {
        const endDate = new Date(discount.endDate);

        // If the discount has already expired, reset it
        if (endDate <= now) {
          logger.info(`Found expired discount: ${discount._id}. Resetting affected products.`);

          // Reset products with this discount
          const resetResult = await resetGlobalDiscountFromProducts(
            discount.discountPercentage,
            discount.endDate
          );

          if (resetResult.success) {
            logger.info(`Reset ${resetResult.data.modifiedCount} products with expired discount`);
          } else {
            logger.error('Failed to reset products with expired discount', resetResult.error);
          }

          // Update the discount status to inactive
          await GlobalDiscount.findByIdAndUpdate(
            discount._id,
            { status: DiscountStatus.INACTIVE }
          );

          logger.info(`Updated expired discount status to INACTIVE`);
        } else {
          // Schedule a cron job for future expiry
          const cronExpression = `${endDate.getMinutes()} ${endDate.getHours()} ${endDate.getDate()} ${
            endDate.getMonth() + 1
          } *`;

          const jobName = `reset-discount-${discount._id}`;
          this.scheduleJob(jobName, cronExpression, resetExpiredDiscounts);

          logger.info(`Scheduled discount reset job: ${jobName} at ${cronExpression}`);
        }
      }

      logger.info('Discount cron jobs initialization completed');
    } catch (error) {
      logger.error('Failed to initialize discount cron jobs', error);
    }
  }
}

// Export a singleton instance
export const cronJobManager = new CronJobManager();
