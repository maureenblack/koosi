import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import env from '../config/env';

describe('Koosi API Tests', () => {
  let authToken: string;
  let testUser: any;
  let testCapsule: any;

  beforeAll(async () => {
    // Create a test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      env.JWT_SECRET
    );
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  describe('Authentication', () => {
    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
    });
  });

  describe('Capsules', () => {
    it('should create a new capsule', async () => {
      const response = await request(app)
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
              openAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            },
          },
        });

      expect(response.status).toBe(201);
      testCapsule = response.body;
      expect(testCapsule.userId).toBe(testUser.id);
    });

    it('should list user capsules', async () => {
      const response = await request(app)
        .get('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get capsule by id', async () => {
      const response = await request(app)
        .get(`/api/capsules/${testCapsule.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testCapsule.id);
    });
  });

  describe('Triggers', () => {
    it('should list triggers', async () => {
      const response = await request(app)
        .get('/api/triggers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update trigger status', async () => {
      const response = await request(app)
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
    let consensusCapsule: any;

    beforeAll(async () => {
      // Create a consensus-based capsule
      const response = await request(app)
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
      const response = await request(app)
        .get('/api/consensus')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should submit a vote', async () => {
      const response = await request(app)
        .post(`/api/consensus/${consensusCapsule.consensus.id}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vote: 'approved',
        });

      expect(response.status).toBe(200);
    });
  });
});
