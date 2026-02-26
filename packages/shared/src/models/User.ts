export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export class User {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string; // Used for portal access
  password?: string; // Hashed password
  role!: UserRole;
  createdAt!: Date;
  updatedAt?: Date;
  updatedByUserId?: string;

  constructor(init?: Partial<User>) {
    if (init) {
      if (init.email && !init.email.includes('@')) {
        throw new Error('Email non valida');
      }
      Object.assign(this, init);
    }
  }
}
