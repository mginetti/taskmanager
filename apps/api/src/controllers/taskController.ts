import { Request, Response } from 'express';
import { taskService } from '../services/taskService';

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const search = req.query.search as string | undefined;
      const tasks = await taskService.getTasks(search);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const taskData = req.body;
      const newTask = await taskService.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error: any) {
      console.error("Create task error", error);
      res.status(500).json({ error: 'Errore interno del server' });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskData = req.body;
      const updatedTask = await taskService.updateTask(id, taskData);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await taskService.deleteTask(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const taskController = new TaskController();
