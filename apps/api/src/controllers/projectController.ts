import { Request, Response } from 'express';
import { projectService } from '../services/projectService';

export class ProjectController {
  async getProjects(req: Request, res: Response) {
    try {
      const projects = await projectService.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createProject(req: Request, res: Response) {
    try {
      const projectData = req.body;
      const newProject = await projectService.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const projectController = new ProjectController();
