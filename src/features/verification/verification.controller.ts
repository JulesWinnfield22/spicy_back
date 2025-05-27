import { Request, Response } from "express";
import { findUserByEmail } from "../users/usersDbCall";
import {
  asyncCall,
  generateVerificationCode,
  isValidPassword,
  passwordErrorMessage,
  sendEmail,
} from "../../utils/utils";
import verificationModel from "../../db/models/VerificationSchema";
import userModel from "../../db/models/UsersSchema";
import { validatePassword } from "../auth/middleware/validatePassword";
import { hashPassword } from "../../utils/passwordHash";
import { User } from "../../interface";

export async function creatVeririfcationCode(req: Request, res: Response) {
  const data = req.body;
  const result = await findUserByEmail(data.email);

  if (result.error) {
    res.status(500).json({
      message: "Something went wrong. Try again latter.",
    });
    return;
  }

  if (result.data) {
    const code = generateVerificationCode();
    const veri = await verificationModel.findOneAndUpdate(
      {
        email: data.email,
      },
      {
        email: data.email,
        code,
				used: false
      },
      {
        upsert: true,
      }
    );

    sendEmail({
      msg: `<b>${code}</b>`,
      subj: "Verification Code",
      to: data.email,
    });

    res.json({
      message: "Code Sent Successfully",
    });
    return;
  }
  res.json({
    message: "Code Sent Successfully",
  });
}

export async function verifyCode(req: Request, res: Response) {
  const data = req.body;
  const date = new Date();
  date.setMinutes(date.getMinutes() - 30); // code is valid for only 30 minutes
  const result = await asyncCall(verificationModel.findOne({
      email: data.email,
      used: false,
      createdAt: {
        $gt: date,
      },
    })
  );

  if (result.error || !result.data) {
    res.status(500).send();
    return;
  }

  if (result.data.code != data.code) return;

  const valid = isValidPassword(data.newPassword);

  if (!valid) {
    res.status(400).json(passwordErrorMessage);
    return;
  }

  const [hasErr, password] = hashPassword(data?.newPassword);

  if (hasErr) {
    res.status(500).json({
      message: "Something went wrong. try again latter.",
    });
    return;
  }

  const userResult = await asyncCall<User | null>(
    userModel.findOneAndUpdate(
      {
        email: data.email,
      },
      {
        password: password.hash,
        salt: password.salt,
      },
      {
        new: true,
      }
    )
  );

  result.data.used = true;
  await result.data.save();
  res.json({
    message: "Password reset Successfully",
  });
}
