import express from "express";
import {
  changePassword,
  createUser,
  getAllUsers,
  removeUser,
  updateUser,
} from "./user.controller";
import { isLoogedIn } from "../auth/middleware/isLoogedIn";
import { validatePassword } from "../auth/middleware/validatePassword";
import { ifAdmin } from "../auth/middleware/isAdmin";
import { checkUserAlreadyExist } from "../auth/middleware/checkUserAlreadyExist";
import { User } from "src/interface";
import { hashPassword } from "src/utils/passwordHash";
import validateDocData from "src/middlewares/validateData";
import userModel from "../../db/models/UsersSchema";
const routes = express.Router();

routes.post(
  "/",
  checkUserAlreadyExist,
  validatePassword,
  (req, res, next) => {
    const body: User = req.body;
    const [err, password] = hashPassword(body.password);

    if (err) {
      res.status(500).json({
        message: "Something unexpected Happened. Try Again.",
      });
      return;
    }

    body.password = password.hash;
    body.salt = password.salt;

    let user = new userModel(body);

    validateDocData(user, req, res, next);
  },
  createUser
);
routes.put("/change_password", changePassword);
routes.patch("/remove/:userId", isLoogedIn, ifAdmin, removeUser);
routes.get("/all", getAllUsers);
routes.put("/:userId?", updateUser);

export default routes;
