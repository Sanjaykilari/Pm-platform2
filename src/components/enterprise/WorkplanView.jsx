import React, { useState } from 'react';
import BoardView from './BoardView';

const DEFAULT_PHASES = [
  'Phase 1: Initiation & Planning',
  'Phase 2: Execution & Development',
  'Phase 3: Testing & QA',
  'Phase 4: Deployment & Closure',
];

const STATUS_OPTIONS = ['not-started', 'backlog', 'todo', 'in-progress', 'completed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const statusMeta = {
  'not-started': { label: 'Not Started', color: 'var(--text-muted)', bg: 'var(--bg-tertiary)' },
  backlog:       { label: 'Backlog',     color: 'var(--status-amber)', bg: 'var(--status-amber-bg)' },
  todo:          { label: 'To Do',       color: 'var(--status-blue)', bg: 'var(--status-blue-bg)' },
  'in-progress': { label: 'In Progress', color: 'var(--accent-primary)', bg: 'var(--status-blue-bg)' },
  completed:     { label: 'Completed',   color: 'var(--status-green)', bg: 'var(--status-green-bg)' },
};

const priorityMeta = {
  high:   { color: 'var(--status-red)',   bg: 'var(--status-red-bg)' },
  medium: { color: 'var(--status-amber)', bg: 'var(--status-amber-bg)' },
  low:    { color: 'var(--status-blue)',  bg: 'var(--status-blue-bg)' },
};

// Build WBS number like 1.1, 1.2, 2.1 etc.
const buildWbsMap = (tasks) => {
  const map = {};
  let phaseCount = {};
  let phaseIndex = {};
  let globalPhaseIdx = 0;
  DEFAULT_PHASES.forEach((ph, i) => {
    const phaseTasks = tasks.filter(t => (t.phase || DEFAULT_PHASES[0]) === ph);
    if (phaseTasks.length > 0 || true) {
      phaseIndex[ph] = i + 1;
    }
  });
  DEFAULT_PHASES.forEach(ph => { phaseCount[ph] = 0; });
  tasks.forEach(t => {
    const ph = t.phase || DEFAULT_PHASES[0];
    phaseCount[ph] = (phaseCount[ph] || 0) + 1;
    map[t.id] = `${phaseIndex[ph]}.${phaseCount[ph]}`;
  });
  return map;
};

const WorkplanView = ({ project, resources, addTask, updateTask, deleteTask, replaceTasks, setSelectedTask }) => {
  const [viewMode, setViewMode] = useState('workplan'); // unified toggle state
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [addingPhase, setAddingPhase] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { taskId, field }

  // --- Unified View Toggle Modes ---
  const VIEW_MODES = [
    { key: 'workplan',  label: 'Workplan View' },
    { key: 'box',       label: 'Box (Kanban)' },
    { key: 'timeline',  label: 'Timeline' },
    { key: 'calendar',  label: 'Calendar' },
  ];

  const tasks = project.tasks || [];
  const wbsMap = buildWbsMap(tasks);

  const getTasksByPhase = (phase) =>
    tasks.filter(t => (t.phase || DEFAULT_PHASES[0]) === phase);

  const togglePhase = (ph) =>
    setCollapsedPhases(prev => ({ ...prev, [ph]: !prev[ph] }));

  const expandAll = () => setCollapsedPhases({});
  const collapseAll = () => {
    const c = {};
    DEFAULT_PHASES.forEach(p => (c[p] = true));
    setCollapsedPhases(c);
  };

  const handleAddTask = (phase) => {
    if (!newTaskTitle.trim()) { setAddingPhase(null); return; }
    addTask(project.id, {
      title: newTaskTitle.trim(),
      phase,
      status: 'not-started',
      priority: 'medium',
      assigneeId: '',
      allocatedHours: 8,
      progress: 0,
      isMilestone: false,
      predecessorId: null,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      subtasks: [],
      comments: [],
    });
    setNewTaskTitle('');
    setAddingPhase(null);
  };

  const handleInlineUpdate = (taskId, field, value) => {
    updateTask(project.id, taskId, { [field]: value });
    setEditingCell(null);
  };

  const handleProgressChange = (task, val) => {
    const progress = Number(val);
    let status = 'in-progress';
    if (progress === 0) status = 'not-started';
    if (progress === 100) status = 'completed';
    updateTask(project.id, task.id, { progress, status });
  };

  const getResourceName = (id) => {
    const r = resources.find(res => res.id === id);
    return r ? r.name : '—';
  };

  const isOverdue = (task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  const getPredecessorLabel = (predId) => {
    if (!predId) return '—';
    const t = tasks.find(tk => tk.id === predId);
    return t ? (wbsMap[t.id] || t.title.slice(0, 20)) : '—';
  };

  // Gantt mini: compute bar position relative to project dates
  const projectStart = project.startDate ? new Date(project.startDate) : new Date();
  const projectEnd   = project.endDate   ? new Date(project.endDate)   : new Date(Date.now() + 90 * 86400000);
  const totalDays = Math.max(1, (projectEnd - projectStart) / 86400000);

  const getGanttBar = (task) => {
    const start = task.startDate ? new Date(task.startDate) : projectStart;
    const end   = task.dueDate   ? new Date(task.dueDate)   : start;
    const left  = Math.max(0, Math.min(100, ((start - projectStart) / 86400000 / totalDays) * 100));
    const width = Math.max(2,  Math.min(100 - left, ((end   - start)   / 86400000 / totalDays) * 100));
    return { left: `${left.toFixed(1)}%`, width: `${width.toFixed(1)}%` };
  };

  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks   = tasks.filter(t => isOverdue(t)).length;
  const totalHours     = tasks.reduce((s, t) => s + (t.allocatedHours || 0), 0);
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>

      {/* === Unified View Toggle === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>View:</span>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', padding: '3px' }}>
          {VIEW_MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setViewMode(m.key)}
              className="btn-ghost"
              style={{
                padding: '4px 14px',
                fontSize: '0.78rem',
                borderRadius: '4px',
                backgroundColor: viewMode === m.key ? 'var(--bg-secondary)' : 'transparent',
                boxShadow: viewMode === m.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: viewMode === m.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: viewMode === m.key ? '600' : '500',
                transition: 'all 0.15s ease',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* === Non-Workplan Modes: delegate to BoardView (toggle hidden) === */}
      {viewMode !== 'workplan' && (
        <BoardView
          key={viewMode}
          project={project}
          resources={resources}
          addTask={addTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          replaceTasks={replaceTasks}
          setSelectedTask={setSelectedTask}
          hideToggle={true}
          initialViewMode={viewMode}
        />
      )}

      {/* === Workplan Mode: WBS Grid === */}
      {viewMode === 'workplan' && (
      <>

      {/* Summary KPI Strip */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Tasks', value: totalTasks, icon: '📋', color: 'var(--accent-primary)' },
          { label: 'Completed',   value: completedTasks, icon: '✅', color: 'var(--status-green)' },
          { label: 'Overdue',     value: overdueTasks,   icon: '⚠️', color: 'var(--status-red)' },
          { label: 'Total Hours', value: `${totalHours}h`, icon: '⏱️', color: 'var(--status-amber)' },
          { label: 'Progress',    value: `${overallProgress}%`, icon: '📈', color: 'var(--accent-secondary)' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '120px' }}>
            <span style={{ fontSize: '1.2rem' }}>{kpi.icon}</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
        {/* Overall progress bar */}
        <div className="glass-card" style={{ padding: '12px 18px', flexGrow: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <span>Overall Completion</span><span style={{ color: 'var(--accent-primary)' }}>{overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${overallProgress}%`, background: 'var(--accent-primary)' }} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }} onClick={expandAll}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            Expand All
          </button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }} onClick={collapseAll}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            Collapse All
          </button>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Click any cell to inline-edit • Click task name to open detail panel
        </div>
      </div>

      {/* WBS Grid */}
      <div className="wbs-grid-container" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '0' }}>
        <table className="wbs-grid-table" style={{ minWidth: '1100px' }}>
          <thead>
            <tr>
              <th className="wbs-th" style={{ width: '52px', textAlign: 'center' }}>#</th>
              <th className="wbs-th" style={{ width: '28px' }}></th>{/* Milestone diamond col */}
              <th className="wbs-th" style={{ minWidth: '220px' }}>Task Name</th>
              <th className="wbs-th" style={{ width: '110px' }}>Status</th>
              <th className="wbs-th" style={{ width: '80px' }}>Priority</th>
              <th className="wbs-th" style={{ width: '130px' }}>Assignee</th>
              <th className="wbs-th" style={{ width: '100px' }}>Start Date</th>
              <th className="wbs-th" style={{ width: '100px' }}>Due Date</th>
              <th className="wbs-th" style={{ width: '60px' }}>Hours</th>
              <th className="wbs-th" style={{ width: '130px' }}>Progress</th>
              <th className="wbs-th" style={{ width: '60px' }}>Pred.</th>
              <th className="wbs-th" style={{ minWidth: '160px' }}>Gantt</th>
              <th className="wbs-th" style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_PHASES.map((phase, phaseIdx) => {
              const phaseTasks = getTasksByPhase(phase);
              const isCollapsed = collapsedPhases[phase];
              const phaseCompleted = phaseTasks.filter(t => t.status === 'completed').length;
              const phaseProgress = phaseTasks.length === 0 ? 0 : Math.round((phaseCompleted / phaseTasks.length) * 100);

              return (
                <React.Fragment key={phase}>
                  {/* Phase Header Row */}
                  <tr className="wbs-phase-row" onClick={() => togglePhase(phase)}>
                    <td colSpan="13" style={{ padding: '0' }}>
                      <div className="wbs-phase-title-td" style={{ gap: '10px', padding: '10px 14px' }}>
                        <svg
                          className={`wbs-phase-collapse-icon ${isCollapsed ? 'collapsed' : ''}`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.2px' }}>
                          {phaseIdx + 1}
                        </span>
                        <span>{phase}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                          ({phaseTasks.length} task{phaseTasks.length !== 1 ? 's' : ''})
                        </span>
                        {/* Phase mini-progress */}
                        {phaseTasks.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                            <div className="progress-bar" style={{ width: '80px', height: '4px' }}>
                              <div className="progress-bar-fill" style={{ width: `${phaseProgress}%`, background: 'var(--accent-primary)' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{phaseProgress}%</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Task Rows */}
                  {!isCollapsed && phaseTasks.map(task => {
                    const overdue = isOverdue(task);
                    const sm = statusMeta[task.status] || statusMeta['not-started'];
                    const pm = priorityMeta[task.priority] || priorityMeta['medium'];
                    const gantt = getGanttBar(task);
                    const isEditing = (field) => editingCell?.taskId === task.id && editingCell?.field === field;

                    return (
                      <tr key={task.id} className="wbs-task-row" style={{ borderLeft: overdue ? '3px solid var(--status-red)' : '3px solid transparent' }}>

                        {/* WBS ID */}
                        <td className="wbs-td wbs-wbs-cell" style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                          {wbsMap[task.id]}
                        </td>

                        {/* Milestone Diamond */}
                        <td className="wbs-td" style={{ textAlign: 'center', padding: '4px' }}>
                          <button
                            title={task.isMilestone ? 'Milestone' : 'Mark as Milestone'}
                            onClick={() => handleInlineUpdate(task.id, 'isMilestone', !task.isMilestone)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {task.isMilestone
                              ? <span style={{ fontSize: '1rem', color: 'var(--status-amber)' }}>◆</span>
                              : <span style={{ fontSize: '0.8rem', color: 'var(--border-subtle)' }}>◇</span>
                            }
                          </button>
                        </td>

                        {/* Task Name */}
                        <td className="wbs-td" style={{ cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Status toggle circle */}
                            <button
                              className={`custom-checkbox ${task.status === 'completed' ? 'completed' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = task.status === 'completed' ? 'not-started' : 'completed';
                                updateTask(project.id, task.id, { status: next, progress: next === 'completed' ? 100 : task.progress });
                              }}
                              title="Toggle complete"
                            >
                              {task.status === 'completed' && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </button>
                            <span style={{
                              fontWeight: task.isMilestone ? '700' : '500',
                              fontSize: '0.82rem',
                              color: overdue ? 'var(--status-red)' : 'var(--text-primary)',
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                              opacity: task.status === 'completed' ? 0.6 : 1,
                              maxWidth: '180px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {task.title}
                            </span>
                            {overdue && (
                              <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'white', background: 'var(--status-red)', padding: '1px 5px', borderRadius: '4px' }}>
                                LATE
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="wbs-td" onClick={() => setEditingCell({ taskId: task.id, field: 'status' })}>
                          {isEditing('status') ? (
                            <select
                              autoFocus
                              className="wbs-grid-select"
                              value={task.status}
                              onChange={e => handleInlineUpdate(task.id, 'status', e.target.value)}
                              onBlur={() => setEditingCell(null)}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusMeta[s]?.label || s}</option>)}
                            </select>
                          ) : (
                            <span style={{
                              fontSize: '0.7rem', fontWeight: '600', padding: '2px 7px', borderRadius: '4px',
                              color: sm.color, background: sm.bg, display: 'inline-block'
                            }}>
                              {sm.label}
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="wbs-td" onClick={() => setEditingCell({ taskId: task.id, field: 'priority' })}>
                          {isEditing('priority') ? (
                            <select
                              autoFocus
                              className="wbs-grid-select"
                              value={task.priority}
                              onChange={e => handleInlineUpdate(task.id, 'priority', e.target.value)}
                              onBlur={() => setEditingCell(null)}
                            >
                              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          ) : (
                            <span style={{
                              fontSize: '0.68rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                              color: pm.color, background: pm.bg, textTransform: 'uppercase', display: 'inline-block'
                            }}>
                              {task.priority}
                            </span>
                          )}
                        </td>

                        {/* Assignee */}
                        <td className="wbs-td" onClick={() => setEditingCell({ taskId: task.id, field: 'assigneeId' })}>
                          {isEditing('assigneeId') ? (
                            <select
                              autoFocus
                              className="wbs-grid-select"
                              value={task.assigneeId || ''}
                              onChange={e => handleInlineUpdate(task.id, 'assigneeId', e.target.value)}
                              onBlur={() => setEditingCell(null)}
                            >
                              <option value="">Unassigned</option>
                              {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {task.assigneeId && (
                                <div style={{
                                  width: '22px', height: '22px', borderRadius: '50%',
                                  background: 'var(--accent-secondary)', color: 'white',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.6rem', fontWeight: '700', flexShrink: 0
                                }}>
                                  {resources.find(r => r.id === task.assigneeId)?.name?.split(' ').map(n => n[0]).join('') || '?'}
                                </div>
                              )}
                              <span style={{ fontSize: '0.78rem', color: task.assigneeId ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                {getResourceName(task.assigneeId)}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Start Date */}
                        <td className="wbs-td" onClick={() => setEditingCell({ taskId: task.id, field: 'startDate' })}>
                          {isEditing('startDate') ? (
                            <input
                              autoFocus type="date" className="wbs-grid-input"
                              value={task.startDate || ''}
                              onChange={e => handleInlineUpdate(task.id, 'startDate', e.target.value)}
                              onBlur={() => setEditingCell(null)}
                            />
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {task.startDate || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </span>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="wbs-td" onClick={() => setEditingCell({ taskId: task.id, field: 'dueDate' })}>
                          {isEditing('dueDate') ? (
                            <input
                              autoFocus type="date" className="wbs-grid-input"
                              value={task.dueDate || ''}
                              onChange={e => handleInlineUpdate(task.id, 'dueDate', e.target.value)}
                              onBlur={() => setEditingCell(null)}
                            />
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: overdue ? 'var(--status-red)' : 'var(--text-secondary)', fontWeight: overdue ? '600' : '400' }}>
                              {task.dueDate || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </span>
                          )}
                        </td>

                        {/* Hours */}
                        <td className="wbs-td" onClick={() => setEditingCell({ taskId: task.id, field: 'allocatedHours' })}>
                          {isEditing('allocatedHours') ? (
                            <input
                              autoFocus type="number" min="0" className="wbs-grid-input"
                              style={{ width: '52px' }}
                              value={task.allocatedHours || ''}
                              onChange={e => handleInlineUpdate(task.id, 'allocatedHours', Number(e.target.value))}
                              onBlur={() => setEditingCell(null)}
                            />
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{task.allocatedHours || 0}h</span>
                          )}
                        </td>

                        {/* Progress */}
                        <td className="wbs-td">
                          <div className="wbs-progress-slider-container">
                            <input
                              type="range" min="0" max="100" step="5"
                              className="wbs-progress-slider"
                              value={task.progress || 0}
                              onChange={e => handleProgressChange(task, e.target.value)}
                              onClick={e => e.stopPropagation()}
                            />
                            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--accent-primary)', minWidth: '30px' }}>
                              {task.progress || 0}%
                            </span>
                          </div>
                        </td>

                        {/* Predecessor */}
                        <td className="wbs-td" onClick={() => setEditingCell({ taskId: task.id, field: 'predecessorId' })}>
                          {isEditing('predecessorId') ? (
                            <select
                              autoFocus className="wbs-grid-select"
                              value={task.predecessorId || ''}
                              onChange={e => handleInlineUpdate(task.id, 'predecessorId', e.target.value || null)}
                              onBlur={() => setEditingCell(null)}
                            >
                              <option value="">None</option>
                              {tasks.filter(t => t.id !== task.id).map(t => (
                                <option key={t.id} value={t.id}>{wbsMap[t.id]} {t.title.slice(0, 20)}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: task.predecessorId ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: task.predecessorId ? '600' : '400' }}>
                              {getPredecessorLabel(task.predecessorId)}
                            </span>
                          )}
                        </td>

                        {/* Gantt Mini Bar */}
                        <td className="wbs-td" style={{ padding: '8px 10px' }}>
                          <div style={{ position: 'relative', height: '14px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              position: 'absolute',
                              left: gantt.left,
                              width: gantt.width,
                              top: 0, bottom: 0,
                              borderRadius: '3px',
                              background: task.status === 'completed'
                                ? 'var(--status-green)'
                                : overdue
                                  ? 'var(--status-red)'
                                  : 'var(--accent-primary)',
                              opacity: 0.8,
                            }} />
                            {/* Progress fill inside bar */}
                            <div style={{
                              position: 'absolute',
                              left: gantt.left,
                              width: `calc(${gantt.width} * ${(task.progress || 0) / 100})`,
                              top: 0, bottom: 0,
                              borderRadius: '3px 0 0 3px',
                              background: task.status === 'completed' ? 'var(--status-green)' : 'var(--accent-secondary)',
                              opacity: 0.6,
                            }} />
                          </div>
                        </td>

                        {/* Delete */}
                        <td className="wbs-td" style={{ textAlign: 'center', padding: '4px' }}>
                          <button
                            className="btn-ghost"
                            title="Delete task"
                            onClick={() => deleteTask(project.id, task.id)}
                            style={{ padding: '4px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Add Task Row */}
                  {!isCollapsed && (
                    <tr>
                      <td className="wbs-td" colSpan="13" style={{ padding: '4px 12px', background: '#fafbfd' }}>
                        {addingPhase === phase ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <input
                              autoFocus
                              className="form-input"
                              style={{ maxWidth: '280px', padding: '5px 10px', fontSize: '0.82rem' }}
                              placeholder="Enter task title and press Enter…"
                              value={newTaskTitle}
                              onChange={e => setNewTaskTitle(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleAddTask(phase); if (e.key === 'Escape') { setAddingPhase(null); setNewTaskTitle(''); } }}
                              onBlur={() => handleAddTask(phase)}
                            />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Enter to save · Esc to cancel</span>
                          </div>
                        ) : (
                          <button
                            className="btn-ghost"
                            style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => { setAddingPhase(phase); setNewTaskTitle(''); }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add task to {phase.split(':')[0]}
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
};

export default WorkplanView;
