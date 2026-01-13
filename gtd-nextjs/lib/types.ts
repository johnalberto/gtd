// Database types based on schema.sql

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Context {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  created_at: Date;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  priority: Priority;
  is_actionable: boolean | null;
  project_id: string | null;
  parent_task_id: string | null;
  due_date: Date | null;
  completed_at: Date | null;
  notified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TaskWithRelations extends Task {
  project?: Project;
  contexts?: Context[];
  subtasks?: Task[];
}

export interface Reminder {
  id: string;
  task_id: string;
  reminder_time: Date;
  notified: boolean;
  created_at: Date;
}

export type TaskStatus = 'inbox' | 'next-actions' | 'waiting' | 'someday' | 'completed' | 'trash';
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types
export interface CreateTaskInput {
  title: string;
  notes?: string;
  status?: TaskStatus;
  priority?: Priority;
  is_actionable?: boolean;
  project_id?: string;
  parent_task_id?: string;
  due_date?: Date;
  context_ids?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  completed_at?: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
}

export interface CreateContextInput {
  name: string;
  icon?: string;
}

export interface UpdateContextInput extends Partial<CreateContextInput> {
  id: string;
}
