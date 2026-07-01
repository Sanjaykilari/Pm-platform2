import React, { useMemo, useState, useCallback } from 'react';
import './UserHomeDashboard.css';

// ──────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  // Strip time for proper date comparison
  const dDate = new Date(dateStr);
  dDate.setHours(23, 59, 59, 999);
  return dDate < new Date();
};

const getStatusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'healthy' || s === 'completed' || s === 'on track') return 'healthy';
  if (s === 'warning' || s === 'at_risk' || s === 'on_hold') return 'warning';
  if (s === 'risk' || s === 'critical' || s === 'high') return 'risk';
  return 'healthy';
};

// ──────────────────────────────────────────────────────────────
//  SVG CHECK ICON
// ──────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ──────────────────────────────────────────────────────────────
//  WELCOME BANNER SUB-COMPONENT
// ──────────────────────────────────────────────────────────────
const WelcomeBanner = ({ user, stats }) => {
  const initials = getInitials(user?.name);
  const greeting = getGreeting();

  return (
    <div className="welcome-banner">
      <div className="welcome-left">
        <div className="welcome-avatar">
          {initials}
        </div>
        <div className="welcome-greeting">
          <h1>{greeting}, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p>{user?.role || 'Team Member'}</p>
          {user?.company && user?.company !== 'Individual' && (
            <span className="org-badge">🏢 {user.company}</span>
          )}
        </div>
      </div>
      <div className="welcome-stats">
        <div className="welcome-stat">
          <div className="value">{stats.projects}</div>
          <div className="label">Projects</div>
        </div>
        <div className="welcome-stat">
          <div className="value">{stats.activeTasks}</div>
          <div className="label">My Tasks</div>
        </div>
        <div className="welcome-stat">
          <div className="value">{stats.overdueTasks}</div>
          <div className="label">Overdue</div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
//  QUICK ACTIONS SUB-COMPONENT
// ──────────────────────────────────────────────────────────────
const QuickActions = ({ user, onCreateProject, onAddTask, onLogRisk, onViewPortfolios }) => {
  const isCorporate = user?.role !== 'Individual User';

  return (
    <div className="quick-actions-bar">
      <button className="quick-action-btn primary" onClick={onCreateProject}>
        <span className="icon">➕</span> Create Project
      </button>
      <button className="quick-action-btn" onClick={onAddTask}>
        <span className="icon">📋</span> Add Task
      </button>
      <button className="quick-action-btn" onClick={onLogRisk}>
        <span className="icon">⚠️</span> Log Risk
      </button>
      {isCorporate && (
        <button className="quick-action-btn" onClick={onViewPortfolios}>
          <span className="icon">📊</span> Operations Center
        </button>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
//  PROJECTS WIDGET SUB-COMPONENT
// ──────────────────────────────────────────────────────────────
const ProjectsWidget = ({ projects, onProjectClick, onViewAll }) => {
  const visible = projects?.slice(0, 4) || [];

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">
          📁 Projects {projects?.length > 0 && <span className="count-badge">{projects.length}</span>}
        </span>
        {projects?.length > 4 && (
          <button className="widget-action-link" onClick={onViewAll}>
            View all →
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="widget-empty-state">
          <span className="widget-empty-icon">📂</span>
          <span className="widget-empty-text">No projects active. Create one to get started!</span>
        </div>
      ) : (
        <div className="projects-grid">
          {visible.map((p) => {
            const hasDeadline = !!p.deadline || !!p.dueDate || !!p.endDate;
            const targetDate = p.deadline || p.dueDate || p.endDate;
            const overdue = isOverdue(targetDate) && p.status !== 'completed';
            
            return (
              <div key={p.id} className="project-card" onClick={() => onProjectClick?.(p.id)}>
                <div className="project-card-top">
                  <div className="project-card-title">
                    {p.name}
                    <span className="project-card-owner">Lead: {p.owner || 'Unassigned'}</span>
                  </div>
                  <div className={`project-status-dot ${getStatusClass(p.status)}`} />
                </div>

                <div className="project-progress-container">
                  <div className="project-progress-bar">
                    <div className="project-progress-fill" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                  <span className="project-progress-text">{p.progress || 0}%</span>
                </div>

                <div className="project-card-meta">
                  <div className="project-team-avatars">
                    {(p.members || []).slice(0, 3).map((m, i) => (
                      <span key={i} className="project-team-avatar" title={m}>
                        {getInitials(m)}
                      </span>
                    ))}
                    {(p.members || []).length > 3 && (
                      <span className="project-team-avatar extra">
                        +{p.members.length - 3}
                      </span>
                    )}
                  </div>
                  <div className={`project-deadline ${overdue ? 'overdue' : ''}`}>
                    📅 {formatDate(targetDate) || 'No date'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
//  TASKS WIDGET SUB-COMPONENT
// ──────────────────────────────────────────────────────────────
const TasksWidget = ({ tasks, onTaskToggle, onViewAll }) => {
  const visible = tasks?.slice(0, 6) || [];

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">
          ✅ My Tasks {tasks?.length > 0 && <span className="count-badge">{tasks.length}</span>}
        </span>
        {tasks?.length > 6 && (
          <button className="widget-action-link" onClick={onViewAll}>
            View all →
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="widget-empty-state">
          <span className="widget-empty-icon">📋</span>
          <span className="widget-empty-text">No pending tasks assigned to you.</span>
        </div>
      ) : (
        <div className="tasks-list">
          {visible.map((t) => {
            const overdue = isOverdue(t.dueDate) && !t.done;
            return (
              <div key={t.id} className={`task-item ${overdue ? 'overdue' : ''}`}>
                <div 
                  className={`task-checkbox ${t.done ? 'checked' : ''}`}
                  onClick={() => onTaskToggle?.(t.id)}
                >
                  {t.done && <IconCheck />}
                </div>
                <div className="task-details">
                  <div className="task-title-row">
                    <span className={`task-title ${t.done ? 'completed' : ''}`}>{t.title}</span>
                    {t.priority && (
                      <span className={`task-priority-badge ${t.priority.toLowerCase()}`}>
                        {t.priority}
                      </span>
                    )}
                  </div>
                  <div className="task-meta-row">
                    {t.projectName && <span className="task-project-tag">{t.projectName}</span>}
                    <span className={`task-due-date ${overdue ? 'overdue' : ''}`}>
                      📅 {formatDate(t.dueDate) || 'No date'} {overdue && '⚠️ Overdue'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
//  RAID SUMMARY WIDGET SUB-COMPONENT
// ──────────────────────────────────────────────────────────────
const RAIDSummaryWidget = ({ risks, issues, actions, decisions, onItemClick }) => {
  const activeRisks = risks?.filter(r => r.status === 'open') || [];
  const criticalIssues = issues?.filter(i => i.severity === 'critical' && i.status !== 'closed') || [];
  const pendingActions = actions?.filter(a => a.status === 'pending' || a.status === 'in_progress') || [];
  const pendingDecisions = decisions?.filter(d => d.status === 'pending') || [];

  const cards = [
    {
      id: 'risks',
      label: 'Risks',
      value: risks?.length || 0,
      icon: '⚠️',
      subtext: `${activeRisks.length} open`,
      valueClass: activeRisks.length > 0 ? 'highlight-amber' : ''
    },
    {
      id: 'issues',
      label: 'Issues',
      value: issues?.length || 0,
      icon: '🚨',
      subtext: `${criticalIssues.length} critical`,
      valueClass: criticalIssues.length > 0 ? 'highlight-red' : ''
    },
    {
      id: 'actions',
      label: 'Actions',
      value: actions?.length || 0,
      icon: '🔔',
      subtext: `${pendingActions.length} pending`,
      valueClass: pendingActions.length > 0 ? 'highlight-blue' : ''
    },
    {
      id: 'decisions',
      label: 'Decisions',
      value: decisions?.length || 0,
      icon: '💡',
      subtext: `${pendingDecisions.length} pending`,
      valueClass: pendingDecisions.length > 0 ? 'highlight-blue' : ''
    }
  ];

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">🛡️ RAID Health & Actions</span>
      </div>

      <div className="raid-summary-grid">
        {cards.map((c) => (
          <div key={c.id} className="raid-summary-card" onClick={() => onItemClick?.(c.id)}>
            <span className="raid-card-icon">{c.icon}</span>
            <span className="raid-card-label">{c.label}</span>
            <div className={`raid-card-value ${c.valueClass}`}>{c.value}</div>
            <span className="raid-card-subtext">{c.subtext}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
//  APPROVAL QUEUE WIDGET SUB-COMPONENT (PPM Admin only)
// ──────────────────────────────────────────────────────────────
const ApprovalQueueWidget = ({ requests, onApprove, onReject }) => {
  const pending = requests?.filter(r => r.status === 'Pending') || [];

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">
          📨 Intake Approval Queue {pending.length > 0 && <span className="count-badge">{pending.length}</span>}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="widget-empty-state">
          <span className="widget-empty-icon">📨</span>
          <span className="widget-empty-text">No pending intake requests.</span>
        </div>
      ) : (
        <div className="approval-queue-list">
          {pending.slice(0, 3).map((r) => (
            <div key={r.id} className="approval-queue-item">
              <div className="approval-item-details">
                <span className="approval-item-name">{r.name}</span>
                <span className="approval-item-meta">Requested by: {r.requestor} • Budget: ${Number(r.budget || 0).toLocaleString()}</span>
              </div>
              <div className="approval-item-actions">
                <button className="approval-btn approve" onClick={() => onApprove?.(r.id)}>
                  Approve
                </button>
                <button className="approval-btn decline" onClick={() => onReject?.(r.id)}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
const UserHomeDashboard = ({
  currentUser,
  projects = [],
  tasks = [],
  intakeRequests = [],
  risks = [],
  issues = [],
  actions = [],
  decisions = [],
  onNavigate,
  setView,
  onCreateProject,
  onAddTask,
  onLogRisk,
  onApproveRequest,
  onRejectRequest,
  onTaskToggle
}) => {
  // derive stats
  const stats = useMemo(() => {
    const active = tasks.filter(t => !t.done && !isOverdue(t.dueDate)).length;
    const overdue = tasks.filter(t => !t.done && isOverdue(t.dueDate)).length;
    return {
      activeTasks: active,
      overdueTasks: overdue,
      projects: projects.length
    };
  }, [tasks, projects]);

  const isCorporate = currentUser?.role !== 'Individual User';
  const isPpmAdmin = currentUser?.role === 'PPM Administrator';

  // Action callback wrappers
  const handleProjectClick = useCallback((id) => {
    if (onNavigate) onNavigate(id);
    else if (setView) setView(id);
  }, [onNavigate, setView]);

  const handleViewAllProjects = useCallback(() => {
    // If corporate, go to portfolios/Operations center. Otherwise, project tree is sidebar.
    if (isCorporate) {
      if (onNavigate) onNavigate('portfolio');
      else if (setView) setView('portfolio');
    }
  }, [isCorporate, onNavigate, setView]);

  const handleRAIDClick = useCallback((section) => {
    // Go to first project's RAID tab if projects exist
    if (projects.length > 0) {
      if (onNavigate) onNavigate(projects[0].id, 'raid', section);
      else if (setView) setView(projects[0].id, 'raid', section);
    }
  }, [projects, onNavigate, setView]);

  return (
    <div className="aura-dashboard">
      <WelcomeBanner user={currentUser} stats={stats} />
      
      <QuickActions
        user={currentUser}
        onCreateProject={onCreateProject}
        onAddTask={onAddTask}
        onLogRisk={onLogRisk}
        onViewPortfolios={handleViewAllProjects}
      />

      <div className="dashboard-grid">
        <div className="grid-half">
          <ProjectsWidget 
            projects={projects} 
            onProjectClick={handleProjectClick} 
            onViewAll={handleViewAllProjects}
          />
        </div>

        <div className="grid-half">
          <TasksWidget 
            tasks={tasks} 
            onTaskToggle={onTaskToggle}
            onViewAll={() => {
              if (projects.length > 0) {
                if (onNavigate) onNavigate(projects[0].id, 'list');
                else if (setView) setView(projects[0].id, 'list');
              }
            }}
          />
        </div>

        <div className={isPpmAdmin ? 'grid-half' : 'grid-full-width'}>
          <RAIDSummaryWidget
            risks={risks}
            issues={issues}
            actions={actions}
            decisions={decisions}
            onItemClick={handleRAIDClick}
          />
        </div>

        {isPpmAdmin && (
          <div className="grid-half">
            <ApprovalQueueWidget
              requests={intakeRequests}
              onApprove={onApproveRequest}
              onReject={onRejectRequest}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomeDashboard;
