"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const AppError_1 = require("../utils/AppError");
exports.triggerRoutes = (0, express_1.Router)();
const updateTriggerSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'active', 'completed', 'failed']),
    evidence: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.triggerRoutes.get('/', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const triggers = await prisma_1.prisma.trigger.findMany({
            where: {
                capsule: {
                    OR: [
                        { userId },
                        { recipients: { some: { email: req.user.email } } },
                    ],
                },
            },
            include: {
                capsule: {
                    include: {
                        recipients: true,
                    },
                },
            },
        });
        res.json(triggers);
    }
    catch (error) {
        next(error);
    }
});
exports.triggerRoutes.patch('/:id', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const { status, evidence } = updateTriggerSchema.parse(req.body);
        const trigger = await prisma_1.prisma.trigger.findFirst({
            where: {
                id,
                capsule: {
                    OR: [
                        { userId },
                        { recipients: { some: { email: req.user.email } } },
                    ],
                },
            },
            include: {
                capsule: true,
            },
        });
        if (!trigger) {
            throw new AppError_1.AppError('Trigger not found or unauthorized', 404);
        }
        const updatedTrigger = await prisma_1.prisma.trigger.update({
            where: { id },
            data: {
                status,
                evidence,
                ...(status === 'completed' ? {
                    capsule: {
                        update: {
                            status: 'unsealed',
                        },
                    },
                } : {}),
            },
            include: {
                capsule: true,
            },
        });
        res.json(updatedTrigger);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=trigger.routes.js.map