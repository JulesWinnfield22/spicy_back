import { User } from "../../interface";
import { Request, Response } from "express";
import userModel from "../../db/models/UsersSchema";
import UserDTO from "../../dtos/UserDTO";
import { asyncCall } from "../../utils/utils";
import { sign } from "../../utils/jwt";

async function login(req: Request, res: Response) {
	const [err, token] = sign({id: req.user?._id.toString()})

	if(err) {
		res.status(500)
		.json({
			message: 'Something unexpected Happened. Try Again.'
		})
		return
	}

  res.json({token, ...UserDTO(req.user)})
}

async function register(req: Request, res: Response) {
  const body: User = req.body;
	
  let user = new userModel(body)
	let result = await asyncCall<User>(user.save(), {
		transformData: UserDTO
	})

	if(result.error) {
		res.status(500)
		.json({
			message: 'Something unexpected Happened. Try Again.'
		})
		return
	}

  res.json(result.data);
}

export { login, register };
