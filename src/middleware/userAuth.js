import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import UserModel from "../modules/user/user.model.js";

export const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        // 1️⃣ No token
        if (!token) {
            return next(createHttpError(401, { message: "Token Unauthorized" }))
        }

        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.COOKIE_SECRET);

        const user = await UserModel.findById(decoded.id);

        // 3️⃣ Attach user to request
        req.user = {
            id: user._id,
            role: user.role,
        }

        next();
    } catch (error) {
        console.log("error:", error);
        return next(createHttpError(401, { message: "Token Unauthorized" }))
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(createHttpError(403, { message: "Access denied!" }))
    }

    next();
}

export const isStaff = (req, res, next) => {
    if (req.user.role !== "staff") {
        return next(createHttpError(403, { message: "Access denied!" }))
    }

    next();
}
