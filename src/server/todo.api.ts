import axios from 'axios';
import type {
  User,
  Project,
  Task,
  LoginPayload,
  RegisterPayload,
  CreateProjectPayload,
  CreateTaskPayload,
  UpdateTask,
} from '../types/Types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

//===== auth =====
export const authAPI = {
  login: (loginData: LoginPayload) =>
    api
      .post<{ access_token: string; user: User }>('/users/login', loginData)
      .then((res) => res.data),
  register: (registerData: RegisterPayload) =>
    api.post<User>('/users', registerData).then((res) => res.data),
};

//===== projects =====
export const projectAPI = {
  addProject: (project: CreateProjectPayload) =>
    api.post<Project>('/projects', project).then((res) => res.data),
  getAllProjects: () =>
    api.get<Project[]>('/projects').then((res) => res.data),
  getProjectById: (projectId: string) =>
    api.get<Project>(`/projects/${projectId}`).then((res) => res.data),
  updateProject: (projectId: string, project: Partial<CreateProjectPayload>) =>
    api.put<Project>(`/projects/${projectId}`, project).then((res) => res.data),
  removeProject: (projectId: string) =>
    api.delete(`/projects/${projectId}`).then((res) => res.data),
};

//===== tasks =====
export const taskAPI = {
  addTask: (task: CreateTaskPayload) =>
    api.post<Task>('/tasks', task).then((res) => res.data),
  getAllTasks: () =>
    api.get<Task[]>('/tasks').then((res) => res.data),
  getTaskById: (taskId: string) =>
    api.get<Task>(`/tasks/${taskId}`).then((res) => res.data),
  updateTask: (taskId: string, task: Partial<UpdateTask>) =>
    api.patch<Task>(`/tasks/${taskId}`, task).then((res) => res.data),
  removeTask: (taskId: string) =>
    api.delete(`/tasks/${taskId}`).then((res) => res.data),
};