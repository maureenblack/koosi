import { prisma } from '../lib/prisma';

const defaultRoles = [
  {
    name: 'admin',
    permissions: {
      manageOrganization: true,
      manageMembers: true,
      manageRoles: true,
      manageCapsules: true,
      manageVerifications: true,
    },
  },
  {
    name: 'creator',
    permissions: {
      createCapsules: true,
      manageCapsules: true,
      viewMembers: true,
    },
  },
  {
    name: 'recipient',
    permissions: {
      viewCapsules: true,
      viewMembers: true,
    },
  },
  {
    name: 'verifier',
    permissions: {
      verifyOrganization: true,
      viewMembers: true,
      viewCapsules: true,
    },
  },
];

async function initRoles() {
  try {
    console.log('Initializing default roles...');

    for (const role of defaultRoles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: { permissions: role.permissions },
        create: {
          name: role.name,
          permissions: role.permissions,
        },
      });
      console.log(`Role '${role.name}' created/updated`);
    }

    console.log('Default roles initialized successfully');
  } catch (error) {
    console.error('Error initializing roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initRoles();
}

export { initRoles };
