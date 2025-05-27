import { RegisterUser } from "../../../interface";
import { isValidPassword, passwordErrorMessage } from "../../../utils/utils";
import { NextFunction, Request, Response } from "express";

function validatePassword(req: Request, res: Response, next: NextFunction) {
  const body: RegisterUser = req.body;

	let valid = isValidPassword(body.password);

  if (!valid) {
    res.status(401).json(passwordErrorMessage);
    return;
  }
	next()
}

export {
	validatePassword
}