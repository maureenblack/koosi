import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const organizationRoutes = Router();

// Validation schemas
const createOrganizationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['root', 'family', 'group', 'institution']),
  description: z.string().optional(),
  website: z.string().url().optional(),
  parentOrgId: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  roleId: z.string(),
});

// Create organization
organizationRoutes.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data = createOrganizationSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        ...data,
        memberships: {
          create: {
            userId,
            roleId: await getAdminRoleId(), // Function to get or create admin role
            status: 'active',
          },
        },
      },
    });

    res.json(organization);
  } catch (error) {
    handleError(error, res);
  }
});

// Get organizations for user
organizationRoutes.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const organizations = await prisma.organization.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        memberships: {
          include: {
            role: true,
          },
        },
      },
    });

    res.json(organizations);
  } catch (error) {
    handleError(error, res);
  }
});

// Invite member
organizationRoutes.post('/:orgId/invite', authenticate, async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const data = inviteMemberSchema.parse(req.body);

    // Check if user has admin role in organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId: orgId,
        role: {
          name: 'admin',
        },
      },
    });

    if (!membership) {
      throw new AppError('Unauthorized', 403);
    }

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email: data.email,
        organizationId: orgId,
        roleId: data.roleId,
        token: uuidv4(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // TODO: Send invitation email

    res.json(invitation);
  } catch (error) {
    handleError(error, res);
  }
});

// Accept invitation
organizationRoutes.post('/invitations/:token/accept', authenticate, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation) {
      throw new AppError('Invalid invitation', 404);
    }

    if (invitation.status !== 'pending') {
      throw new AppError('Invitation is no longer valid', 400);
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError('Invitation has expired', 400);
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        roleId: invitation.roleId,
        status: 'active',
      },
    });

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    });

    res.json(membership);
  } catch (error) {
    handleError(error, res);
  }
});

// Submit verification
organizationRoutes.post('/:orgId/verify', authenticate, async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const { type, data } = req.body;

    // Check if user has admin role in organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId: orgId,
        role: {
          name: 'admin',
        },
      },
    });

    if (!membership) {
      throw new AppError('Unauthorized', 403);
    }

    const verification = await prisma.verification.create({
      data: {
        organizationId: orgId,
        type,
        status: 'pending',
        data,
      },
    });

    res.json(verification);
  } catch (error) {
    handleError(error, res);
  }
});

// Helper function to get or create admin role
async function getAdminRoleId(): Promise<string> {
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (adminRole) {
    return adminRole.id;
  }

  const newAdminRole = await prisma.role.create({
    data: {
      name: 'admin',
      permissions: {
        manageOrganization: true,
        manageMembers: true,
        manageRoles: true,
        manageCapsules: true,
      },
    },
  });

  return newAdminRole.id;
}

// Error handler
function handleError(error: any, res: Response) {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: 'Invalid input data', details: error.format() });
  } else if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
  } else {
    console.error('Organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
