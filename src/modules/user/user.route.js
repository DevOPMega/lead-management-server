import express from "express"
import UserController from "./user.controller.js";
import { userAuth } from "../../middleware/userAuth.js";

const UserRoute = express.Router();

//------------------------Authorization----------------------------
UserRoute.post("/register", UserController.register);
UserRoute.post("/login", UserController.login);
UserRoute.post("/logout", UserController.logout);

UserRoute.get("/me", userAuth, UserController.me);


export default UserRoute;