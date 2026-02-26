import { TaskStatus } from '@taskmanager/shared';

export const COLUMNS: { id: TaskStatus; title: string; dotClass: string }[] = [
  { id: TaskStatus.DA_FARE, title: 'Da Fare', dotClass: 'dot-todo' },
  { id: TaskStatus.IN_SVILUPPO, title: 'In Sviluppo', dotClass: 'dot-dev' },
  { id: TaskStatus.IN_TEST, title: 'In Test', dotClass: 'dot-test' },
  { id: TaskStatus.IN_PROD, title: 'In Prod', dotClass: 'dot-prod' },
  { id: TaskStatus.IN_DEV, title: 'In Dev', dotClass: 'dot-dev' },
  { id: TaskStatus.IN_PAUSA, title: 'In Pausa', dotClass: 'dot-paused' },
  { id: TaskStatus.COMPLETATO, title: 'Completato', dotClass: 'dot-success' },
  { id: TaskStatus.ANNULLATO, title: 'Annullato', dotClass: 'dot-canceled' },
];
