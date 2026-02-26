import { Project } from '@taskmanager/shared';
import { db } from '../db';
import { projects } from '../db/schema';

export class ProjectService {
  async getProjects(): Promise<Project[]> {
    const allProjects = await db.select().from(projects);
    return allProjects.map(p => new Project(p as any));
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    new Project(data); // Validate inputs
    const newProject = {
      id: `p-${Date.now()}`,
      name: data.name || 'Nuovo Progetto',
      description: data.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedByUserId: 'u-1', // Default for now, as we don't have proper auth session
    };

    const [insertedProject] = await db.insert(projects).values(newProject).returning();
    return new Project(insertedProject as any);
  }
}

export const projectService = new ProjectService();
