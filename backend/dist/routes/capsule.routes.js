"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.capsuleRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const crypto_js_1 = __importDefault(require("crypto-js"));
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const AppError_1 = require("../utils/AppError");
const env_1 = __importDefault(require("../config/env"));
exports.capsuleRoutes = (0, express_1.Router)();
const createCapsuleSchema = zod_1.z.object({
    content: zod_1.z.object({
        type: zod_1.z.enum(['text', 'audio', 'video']),
        data: zod_1.z.string(),
    }),
    recipients: zod_1.z.array(zod_1.z.string()),
    trigger: zod_1.z.object({
        type: zod_1.z.enum(['time', 'event', 'consensus']),
        conditions: zod_1.z.record(zod_1.z.any()),
    }),
});
const encryptContent = (content) => {
    return crypto_js_1.default.AES.encrypt(content, env_1.default.ENCRYPTION_KEY).toString();
};
const decryptContent = (encryptedContent) => {
    const bytes = crypto_js_1.default.AES.decrypt(encryptedContent, env_1.default.ENCRYPTION_KEY);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
};
exports.capsuleRoutes.post('/', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const { content, recipients, trigger } = createCapsuleSchema.parse(req.body);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const encryptedContent = encryptContent(JSON.stringify(content));
        const capsule = await prisma_1.prisma.capsule.create({
            data: {
                userId,
                content: encryptedContent,
                triggerType: trigger.type,
                conditions: trigger.conditions,
                trigger: {
                    create: {
                        type: trigger.type,
                        conditions: trigger.conditions,
                        status: 'pending',
                    },
                },
                recipients: {
                    create: recipients.map(email => ({
                        email,
                        status: 'pending',
                    })),
                },
                ...(trigger.type === 'consensus' ? {
                    consensus: {
                        create: {
                            threshold: Math.ceil(recipients.length * 0.66),
                            members: {
                                create: recipients.map(email => ({
                                    userId,
                                })),
                            },
                        },
                    },
                } : {}),
            },
            include: {
                trigger: true,
                recipients: true,
                consensus: {
                    include: {
                        members: true,
                    },
                },
            },
        });
        res.status(201).json(capsule);
    }
    catch (error) {
        next(error);
    }
});
exports.capsuleRoutes.get('/', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const capsules = await prisma_1.prisma.capsule.findMany({
            where: {
                OR: [
                    { userId },
                    { recipients: { some: { email: req.user.email } } },
                ],
            },
            include: {
                trigger: true,
                recipients: true,
                consensus: {
                    include: {
                        members: true,
                    },
                },
            },
        });
        res.json(capsules);
    }
    catch (error) {
        next(error);
    }
});
exports.capsuleRoutes.get('/:id', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const capsule = await prisma_1.prisma.capsule.findFirst({
            where: {
                id,
                OR: [
                    { userId },
                    { recipients: { some: { email: req.user.email } } },
                ],
            },
            include: {
                trigger: true,
                recipients: true,
                consensus: {
                    include: {
                        members: true,
                    },
                },
            },
        });
        if (!capsule) {
            throw new AppError_1.AppError('Capsule not found', 404);
        }
        if (capsule.status === 'unsealed') {
            const decryptedContent = decryptContent(capsule.content);
            capsule.content = decryptedContent;
        }
        res.json(capsule);
    }
    catch (error) {
        next(error);
    }
});
exports.capsuleRoutes.delete('/:id', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const capsule = await prisma_1.prisma.capsule.findFirst({
            where: { id, userId },
        });
        if (!capsule) {
            throw new AppError_1.AppError('Capsule not found or unauthorized', 404);
        }
        await prisma_1.prisma.capsule.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=capsule.routes.js.map