import { findUserByEmail, findUserByPhone } from "../../../features/users/usersDbCall";
import { RegisterUser } from "../../../interface";
import { NextFunction, Request, Response } from "express";

async function checkUserAlreadyExist(req: Request, res: Response, next: NextFunction) {
	const body: RegisterUser = req.body;
	let result = await findUserByEmail(body.email)
	
	if(result.error) {
		res.status(500).json({
			message: 'Something unexpected Happened. Try Again.'
		})
		return
	}

	if(result.data) {
		res.status(409).json({
			message: 'Email Already Exists'
		})
		return
	}

	result = await findUserByPhone(body.phone_number)

	if(result.data) {
		res.status(409).json({
			message: 'Phone Number Already Exists'
		})
		return
	}
	
	next()
}

export {
	checkUserAlreadyExist
}