import exprss, { NextFunction, Request, Response } from 'express'
import upload, { UnsupportedFileTypeError } from "../../utils/fileUpload";
import compressAndToWebP from '../../utils/compressAndToWebP';
import { createImage, getImageData } from './images.controllers';
import { isLoogedIn } from '../auth/middleware/isLoogedIn';
import { ifAdmin } from '../auth/middleware/isAdmin';

const photo = upload.single("photo");

const routes = exprss.Router()

interface Size {
	width: number,
	height: number,
}
function middleware(req: Request, res: Response, next: NextFunction, type: string, size?: Size) {
	const name = req.params.name

	photo(req, res, async (err) => {
		if(!req.file) {
			res.status(400).json({
				message: 'Image is Required',
			});
			return
		}

		if (err instanceof UnsupportedFileTypeError) {
			res.status(400).json({
				message: err.message,
			}); 	
			return;
		}

		const image = await compressAndToWebP(req.file.buffer, {
			name: `${name}_${type}`,
			width: size?.width, 
			height: size?.height
		})
		req.body.filename = image.filename
		req.body.name = `${name}_${type}`
		req.body.size = type
		next()
	})
}

routes.put('/sm/:name', isLoogedIn, ifAdmin, (req, res, next) => {
	middleware(req, res, next, 'sm', {
		width: 341, 
		height: 257
	})
}, createImage)

routes.put('/md/:name', isLoogedIn, ifAdmin, (req, res, next) => {
	middleware(req, res, next, 'md',)
}, createImage)

routes.put('/lg/:name', isLoogedIn, ifAdmin, (req, res, next) => {
	middleware(req, res, next, 'lg', {
		width: 800, 
		height: 800
	})
}, createImage)

routes.get('/get/:name', getImageData)
export default routes