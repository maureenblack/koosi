"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const library_1 = require("@prisma/client/runtime/library");
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
        return;
    }
    if (err instanceof library_1.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                res.status(409).json({
                    status: 'error',
                    message: 'A record with this value already exists.'
                });
                return;
            case 'P2025':
                res.status(404).json({
                    status: 'error',
                    message: 'Record not found.'
                });
                return;
            default:
                console.error('Prisma Error:', err);
        }
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map