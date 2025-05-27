import { NextFunction, Request, Response } from "express";
import { Role } from "../../../auth/roles";

/**
 * Legacy middleware to check if a user has Admin role
 * This is kept for backward compatibility
 */
export const ifAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check for new roles array
  if (
    req.user?.roles &&
    Array.isArray(req.user.roles) &&
    req.user.roles.find((el) => {
      return el.name == Role.ADMIN
    })
  ) {
    return next();
  }

  res.status(403).json({
    message: "Forbidden - Admin access required",
  });
};
