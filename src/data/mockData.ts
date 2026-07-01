import type { User, Task, Project, Portfolio, Sprint, Comment, Epic, Release } from '@/types';

export const users: User[] = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@nexuspm.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', role: 'admin', department: 'Engineering', capacity: 40 },
  { id: 'u2', name: 'Sarah Miller', email: 'sarah@nexuspm.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'manager', department: 'Product', capacity: 35 },
  { id: 'u3', name: 'James Wilson', email: 'james@nexuspm.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', role: 'member', department: 'Engineering', capacity: 40 },
  { id: 'u4', name: 'Emily Davis', email: 'emily@nexuspm.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', role: 'member', department: 'Design', capacity: 35 },
  { id: 'u5', name: 'Michael Brown', email: 'michael@nexuspm.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', role: 'member', department: 'Engineering', capacity: 40 },
  { id: 'u6', name: 'Lisa Wang', email: 'lisa@nexuspm.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', role: 'manager', department: 'Marketing', capacity: 30 },
  { id: 'u7', name: 'David Kim', email: 'david@nexuspm.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', role: 'viewer', department: 'Executive', capacity: 10 },
];

export const portfolios: Portfolio[] = [
  {
    id: 'port1',
    name: 'Q4 2024 Strategic Initiatives',
    description: 'Core product and platform improvements for Q4',
    ownerId: 'u1',
    projectIds: ['proj1', 'proj2', 'proj3'],
    strategicGoals: ['Increase user engagement', 'Improve platform stability', 'Expand enterprise features'],
    budget: 2500000,
    spent: 1800000,
  },
  {
    id: 'port2',
    name: 'Enterprise Transformation',
    description: 'Digital transformation initiatives for enterprise clients',
    ownerId: 'u2',
    projectIds: ['proj4', 'proj5'],
    strategicGoals: ['Modernize legacy systems', 'Improve data security', 'Enhance compliance'],
    budget: 4200000,
    spent: 2100000,
  },
  {
    id: 'port3',
    name: 'AI & ML Platform',
    description: 'Machine learning infrastructure and AI feature rollout',
    ownerId: 'u1',
    projectIds: ['proj6'],
    strategicGoals: ['Deploy AI-powered features', 'Build ML pipeline', 'Establish data lake'],
    budget: 1800000,
    spent: 900000,
  },
];

export const projects: Project[] = [
  { id: 'proj1', name: 'Platform Redesign', description: 'Complete UI/UX overhaul of the core platform', status: 'active', ownerId: 'u2', teamIds: ['u1', 'u3', 'u4'], startDate: '2024-10-01', endDate: '2024-12-31', budget: 800000, spent: 450000, health: 'green', progress: 62, portfolioId: 'port1', color: '#8b5cf6' },
  { id: 'proj2', name: 'Mobile App v3.0', description: 'Native mobile applications with offline support', status: 'active', ownerId: 'u3', teamIds: ['u3', 'u5'], startDate: '2024-09-15', endDate: '2025-01-15', budget: 600000, spent: 320000, health: 'yellow', progress: 45, portfolioId: 'port1', color: '#06b6d4' },
  { id: 'proj3', name: 'API Gateway Modernization', description: 'Migrate to GraphQL and microservices architecture', status: 'planning', ownerId: 'u1', teamIds: ['u1', 'u5'], startDate: '2024-11-01', endDate: '2025-03-31', budget: 500000, spent: 120000, health: 'green', progress: 15, portfolioId: 'port1', color: '#10b981' },
  { id: 'proj4', name: 'SOC 2 Compliance', description: 'Achieve SOC 2 Type II certification', status: 'active', ownerId: 'u2', teamIds: ['u2', 'u6'], startDate: '2024-08-01', endDate: '2025-02-28', budget: 1200000, spent: 800000, health: 'yellow', progress: 70, portfolioId: 'port2', color: '#f59e0b' },
  { id: 'proj5', name: 'Enterprise SSO', description: 'Single sign-on integration for enterprise customers', status: 'active', ownerId: 'u1', teamIds: ['u1', 'u3'], startDate: '2024-10-15', endDate: '2024-12-15', budget: 400000, spent: 280000, health: 'green', progress: 78, portfolioId: 'port2', color: '#ef4444' },
  { id: 'proj6', name: 'AI Copilot Integration', description: 'Integrate LLM-powered assistant across the platform', status: 'active', ownerId: 'u4', teamIds: ['u4', 'u1', 'u5'], startDate: '2024-11-01', endDate: '2025-04-30', budget: 800000, spent: 350000, health: 'green', progress: 35, portfolioId: 'port3', color: '#ec4899' },
];

export const sprints: Sprint[] = [
  { id: 'sprint1', name: 'Sprint 23 - October', projectId: 'proj1', status: 'completed', startDate: '2024-10-01', endDate: '2024-10-14', goal: 'Complete design system and component library', velocity: 42 },
  { id: 'sprint2', name: 'Sprint 24 - October', projectId: 'proj1', status: 'completed', startDate: '2024-10-15', endDate: '2024-10-28', goal: 'Dashboard redesign and navigation improvements', velocity: 38 },
  { id: 'sprint3', name: 'Sprint 25 - November', projectId: 'proj1', status: 'active', startDate: '2024-10-29', endDate: '2024-11-11', goal: 'Settings panel and user preferences', velocity: 0 },
  { id: 'sprint4', name: 'Sprint 26 - November', projectId: 'proj1', status: 'planning', startDate: '2024-11-12', endDate: '2024-11-25', goal: 'Final polish and accessibility audit', velocity: 0 },
  { id: 'sprint5', name: 'Sprint 21 - October', projectId: 'proj2', status: 'completed', startDate: '2024-10-01', endDate: '2024-10-14', goal: 'Offline sync engine implementation', velocity: 35 },
  { id: 'sprint6', name: 'Sprint 22 - October', projectId: 'proj2', status: 'active', startDate: '2024-10-15', endDate: '2024-10-28', goal: 'Push notifications and deep linking', velocity: 0 },
];

export const epics: Epic[] = [
  { id: 'epic1', title: 'User Authentication Redesign', description: 'Overhaul the login and signup flows', status: 'in_progress', progress: 45, ownerId: 'u2', projectId: 'proj1', startDate: '2024-10-01', targetDate: '2024-11-15' },
  { id: 'epic2', title: 'Dashboard V2', description: 'New analytics and widgets for the main dashboard', status: 'planning', progress: 0, ownerId: 'u1', projectId: 'proj1', startDate: '2024-11-01', targetDate: '2024-12-15' },
  { id: 'epic3', title: 'Mobile Offline Mode', description: 'Full offline support for iOS and Android', status: 'in_progress', progress: 75, ownerId: 'u3', projectId: 'proj2', startDate: '2024-09-15', targetDate: '2024-11-30' },
];

export const releases: Release[] = [
  { id: 'rel1', name: 'v2.0 Beta', description: 'Initial beta rollout for key customers', status: 'in_progress', projectId: 'proj1', targetDate: '2024-11-30' },
  { id: 'rel2', name: 'v2.0 GA', description: 'General availability for v2.0', status: 'planned', projectId: 'proj1', targetDate: '2024-12-31' },
];

export const tasks: Task[] = [
  { id: 't1', title: 'Design system tokens', description: 'Create color, typography, and spacing tokens', status: 'done', priority: 'high', assigneeId: 'u4', projectId: 'proj1', sprintId: 'sprint1', parentId: null, labels: ['design', 'foundation'], storyPoints: 8, dueDate: '2024-10-05', createdAt: '2024-09-28', updatedAt: '2024-10-04', timeEstimate: 16, timeSpent: 14, dependencies: [], subtasks: [] },
  { id: 't2', title: 'Component library setup', description: 'Initialize Storybook and core components', status: 'done', priority: 'high', assigneeId: 'u3', projectId: 'proj1', sprintId: 'sprint1', parentId: null, labels: ['frontend', 'foundation'], storyPoints: 13, dueDate: '2024-10-08', createdAt: '2024-09-28', updatedAt: '2024-10-07', timeEstimate: 24, timeSpent: 22, dependencies: ['t1'], subtasks: [] },
  { id: 't3', title: 'Navigation refactor', description: 'Redesign sidebar and top navigation', status: 'done', priority: 'medium', assigneeId: 'u4', projectId: 'proj1', sprintId: 'sprint2', parentId: null, labels: ['design', 'ux'], storyPoints: 5, dueDate: '2024-10-18', createdAt: '2024-10-10', updatedAt: '2024-10-17', timeEstimate: 10, timeSpent: 8, dependencies: ['t2'], subtasks: [] },
  { id: 't4', title: 'Dashboard widgets', description: 'Create reusable dashboard widget components', status: 'in_progress', priority: 'high', assigneeId: 'u3', projectId: 'proj1', sprintId: 'sprint2', parentId: null, labels: ['frontend', 'dashboard'], storyPoints: 8, dueDate: '2024-10-22', createdAt: '2024-10-10', updatedAt: '2024-10-20', timeEstimate: 16, timeSpent: 10, dependencies: ['t2'], subtasks: [] },
  { id: 't5', title: 'Settings API endpoints', description: 'Build REST endpoints for user settings', status: 'todo', priority: 'medium', assigneeId: 'u1', projectId: 'proj1', sprintId: 'sprint3', parentId: null, labels: ['backend', 'api'], storyPoints: 5, dueDate: '2024-11-05', createdAt: '2024-10-25', updatedAt: '2024-10-25', timeEstimate: 10, timeSpent: 0, dependencies: [], subtasks: [] },
  { id: 't6', title: 'Accessibility audit', description: 'WCAG 2.1 AA compliance check', status: 'todo', priority: 'high', assigneeId: 'u4', projectId: 'proj1', sprintId: 'sprint4', parentId: null, labels: ['a11y', 'qa'], storyPoints: 13, dueDate: '2024-11-20', createdAt: '2024-10-25', updatedAt: '2024-10-25', timeEstimate: 24, timeSpent: 0, dependencies: ['t3'], subtasks: [] },
  { id: 't7', title: 'Offline sync engine', description: 'Implement local storage and conflict resolution', status: 'done', priority: 'urgent', assigneeId: 'u3', projectId: 'proj2', sprintId: 'sprint5', parentId: null, labels: ['mobile', 'sync'], storyPoints: 21, dueDate: '2024-10-10', createdAt: '2024-09-25', updatedAt: '2024-10-09', timeEstimate: 40, timeSpent: 38, dependencies: [], subtasks: [] },
  { id: 't8', title: 'Push notifications', description: 'FCM and APNs integration', status: 'in_progress', priority: 'high', assigneeId: 'u5', projectId: 'proj2', sprintId: 'sprint6', parentId: null, labels: ['mobile', 'notifications'], storyPoints: 8, dueDate: '2024-10-25', createdAt: '2024-10-12', updatedAt: '2024-10-20', timeEstimate: 16, timeSpent: 6, dependencies: ['t7'], subtasks: [] },
  { id: 't9', title: 'Deep linking', description: 'Universal links and custom URL schemes', status: 'todo', priority: 'medium', assigneeId: 'u5', projectId: 'proj2', sprintId: 'sprint6', parentId: null, labels: ['mobile', 'routing'], storyPoints: 5, dueDate: '2024-10-28', createdAt: '2024-10-12', updatedAt: '2024-10-12', timeEstimate: 10, timeSpent: 0, dependencies: ['t8'], subtasks: [] },
  { id: 't10', title: 'GraphQL schema design', description: 'Design federated GraphQL schema', status: 'todo', priority: 'high', assigneeId: 'u1', projectId: 'proj3', sprintId: null, parentId: null, labels: ['backend', 'graphql'], storyPoints: 13, dueDate: '2024-11-15', createdAt: '2024-10-20', updatedAt: '2024-10-20', timeEstimate: 24, timeSpent: 0, dependencies: [], subtasks: [] },
  { id: 't11', title: 'Audit log implementation', description: 'Comprehensive audit logging for compliance', status: 'done', priority: 'high', assigneeId: 'u2', projectId: 'proj4', sprintId: null, parentId: null, labels: ['compliance', 'security'], storyPoints: 8, dueDate: '2024-10-15', createdAt: '2024-10-01', updatedAt: '2024-10-14', timeEstimate: 16, timeSpent: 14, dependencies: [], subtasks: [] },
  { id: 't12', title: 'Encryption at rest', description: 'Database encryption for sensitive data', status: 'in_progress', priority: 'urgent', assigneeId: 'u1', projectId: 'proj4', sprintId: null, parentId: null, labels: ['compliance', 'security'], storyPoints: 13, dueDate: '2024-11-01', createdAt: '2024-10-15', updatedAt: '2024-10-22', timeEstimate: 24, timeSpent: 12, dependencies: ['t11'], subtasks: [] },
  { id: 't13', title: 'SAML integration', description: 'SAML 2.0 SSO provider integration', status: 'done', priority: 'high', assigneeId: 'u3', projectId: 'proj5', sprintId: null, parentId: null, labels: ['sso', 'enterprise'], storyPoints: 13, dueDate: '2024-11-01', createdAt: '2024-10-05', updatedAt: '2024-10-30', timeEstimate: 24, timeSpent: 22, dependencies: [], subtasks: [] },
  { id: 't14', title: 'OIDC support', description: 'OpenID Connect provider support', status: 'in_progress', priority: 'high', assigneeId: 'u1', projectId: 'proj5', sprintId: null, parentId: null, labels: ['sso', 'enterprise'], storyPoints: 8, dueDate: '2024-11-10', createdAt: '2024-10-15', updatedAt: '2024-10-25', timeEstimate: 16, timeSpent: 8, dependencies: ['t13'], subtasks: [] },
  { id: 't15', title: 'LLM prompt engineering', description: 'Design and optimize system prompts', status: 'in_progress', priority: 'high', assigneeId: 'u4', projectId: 'proj6', sprintId: null, parentId: null, labels: ['ai', 'ml'], storyPoints: 8, dueDate: '2024-11-15', createdAt: '2024-10-20', updatedAt: '2024-10-28', timeEstimate: 16, timeSpent: 10, dependencies: [], subtasks: [] },
  { id: 't16', title: 'Vector database setup', description: 'Deploy and configure vector store for embeddings', status: 'todo', priority: 'high', assigneeId: 'u5', projectId: 'proj6', sprintId: null, parentId: null, labels: ['ai', 'infrastructure'], storyPoints: 13, dueDate: '2024-11-30', createdAt: '2024-10-20', updatedAt: '2024-10-20', timeEstimate: 24, timeSpent: 0, dependencies: [], subtasks: [] },
];

export const comments: Comment[] = [
  { id: 'c1', taskId: 't1', userId: 'u2', content: 'Great work on the color palette! The contrast ratios look perfect.', createdAt: '2024-10-04T14:30:00Z' },
  { id: 'c2', taskId: 't2', userId: 'u1', content: 'Can we add the Button and Input components to the initial scope?', createdAt: '2024-10-06T10:15:00Z' },
  { id: 'c3', taskId: 't4', userId: 'u2', content: 'The chart widgets need responsive sizing for mobile.', createdAt: '2024-10-20T16:45:00Z' },
  { id: 'c4', taskId: 't7', userId: 'u2', content: 'Excellent implementation. The conflict resolution is very robust.', createdAt: '2024-10-09T11:00:00Z' },
];
