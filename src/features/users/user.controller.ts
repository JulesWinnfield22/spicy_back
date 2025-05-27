import {
  asyncCall,
  getPagination,
  isValidPassword,
  paginate,
  Pagination,
} from "../../utils/utils";
import { Request, Response } from "express";
import userModal from "../../db/models/UsersSchema";
import UserDTO from "../../dtos/UserDTO";
import { hashPassword, verifyPassword } from "../../utils/passwordHash";
import { Status, User } from "../../interface";
import { populate } from "dotenv";

export async function getAllUsers(req: Request, res: Response) {
  const query = req.query;
  const result = await asyncCall(
    paginate(
      userModal,
      query as unknown as Pagination,
      query?.status && query?.status == "All" ? {} : { status: query?.status },
      ["roles"]
    )
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  res.json({
    ...result.data,
    response: result.data.response?.map(UserDTO),
  });
}

export async function createUser(req: Request, res: Response) {
  const result = await asyncCall<User | null>(
    (
      await userModal.create(req.body)
    ).populate({ path: "roles", populate: "permissions" })
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  console.log(result.data);
  
  res.json(result.data != null ? UserDTO(result.data) : {});
}

export async function updateUser(req: Request, res: Response) {
  const result = await asyncCall<User | null>(
    userModal.findOneAndUpdate(
      {
        _id: req.params?.userId,
      },
      req.body,
      {
        new: true,
        upsert: true,
      }
    )
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  res.json(result.data != null ? UserDTO(result.data) : {});
}

export async function removeUser(req: Request, res: Response) {
  const userId = req.params.userId;

  const result = await asyncCall<User | null>(
    userModal.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        status: Status.DISABLED,
      },
      { new: true }
    )
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
  }

  res.json(result.data != null ? UserDTO(result.data) : {});
}

export async function changePassword(req: Request, res: Response) {
  const newPassword = req.body;
  let [err, valid] = verifyPassword(
    newPassword.oldPassword,
    req.user?.password as string,
    req.user?.salt as string
  );

  if (err) {
    res.status(403).json({
      message: err,
    });
    return;
  }

  const [hasErr, password] = hashPassword(newPassword?.newPassword);

  if (hasErr) {
    res.status(500).json({
      message: "Something went wrong. try again latter.",
    });
    return;
  }

  const userResult = await asyncCall<User | null>(
    userModal.findOneAndUpdate(
      {
        _id: req.user?._id,
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

  if (userResult.error || !userResult.data) {
    res.status(500).json({
      message: "Something went wrong. try again latter.",
    });
    return;
  }

  req.user = userResult.data;
  res.json({
    message: "Updated Successfully",
  });
}
