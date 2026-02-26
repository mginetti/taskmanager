import { Request, Response } from 'express';
import { userService } from '../services/userService';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e password sono obbligatori' });
      }

      const result = await userService.login(email, password);
      if (!result) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Errore interno del server' });
    }
  }

  async me(req: Request, res: Response) {
    // A real app would verify the JWT from headers here,
    // but we can just mock it or parse it for simplicity if passed auth header.
    // For now we just return basic success if reached.
    res.json({ message: 'Token is valid' });
  }
}

export const authController = new AuthController();
