export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type EpicStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';
export type ReleaseStatus = 'planned' | 'in_progress' | 'released' | 'cancelled';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type SprintStatus = 'planning' | 'active' | 'completed';
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';
export type ViewType = 'board' | 'list' | 'timeline' | 'calendar';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  capacity: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  projectId: string;
  sprintId: string | null;
  parentId: string | null;
  labels: string[];
  storyPoints: number | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  timeEstimate: number;
  timeSpent: number;
  dependencies: string[];
  subtasks: string[];
  epicId?: string | null;
  releaseId?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  teamIds: string[];
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  health: 'green' | 'yellow' | 'red';
  progress: number;
  portfolioId: string | null;
  color: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  projectIds: string[];
  strategicGoals: string[];
  budget: number;
  spent: number;
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  goal: string;
  velocity: number;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  status: EpicStatus;
  progress: number;
  ownerId: string;
  projectId: string;
  startDate?: string;
  targetDate?: string;
}

export interface Release {
  id: string;
  name: string;
  description: string;
  status: ReleaseStatus;
  projectId: string;
  targetDate: string;
  releaseDate?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'task_created' | 'task_updated' | 'task_moved' | 'comment_added' | 'sprint_started' | 'sprint_completed';
  entityId: string;
  entityType: 'task' | 'project' | 'sprint';
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'list';
  title: string;
  config: Record<string, unknown>;
}
