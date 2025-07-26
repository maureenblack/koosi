import { prisma } from '../lib/prisma';

beforeAll(async () => {
  // Clean up database before tests
  await prisma.consensusGroupMember.deleteMany();
  await prisma.consensusGroup.deleteMany();
  await prisma.trigger.deleteMany();
  await prisma.capsuleRecipient.deleteMany();
  await prisma.capsule.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
