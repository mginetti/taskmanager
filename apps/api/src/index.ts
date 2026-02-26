import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { projectController } from './controllers/projectController';
import { taskController } from './controllers/taskController';
import { userController } from './controllers/userController';
import { authController } from './controllers/authController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/projects', projectController.getProjects);
app.post('/api/projects', projectController.createProject);
app.get('/api/tasks', taskController.getTasks);
app.post('/api/tasks', taskController.createTask);
app.patch('/api/tasks/:id', taskController.updateTask);
app.delete('/api/tasks/:id', taskController.deleteTask);
app.get('/api/users', userController.getUsers);
app.post('/api/users', userController.createUser);
app.patch('/api/users/:id', userController.updateUser);
app.delete('/api/users/:id', userController.deleteUser);

app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authController.me);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
