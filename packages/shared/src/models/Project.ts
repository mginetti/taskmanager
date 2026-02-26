export class Project {
  id!: string;
  name!: string;
  description?: string;
  createdAt!: Date;
  updatedAt?: Date;
  updatedByUserId?: string;

  constructor(init?: Partial<Project>) {
    if (init) {
      if (init.name !== undefined && init.name.trim() === '') {
        throw new Error('Il nome del progetto non può essere vuoto');
      }
      Object.assign(this, init);
    }
  }
}
