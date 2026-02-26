export enum TaskStatus {
  DA_FARE = 'DA_FARE',
  IN_SVILUPPO = 'IN_SVILUPPO',
  IN_PAUSA = 'IN_PAUSA',
  ANNULLATO = 'ANNULLATO',
  COMPLETATO = 'COMPLETATO',
  IN_TEST = 'IN_TEST',
  IN_PROD = 'IN_PROD',
  IN_DEV = 'IN_DEV',
}

export class Task {
  id!: string;
  projectId!: string; // Association to the Project model
  title!: string;
  description?: string;
  status!: TaskStatus;
  effortHours?: number; // Effort in hours
  assignedToUserId?: string;  // Assigned to User ID
  createdAt!: Date;
  updatedAt?: Date;
  updatedByUserId?: string;
  startedAt?: Date | null;
  currentSessionStartedAt?: Date | null;
  pausedAt?: Date | null;
  completedAt?: Date | null;
  actualEffortMinutes?: number;

  constructor(init?: Partial<Task>) {
    if (init) {
      if (init.title !== undefined && init.title.trim() === '') {
        throw new Error('Il titolo del task non può essere vuoto');
      }
      if (init.effortHours !== undefined && init.effortHours < 0) {
        throw new Error('Le ore di effort non possono essere negative');
      }
      Object.assign(this, init);
    }
  }
}
