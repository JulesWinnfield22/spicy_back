import { findUserByEmail } from "../../../features/users/usersDbCall";
import { Credential } from "../../../interface";
import { verifyPassword } from "../../../utils/passwordHash";
import { NextFunction, Request, Response } from "express";

async function doesUserExist(req: Request, res: Response, next: NextFunction) {
	const body: Credential = req.body;
	const result = await findUserByEmail(body.email)
	
	if(result.error) {
		res.status(500).json({
			message: 'Something unexpected Happened. Try Again. ' + result.error.message
		})
		return
	}

	if(!result.data) {
		res.status(401).json({
			message: 'The Credentials Dont Match Any User'
		})
		return
	}

	const [passErr, valid] = verifyPassword(body.password, result.data.password, result.data.salt)

	if(passErr || !valid) {
		res.status(401).json({
			message: 'The Credentials Dont Match Any User'
		})
		return
	}
	req.user = result.data
	next()
}

export {
	doesUserExist
}