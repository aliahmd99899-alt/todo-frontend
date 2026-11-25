import type { ElementType } from 'react';
import type{TaskCategory} from '../enum/enums'

export type User = {
  id: string;
  name: string;
  email: string;
  projects?: Project[];
  tasks?: Task[];
  createdAt: Date;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
};


export type Project = {
  id: string;
  name: string;
  color?: string;
  userId: string;
  user?: User;
  tasks?: Task[];
  tasksCount?: number;
  createdAt: string;
};

export type Url = {
  label: string;
  active?: boolean;
  badge?: string;
  href: string;
  icon?: ElementType;
};

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  dueDate: string | null;
  done: boolean;
  archived: boolean;
  completedAt: string | null;

  projectId: string | null;
  project?: Project | null;

  userId: string;
  user?: User;

  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = {
  name: string;
  color?: string
};


export type UpdateTask = {
  title?: string;
  category?: TaskCategory;
  done?: boolean;
  archived?: boolean;
}

export type AccessToken= {
  user:User;
  access_token:string;
}


export type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
};



export type CreateTaskPayload = {
  title: string;
  projectId: string;
  category: 'Work' | 'Personal';
  dueDate: string;
};