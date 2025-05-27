import { FunctionResponse } from "../interface";
import bcrypt from "bcrypt";

const saltRounds = 10;

interface PasswordHash {
  salt: string;
  hash: string;
}

function hashPassword(password: string): FunctionResponse<PasswordHash> {
  try {
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(password, salt);
    return [
      undefined,
      {
        salt,
        hash,
      },
    ];
  } catch (err: any) {
    return [err.message, { salt: "", hash: "" }];
  }
}

function verifyPassword(password: string, hasedPassword: string, salt: string): FunctionResponse<boolean> {
  try {
    let hash = bcrypt.hashSync(password, salt);
		return [undefined, hash === hasedPassword]
  } catch (err: any) {
		return [err.message, false]
	}
}

export { hashPassword, verifyPassword };
