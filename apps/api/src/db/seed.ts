import { db } from './index';
import { projects, tasks, users } from './schema';

async function seed() {
  console.log('Clearing DB...');
  await db.delete(tasks);
  await db.delete(projects);
  await db.delete(users);

  console.log('Inserting seed data...');
  // Users
  await db.insert(users).values([
    {
      id: 'u-1',
      firstName: 'Matteo',
      lastName: 'Ginetti',
      email: 'matteo@example.com',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedByUserId: 'u-1',
    }
  ]);

  // Projects
  await db.insert(projects).values([
    {
      id: 'p-1',
      name: 'Main Backoffice Redesign',
      description: 'Redesigning the internal backoffice system for the new UI.',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedByUserId: 'u-1',
    }
  ]);

  // Tasks (matching Gantt data)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const offsetDay = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d;
  };

  await db.insert(tasks).values([
    {
      id: 't-1', projectId: 'p-1',
      title: 'Security Audit Phase 1',
      status: 'COMPLETATO', effortHours: 40,
      createdAt: offsetDay(-3), assignedToUserId: 'u-1',
      updatedAt: offsetDay(-3), updatedByUserId: 'u-1',
    },
    {
      id: 't-2', projectId: 'p-1',
      title: 'Email Notification Engine',
      status: 'IN_PROD', effortHours: 64,
      createdAt: offsetDay(-2), assignedToUserId: 'u-1',
      updatedAt: offsetDay(-2), updatedByUserId: 'u-1',
    },
    {
      id: 't-3', projectId: 'p-1',
      title: 'Advanced Filter Module',
      status: 'IN_TEST', effortHours: 48,
      createdAt: offsetDay(0), assignedToUserId: 'u-1',
      updatedAt: offsetDay(0), updatedByUserId: 'u-1',
    },
    {
      id: 't-4', projectId: 'p-1',
      title: 'User Profile API Refactor',
      status: 'IN_SVILUPPO', effortHours: 120,
      createdAt: offsetDay(1), assignedToUserId: 'u-1',
      updatedAt: offsetDay(1), updatedByUserId: 'u-1',
    },
    {
      id: 't-5', projectId: 'p-1',
      title: 'External Payment Gateway',
      status: 'IN_PAUSA', effortHours: 80,
      createdAt: offsetDay(3), assignedToUserId: 'u-1',
      updatedAt: offsetDay(3), updatedByUserId: 'u-1',
    },
    {
      id: 't-6', projectId: 'p-1',
      title: 'Final Documentation',
      status: 'DA_FARE', effortHours: 32,
      createdAt: offsetDay(5), assignedToUserId: 'u-1',
      updatedAt: offsetDay(5), updatedByUserId: 'u-1',
    },
    {
      id: 't-7', projectId: 'p-1',
      title: 'Real-time Dashboard Analytics',
      status: 'IN_DEV', effortHours: 96,
      createdAt: offsetDay(-1), assignedToUserId: 'u-1',
      updatedAt: offsetDay(-1), updatedByUserId: 'u-1',
    },
  ]);

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
