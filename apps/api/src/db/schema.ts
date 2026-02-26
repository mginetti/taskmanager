import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { TaskStatus, UserRole } from '@taskmanager/shared';

// Enums
export const roleEnum = pgEnum('role', ['ADMIN', 'MANAGER', 'USER']);
export const statusEnum = pgEnum('status', [
  'DA_FARE',
  'IN_SVILUPPO',
  'IN_PAUSA',
  'ANNULLATO',
  'COMPLETATO',
  'IN_TEST',
  'IN_PROD',
  'IN_DEV'
]);

// Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: roleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  updatedByUserId: text('updated_by_user_id'),
});

// Projects Table
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  updatedByUserId: text('updated_by_user_id').references(() => users.id),
});

// Tasks Table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  description: text('description'),
  status: statusEnum('status').default('DA_FARE').notNull(),
  effortHours: integer('effort_hours'),
  assignedToUserId: text('assigned_to_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  updatedByUserId: text('updated_by_user_id').references(() => users.id),
  startedAt: timestamp('started_at'),
  currentSessionStartedAt: timestamp('current_session_started_at'),
  pausedAt: timestamp('paused_at'),
  completedAt: timestamp('completed_at'),
  actualEffortMinutes: integer('actual_effort_minutes').default(0),
});
