// Import models to ensure they are registered with Mongoose
// These imports are necessary even if the models aren't directly used in this file
import RoleModel from "./db/models/RoleSchema";
import PermissionModel from "./db/models/PermissionSchema";
import doenv from "dotenv";
import { Application } from "express";
import db from "./db/db";
import express from "express";
import cors from "cors";
import { authRouter } from "./features/auth/index.auth";
import { imagesRoutes } from "./features/images/index.images";
import { contentRouter } from "./features/content/content.index";
import { aboutRoutes } from "./features/aboutus/about.index";
import { contact_infoRoutes } from "./features/contact_info/contact_info.index";
import verificationRoutes from "./features/verification/verification.routes";
import { userRoutes } from "./features/users/user.index";
import rolesRouter from "./features/roles";
import permissionsRouter from "./features/permissions";
import { productRoutes } from "./features/products/product.index";
import { isLoogedIn } from "./features/auth/middleware/isLoogedIn";
import { orderRoutes } from "./features/orders/order.index";
import { globalDiscountRoutes } from "./features/global_discount/global_discount.index";
import addressRoutes from './features/address/address.routes'
// import './seed/users_role_permission.seed'
import http from "http";
import https from "https";
import fs from "fs";
import { logger } from "./utils/logger";
import { cronJobManager } from "./utils/cronJobManager";

const app: Application = express();

async function main() {
  doenv.config({});
  await db();
  const port = process.env.PORT || 3002;

  // Uncomment the line below to migrate roles and permissions to the database
  // await migrateRolesAndPermissions();

  // Initialize discount cron jobs from database
  try {
    logger.info('Initializing discount cron jobs on application startup');
    await cronJobManager.initializeDiscountJobs();
    logger.info('Discount cron jobs initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize discount cron jobs', error);
  }

  app.use(cors());
  app.use(express.json());
  app.use("/static", express.static("uploads"));

  app.use("/api/v1/images", imagesRoutes);
  app.use("/api/v1/content", contentRouter);
  app.use("/api/v1/aboutus", aboutRoutes);
  app.use("/api/v1/contact", contact_infoRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use('/api/v1/orders', orderRoutes)
  app.use('/api/v1/roles', rolesRouter);
  app.use('/api/v1/products', productRoutes)
  app.use('/api/v1/permissions', permissionsRouter);
  app.use('/api/v1/discounts', globalDiscountRoutes);
  app.use("/api/v1", authRouter);
  app.use("/api/v1", verificationRoutes);
  app.use("/api/v1", addressRoutes);

  // if (process.env.NODE_ENV == 'production') {
  //   const options = {
  //     key: fs.readFileSync(
  //       "/etc/letsencrypt/live/api.marbaraktrading.com/privkey.pem"
  //     ),
  //     cert: fs.readFileSync(
  //       "/etc/letsencrypt/live/api.marbaraktrading.com/fullchain.pem"
  //     ),
  //   };

  //   https.createServer(options, app).listen(443, () => {
  //     console.log("HTTPS Server running on https://subdomain.yourdomain.com");
  //   });

  //   http
  //     .createServer((req, res) => {
  //       res.writeHead(301, {
  //         Location: "https://" + req.headers["host"] + req.url,
  //       });
  //       res.end();
  //     })
  //     .listen(80);
  // } else {
	// 	app.listen(port, () => {
	// 		console.log(`Server is running on [http://localhost:${port}]`);
	// 	});
	// }

  app.listen(port, () => {
    console.log(`Server is running on [http://localhost:${port}]`);
  });
}

main();
