import { asyncCall } from "../../utils/utils";
import { json, Request, Response } from "express";
import infoModel from '../../db/models/ContactInfoSchema'

export async function createInfo(req: Request, res: Response) {
	const info = req.body

	const result = await asyncCall(infoModel.findOneAndUpdate({}, info, {
		new: true,
		upsert: true
	}))

	if(result.error) {
		res.status(500)
		.json({
			messgae: result.error.message
		})
		return
	}

	res.json(result.data)
}


export async function getInfo(req: Request, res: Response) {
	const result = await asyncCall(infoModel.find({}))

	if(result.error) {
		res.status(500)
		.json({
			messgae: result.error.message
		})
		return
	}

	res.json(result.data?.[0])
}