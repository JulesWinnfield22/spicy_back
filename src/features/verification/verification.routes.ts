import express from 'express'
import { creatVeririfcationCode, verifyCode } from './verification.controller'

const routes = express.Router()

routes.post('/send_verification', creatVeririfcationCode)
routes.patch('/verify_code', verifyCode)

export default routes