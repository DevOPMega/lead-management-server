import { rateLimit, ipKeyGenerator } from "express-rate-limit";

export const globalErrorHandler = (error, req, res, next) => {
    res.status(error.status || 500).json({
        success: false,
        error: error,
        message: error.message || "Internal Server Error",
    });
}

export const routeNotFoundHandler = (req, res, next) => {
    return res.status(400).json({
        success: false,
        message: "Route not found",
    });
}

export const rateLimiter = rateLimit({
    windowMs: 60000 * 30, // 30 minutes
    max: 1 * 1000, //1 k req
    message: "Too many requests Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
        const deviceId = req.headers["x-device-id"];

        if (deviceId) return deviceId;

        return ipKeyGenerator(req.ip); // fallback to real IP
    },
});