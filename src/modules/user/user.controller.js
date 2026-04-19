import createHttpError from "http-errors";
import log from "../../logs/index.js";
import UserModel from "./user.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const UserController = {
    register: async (req, res, next) => {
        try {
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied!"
                })
            }

            const { email, password, role } = req.body;

            const user = await UserModel.findOne({
                email,
            });

            if (user) {
                return next(createHttpError(401, "User already exist"));
            }

            const hashPassword = await bcrypt.hash(password, 10);

            await UserModel.create({
                email: email,
                password: hashPassword,
                role: role,
            });

            res.status(200).json({
                success: true,
                message: "User registered!",
            });

        } catch (error) {
            log.error("POST: user register:", error);

            next(
                createHttpError(500, {
                    errorAPI: "POST: user register",
                    message: error.message,
                })
            );
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findOne({ email });

            if (!user) {
                return next(
                    createHttpError(
                        401,
                        "Invalid Credentials"
                    )
                );
            }

            const comparePassword = await bcrypt.compare(
                password,
                user.password
            );

            if (!comparePassword) {
                return next(
                    createHttpError(401, "Invalid Credentials")
                );
            }

            const payload = { id: user._id };
            const token = jwt.sign(payload, process.env.COOKIE_SECRET, {
                expiresIn: "7h",
            });

            const cookies = {
                path: "/",
                domain: "devopmega.space",
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 7 * 24 * 60 * 60 * 1000, // 7 Days
            };

            res.cookie("token", token, cookies)

            res.status(200).json({
                success: true,
                user: user,
            });
        } catch (error) {
            log.error(`Error Message: ${error.message}\nError Stack: ${error}`);

            next(
                createHttpError(500, {
                    message: "API function error: Login"
                })
            )
        }
    },

    logout: async (req, res, next) => {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: ".inc1.devtunnels.ms",
                path: "/",
            });

            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            log.error("POST: customer logout OTP:", error);

            next(
                createHttpError(500, {
                    errorAPI: "POST: customer logout OTP",
                    message: error.message,
                })
            );
        }
    },

    me: async (req, res, next) => {
        try {
            const user = await UserModel.findById(req.user.id);

            res.status(200).json({
                success: true,
                user: user,
            });

        } catch (error) {
            log.error("GET: user me:", error);

            next(
                createHttpError(500, {
                    errorAPI: "GET: user me",
                    message: error.message,
                })
            );
        }
    },

    
};

export default UserController;