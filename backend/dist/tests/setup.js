"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
beforeAll(async () => {
    await prisma_1.prisma.consensusGroupMember.deleteMany();
    await prisma_1.prisma.consensusGroup.deleteMany();
    await prisma_1.prisma.trigger.deleteMany();
    await prisma_1.prisma.capsuleRecipient.deleteMany();
    await prisma_1.prisma.capsule.deleteMany();
    await prisma_1.prisma.user.deleteMany();
});
afterAll(async () => {
    await prisma_1.prisma.$disconnect();
});
//# sourceMappingURL=setup.js.map