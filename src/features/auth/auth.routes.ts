import express, { Request, Response } from 'express'
import { login, register } from './auth.controller'
import { validatePassword } from './middleware/validatePassword'
import { doesUserExist } from './middleware/doesUserExist'
import { checkUserAlreadyExist } from './middleware/checkUserAlreadyExist'
import { isLoogedIn } from './middleware/isLoogedIn'
import { hashPassword } from '../../utils/passwordHash'
import { User } from '../../interface'
import userModel from "../../db/models/UsersSchema";
import validateDocData from '../../middlewares/validateData'

const router = express.Router()

router.post('/login', doesUserExist, login)

router.post('/register', checkUserAlreadyExist, validatePassword, (req, res, next) => {
  const body: User = req.body;
	const [err, password] = hashPassword(body.password)

	if(err) {
		res.status(500).json({
			message: 'Something unexpected Happened. Try Again.'
		})
		return
	}

	body.password = password.hash
	body.salt = password.salt

	let user = new userModel(body)

	validateDocData(user, req, res, next)
}, register)

export default router