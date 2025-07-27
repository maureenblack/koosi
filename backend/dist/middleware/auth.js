"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const prisma_1 = require("../lib/prisma");
const AppError_1 = require("../utils/AppError");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            throw new AppError_1.AppError('No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true },
        });
        if (!user) {
            throw new AppError_1.AppError('User not found', 401);
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new AppError_1.AppError('Invalid token', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map