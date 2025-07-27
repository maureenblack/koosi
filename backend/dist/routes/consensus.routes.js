"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consensusRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const AppError_1 = require("../utils/AppError");
exports.consensusRoutes = (0, express_1.Router)();
const voteSchema = zod_1.z.object({
    vote: zod_1.z.enum(['approved', 'rejected']),
});
exports.consensusRoutes.get('/', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const consensusGroups = await prisma_1.prisma.consensusGroup.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                capsule: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        res.json(consensusGroups);
    }
    catch (error) {
        next(error);
    }
});
exports.consensusRoutes.post('/:groupId/vote', auth_1.authenticate, async (req, res, next) => {
    var _a;
    try {
        const { groupId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const { vote } = voteSchema.parse(req.body);
        const membership = await prisma_1.prisma.consensusGroupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                },
            },
            include: {
                group: {
                    include: {
                        capsule: {
                            include: {
                                trigger: true,
                            },
                        },
                        members: true,
                    },
                },
            },
        });
        if (!membership) {
            throw new AppError_1.AppError('Not a member of this consensus group', 403);
        }
        if (membership.vote) {
            throw new AppError_1.AppError('Already voted', 400);
        }
        await prisma_1.prisma.consensusGroupMember.update({
            where: {
                id: membership.id,
            },
            data: {
                vote,
                votedAt: new Date(),
            },
        });
        const group = membership.group;
        const approvedVotes = group.members.filter(m => m.vote === 'approved').length;
        const rejectedVotes = group.members.filter(m => m.vote === 'rejected').length;
        const totalVotes = approvedVotes + rejectedVotes;
        if (totalVotes >= group.members.length) {
            const consensusReached = approvedVotes >= group.threshold;
            await prisma_1.prisma.trigger.update({
                where: {
                    capsuleId: group.capsule.id,
                },
                data: {
                    status: consensusReached ? 'completed' : 'failed',
                    evidence: {
                        approvedVotes,
                        rejectedVotes,
                        threshold: group.threshold,
                    },
                },
            });
            if (consensusReached) {
                await prisma_1.prisma.capsule.update({
                    where: {
                        id: group.capsule.id,
                    },
                    data: {
                        status: 'unsealed',
                    },
                });
            }
        }
        res.json({ message: 'Vote recorded successfully' });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=consensus.routes.js.map