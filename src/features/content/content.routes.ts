import express from 'express'
import { createContent, getContent, createImageContent, createTextContent } from './content.controller'
import sanitize from 'sanitize-html'
import { isLoogedIn } from '../auth/middleware/isLoogedIn'
import { ifAdmin } from '../auth/middleware/isAdmin'
import fileToFileName from 'src/middlewares/fileToFileName'

const routes = express.Router()

routes.put('/', isLoogedIn, ifAdmin, (req, res, next) => {
	try {
		const content = req.body.content
		const sani = sanitize(content, {
			allowedAttributes: {
				p: ['style', 'class'],
				span: ['style', 'class']
			}
		})
		req.body.content = sani
		next()
	} catch(err: any) {
		res.status(500)
		.json({
			message: err.message
		})
	}
}, createContent)

routes.get("/:name", getContent)
routes.put("/text/:id", createTextContent)
routes.put("/image/:id", fileToFileName("content"), createImageContent)


export default routes