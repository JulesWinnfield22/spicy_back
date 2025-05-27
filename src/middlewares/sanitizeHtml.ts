import { CreateServiceDetail } from "../interface";
import { NextFunction, Request, Response } from "express";
import sanitize from 'sanitize-html'

function sanitizeHtml(req: Request, res: Response, next: NextFunction) {
	const serviceDetail: CreateServiceDetail = req.body
	try {
		serviceDetail.detailHtml = sanitize(serviceDetail.detailHtml)
		req.body = serviceDetail
		next()
	} catch(err: any) {
		res.status(400)
		.json({
			message: err.message
		})
		return
	}
}

export {
	sanitizeHtml
}