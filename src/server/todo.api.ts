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
    api.post<{ access_token: string; user: User }>('/users/login', loginData),
  register: (registerData: RegisterPayload) =>
    api.post<User>('/users', registerData),
};

//===== projects =====
export const projectAPI = {
  addProject: (project: CreateProjectPayload) =>
    api.post<Project>('/projects', project),
  getAllProjects: () => api.get<Project[]>('/projects'),
  getProjectById: (projectId: string) =>
    api.get<Project>(`/projects/${projectId}`),
  updateProject: (projectId: string, project: Partial<CreateProjectPayload>) =>
    api.put<Project>(`/projects/${projectId}`, project),
  removeProject: (projectId: string) =>
    api.delete(`/projects/${projectId}`),
};

//===== tasks =====
export const taskAPI = {
  addTask: (task: CreateTaskPayload) => api.post<Task>('/tasks', task),
  getAllTasks: () => api.get<Task[]>('/tasks'),
  getTaskById: (taskId: string) => api.get<Task>(`/tasks/${taskId}`),
  updateTask: (taskId: string, task: Partial<UpdateTask>) =>
    api.put<Task>(`/tasks/${taskId}`, task),
  removeTask: (taskId: string) => api.delete(`/tasks/${taskId}`),
};