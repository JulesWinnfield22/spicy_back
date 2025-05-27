import { FunctionResponse } from "../interface";
import jwt, { JwtPayload } from "jsonwebtoken";

function sign(payload = {}): FunctionResponse<string | null> {
	try {
		let token = jwt.sign(
			{ ...payload, d: new Date() },
			process.env?.JWT_SECRET as string,
			{
				algorithm: 'HS256',
				expiresIn: "24h",
			}
		);
		return [null, token]
	} catch(err: any) {
		return [err, null]
	}
}

function verify(token: string): FunctionResponse<JwtPayload | string | null> {
	try {
		let valid = jwt.verify(token, process.env?.JWT_SECRET as string);
		return [null, valid]
	} catch(err) {
		return [err, null]
	}
}

export { sign, verify };
