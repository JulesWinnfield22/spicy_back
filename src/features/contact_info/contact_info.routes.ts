import express from 'express'
import { createInfo, getInfo } from './contact_info.controller'
import { isLoogedIn } from '../auth/middleware/isLoogedIn'
import { ifAdmin } from '../auth/middleware/isAdmin'

const routes = express.Router()

routes.put('/', isLoogedIn, ifAdmin, createInfo)
routes.get('/', getInfo)

export default routes