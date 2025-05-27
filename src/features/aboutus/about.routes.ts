import express from 'express'
import { createAboutUs, getAboutUs } from './about.controller'
import upload, { UnsupportedFileTypeError } from "../..//utils/fileUpload";
import compressAndToWebP from '../../utils/compressAndToWebP';
import { isLoogedIn } from '../auth/middleware/isLoogedIn';
import { ifAdmin } from '../auth/middleware/isAdmin';

const routes = express.Router()
const aboutus_photo = upload.single("aboutus_photo");

routes.put('/', isLoogedIn, ifAdmin, async (req, res, next) => {
	aboutus_photo(req, res, async (err) => {
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
			width: 430,
			height: 231
		})
		
		req.body.aboutus_photo = image?.filename
		next()
	})
}, createAboutUs)

routes.get("/", getAboutUs)
export default routes