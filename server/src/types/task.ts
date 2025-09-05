export interface ITask {
  _id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface CreateTaskRequest {
  title: string;
  description: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data?: ITask | ITask[];
  count?: number;
  error?: string;
}

export interface TaskQuery {
  status?: TaskStatus;
  search?: string;
  page?: number;
  limit?: number;
}