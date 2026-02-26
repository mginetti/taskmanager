import { Task } from '@taskmanager/shared';
import { db } from '../db';
import { tasks } from '../db/schema';
import { ilike, or, eq } from 'drizzle-orm';

export class TaskService {
  async getTasks(search?: string): Promise<Task[]> {
    if (search) {
      const allTasks = await db.select().from(tasks).where(
        or(
          ilike(tasks.title, `%${search}%`),
          ilike(tasks.description, `%${search}%`)
        )
      );
      return allTasks.map(t => new Task(t as any));
    }
    const allTasks = await db.select().from(tasks);
    return allTasks.map(t => new Task(t as any));
  }

  async createTask(data: Partial<Task>): Promise<Task> {
    new Task(data); // Validate inputs
    const newTask = {
      id: `t-${Date.now()}`,
      projectId: data.projectId && data.projectId.trim() !== '' ? data.projectId : 'p-1', // Default to p-1 only if needed but ideally frontend provides it
      title: data.title || 'Nuovo Task',
      description: data.description || '',
      status: data.status || 'DA_FARE',
      effortHours: data.effortHours || 0,
      assignedToUserId: data.assignedToUserId && data.assignedToUserId.trim() !== '' ? data.assignedToUserId : null,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
      updatedByUserId: data.updatedByUserId && data.updatedByUserId.trim() !== '' ? data.updatedByUserId : null,
    };

    const [insertedTask] = await db.insert(tasks).values(newTask as any).returning();
    return new Task(insertedTask as any);
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    new Task(data); // Validate partial inputs
    const updateData = {
      ...data,
      updatedAt: new Date(),
      updatedByUserId: data.updatedByUserId && data.updatedByUserId.trim() !== '' ? data.updatedByUserId : null,
    };
    
    if (updateData.startedAt && typeof updateData.startedAt === 'string') {
      updateData.startedAt = new Date(updateData.startedAt);
    }
    if (updateData.currentSessionStartedAt && typeof updateData.currentSessionStartedAt === 'string') {
      updateData.currentSessionStartedAt = new Date(updateData.currentSessionStartedAt);
    }
    if (updateData.currentSessionStartedAt === null) {
      updateData.currentSessionStartedAt = null;
    }
    if (updateData.pausedAt && typeof updateData.pausedAt === 'string') {
      updateData.pausedAt = new Date(updateData.pausedAt);
    }
    if (updateData.completedAt && typeof updateData.completedAt === 'string') {
      updateData.completedAt = new Date(updateData.completedAt);
    }
    if (updateData.createdAt && typeof updateData.createdAt === 'string') {
      updateData.createdAt = new Date(updateData.createdAt);
    }

    delete updateData.id;

    const [updatedTask] = await db.update(tasks)
      .set(updateData as any)
      .where(eq(tasks.id, id))
      .returning();
    return new Task(updatedTask as any);
  }

  async deleteTask(id: string): Promise<boolean> {
    const [deletedTask] = await db.delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return !!deletedTask;
  }
}

export const taskService = new TaskService();
