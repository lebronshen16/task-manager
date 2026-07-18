import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "https://task-manager-fq4n.vercel.app/api",
  timeout: 10000,
});

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  priority: "high" | "medium" | "low";
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  total?: number;
  message?: string;
}

export const getTasks = (params?: { search?: string; status?: string; priority?: string }) =>
  api.get<ApiResponse<Task[]>>("/tasks", { params });

export const getTask = (id: number) =>
  api.get<ApiResponse<Task>>(`/tasks/${id}`);

export const createTask = (data: Partial<Task>) =>
  api.post<ApiResponse<Task>>("/tasks", data);

export const updateTask = (id: number, data: Partial<Task>) =>
  api.put<ApiResponse<Task>>(`/tasks/${id}`, data);

export const deleteTask = (id: number) =>
  api.delete<ApiResponse<null>>(`/tasks/${id}`);

export default api;