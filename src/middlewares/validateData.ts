import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { Document } from "mongoose";

function validateDocData(
  doc: Document,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let errors = doc.validateSync()?.errors;

  if (Object.keys(errors || {})?.length) {
    res.status(400).json({
      field: errors?.[Object.keys(errors)[0]]?.path,
      message: `${errors?.[Object.keys(errors)[0]]?.path}: ${errors?.[Object.keys(errors)[0]]?.message}`,
    });
    return;
  }

  next();
}
export default validateDocData;
