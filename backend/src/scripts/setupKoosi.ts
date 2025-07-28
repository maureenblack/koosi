import { prisma } from '../lib/prisma';
import { initRoles } from './initRoles';
import bcrypt from 'bcryptjs';

async function setupKoosi() {
  try {
    console.log('Starting Koosi platform setup...');

    // 1. Initialize default roles
    await initRoles();

    // 2. Create root admin user if not exists
    const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@koosi.com';
    const adminPassword = process.env.ROOT_ADMIN_PASSWORD || 'admin123'; // Change in production
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Koosi Admin',
      },
    });

    console.log('Root admin user created/updated');

    // 3. Create Koosi root organization if not exists
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const existingRootOrg = await prisma.organization.findFirst({
      where: { type: 'root' },
    });

    const rootOrg = await prisma.organization.upsert({
      where: { id: existingRootOrg?.id || 'new' },
      update: {},
      create: {
        name: 'Koosi Platform',
        type: 'root',
        description: 'The root organization for the Koosi platform',
        website: 'https://koosi.com',
        memberships: {
          create: {
            userId: adminUser.id,
            roleId: adminRole.id,
            status: 'active',
          },
        },
      },
    });

    console.log('Root organization created/updated');

    // 4. Create organization templates
    const templates = [
      {
        name: 'Family',
        type: 'family',
        description: 'Template for family organizations',
      },
      {
        name: 'Group',
        type: 'group',
        description: 'Template for group organizations',
      },
      {
        name: 'Institution',
        type: 'institution',
        description: 'Template for institutional organizations',
      },
    ];

    for (const template of templates) {
      const existingTemplate = await prisma.organization.findFirst({
        where: {
          name: `${template.name} Template`,
          type: template.type,
        },
      });

      await prisma.organization.upsert({
        where: { id: existingTemplate?.id || `new-${template.type}` },
        update: {},
        create: {
          name: `${template.name} Template`,
          type: template.type,
          description: template.description,
          parentOrgId: rootOrg.id,
          memberships: {
            create: {
              userId: adminUser.id,
              roleId: adminRole.id,
              status: 'active',
            },
          },
        },
      });
    }

    console.log('Organization templates created/updated');
    console.log('Koosi platform setup completed successfully');

  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  setupKoosi();
}

export { setupKoosi };
