import { findUserById } from "../../../features/users/usersDbCall";
import { verify } from "../../../utils/jwt";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

const isLoogedIn = async (req: Request, res: Response, next: NextFunction) => {
  const [err, token] = verify(
    req.headers.authorization?.split(" ")?.[1] as string
  );

  if (err) {
    res.status(401).json({
      message: "Unauthorized " + err.message,
    });
    return;
  }

  const result = await findUserById(
    (token as JwtPayload)?.id as string
  );

  if (result.error) {
    res
      .status(500)
      .json({ message: "Something unexpected Happened. Try Again." });
    return;
  }

  if (!result.data) {
    res.status(404).json({ message: "No user Found" });
    return;
  }
  
  if (result.data) {
    req.user = result.data;
  }
  next();
}

export { isLoogedIn };
