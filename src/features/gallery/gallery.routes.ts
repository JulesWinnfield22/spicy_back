import express from 'express'
import upload from '../../utils/fileUpload'

const cell_image = upload.single('cell_image')

const routes = express.Router()

routes.put('/', (req, res, next) => {
	cell_image(req, res, err => {})
})

export default routes