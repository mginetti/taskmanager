import { User } from '@taskmanager/shared';
import { db } from '../db';
import { users } from '../db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export class UserService {
  async getUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers.map(u => new User(u as any));
  }

  async createUser(data: Partial<User>): Promise<User> {
    new User(data); // Validate inputs
    const rawPassword = data.password || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = {
      id: `u-${Date.now()}`,
      firstName: data.firstName || 'Nuovo',
      lastName: data.lastName || 'Utente',
      email: data.email || `user-${Date.now()}@example.com`,
      password: hashedPassword,
      role: data.role || 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedByUserId: data.updatedByUserId && data.updatedByUserId.trim() !== '' ? data.updatedByUserId : null,
    };

    const [insertedUser] = await db.insert(users).values(newUser as any).returning();
    const { password, ...userWithoutPassword } = insertedUser;
    return new User(userWithoutPassword as any);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    new User(data); // Validate inputs
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
      updatedByUserId: data.updatedByUserId && data.updatedByUserId.trim() !== '' ? data.updatedByUserId : null,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }

    if (updateData.createdAt && typeof updateData.createdAt === 'string') {
      updateData.createdAt = new Date(updateData.createdAt);
    }

    delete updateData.id;

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    const { password, ...userWithoutPassword } = updatedUser;
    return new User(userWithoutPassword as any);
  }

  async login(email: string, passwordAttempt: string): Promise<{ user: User, token: string } | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(passwordAttempt, user.password);
    if (!isMatch) return null;

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: new User(userWithoutPassword as any) };
  }

  async deleteUser(id: string): Promise<boolean> {
    const [deletedUser] = await db.delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }
}

export const userService = new UserService();
