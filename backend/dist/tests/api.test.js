"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const prisma_1 = require("../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
describe('Koosi API Tests', () => {
    let authToken;
    let testUser;
    let testCapsule;
    beforeAll(async () => {
        testUser = await prisma_1.prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test User',
            },
        });
        authToken = jsonwebtoken_1.default.sign({ id: testUser.id, email: testUser.email }, env_1.default.JWT_SECRET);
    });
    afterAll(async () => {
        await prisma_1.prisma.user.delete({ where: { id: testUser.id } });
        await prisma_1.prisma.$disconnect();
    });
    describe('Authentication', () => {
        it('should get current user profile', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.email).toBe('test@example.com');
        });
    });
    describe('Capsules', () => {
        it('should create a new capsule', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/capsules')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                content: {
                    type: 'text',
                    data: 'Test capsule content',
                },
                recipients: ['recipient@example.com'],
                trigger: {
                    type: 'time',
                    conditions: {
                        openAt: new Date(Date.now() + 86400000).toISOString(),
                    },
                },
            });
            expect(response.status).toBe(201);
            testCapsule = response.body;
            expect(testCapsule.userId).toBe(testUser.id);
        });
        it('should list user capsules', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/capsules')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
        it('should get capsule by id', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get(`/api/capsules/${testCapsule.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(testCapsule.id);
        });
    });
    describe('Triggers', () => {
        it('should list triggers', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/triggers')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
        it('should update trigger status', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .patch(`/api/triggers/${testCapsule.trigger.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                status: 'completed',
                evidence: { reason: 'Test completion' },
            });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('completed');
        });
    });
    describe('Consensus', () => {
        let consensusCapsule;
        beforeAll(async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/capsules')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                content: {
                    type: 'text',
                    data: 'Consensus test content',
                },
                recipients: ['voter1@example.com', 'voter2@example.com'],
                trigger: {
                    type: 'consensus',
                    conditions: {
                        description: 'Test consensus',
                    },
                },
            });
            consensusCapsule = response.body;
        });
        it('should list consensus groups', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/consensus')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
        it('should submit a vote', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post(`/api/consensus/${consensusCapsule.consensus.id}/vote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                vote: 'approved',
            });
            expect(response.status).toBe(200);
        });
    });
});
//# sourceMappingURL=api.test.js.map