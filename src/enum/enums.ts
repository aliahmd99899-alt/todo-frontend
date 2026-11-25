export const TaskCategory = {
  WORK: 'Work',
  PERSONAL: 'Personal',
} as const;

export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory];