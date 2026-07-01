import React, { useState } from 'react';

const DEFAULT_PHASES = [
  'Phase 1: Initiation & Planning',
  'Phase 2: Execution & Development',
  'Phase 3: Testing & QA',
  'Phase 4: Deployment & Closure'
];

const ListView = ({ 
  project, 
  resources, 
  addTask, 
  updateTask, 
  deleteTask, 
  setSelectedTask,
  isReadOnly = false
}) => {
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPhase, setQuickPhase] = useState(DEFAULT_PHASES[0]);
  const [quickIsMilestone, setQuickIsMilestone] = useState(false);

  const tasks = project.tasks || [];

  // Toggle phase collapse
  const togglePhase = (phaseName) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseName]: !prev[phaseName]
    }));
  };

  // Expand / Collapse All
  const expandAll = () => {
    setCollapsedPhases({});
  };

  const collapseAll = () => {
    const nextCollapsed = {};
    DEFAULT_PHASES.forEach(p => {
      nextCollapsed[p] = true;
    });
    setCollapsedPhases(nextCollapsed);
  };

  // Group tasks by Phase
  const getTasksByPhase = (phaseName) => {
    return tasks.filter(t => {
      const p = t.phase || DEFAULT_PHASES[0];
      return p === phaseName;
    });
  };

  // Toggle Task Completion (binary)
  const toggleTaskStatus = (task) => {
    const isCompleted = task.status === 'completed';
    const nextStatus = isCompleted ? 'not-started' : 'completed';
    const nextProgress = isCompleted ? 0 : 100;
    updateTask(project.id, task.id, { 
      status: nextStatus,
      progress: nextProgress
    });
  };

  // Handle progress slider adjustments
  const handleProgressSlider = (task, value) => {
    const progress = Number(value) || 0;
    let status = 'in-progress';
    if (progress === 100) status = 'completed';
    else if (progress === 0) status = 'not-started';
    updateTask(project.id, task.id, { progress, status });
  };

  // Helper to fetch predecessor name and completion state
  const getPredecessorStatus = (predecessorId) => {
    if (!predecessorId) return null;
    const pred = tasks.find(t => t.id === predecessorId);
    if (!pred) return null;
    return {
      title: pred.title,
      isCompleted: pred.status === 'completed'
    };
  };

  // 1. Recursive Circular Dependency Checker
  const isCircularDependency = (startTaskId, currentPredecessorId) => {
    if (!currentPredecessorId) return false;
    if (currentPredecessorId === startTaskId) return true;
    const predTask = tasks.find(t => t.id === currentPredecessorId);
    if (!predTask) return false;
    return isCircularDependency(startTaskId, predTask.predecessorId);
  };

  // 2. Schedule Date Conflict Checker
  const checkScheduleConflict = (task) => {
    if (!task.predecessorId) return null;
    const pred = tasks.find(t => t.id === task.predecessorId);
    if (!pred) return null;

    const currentStart = task.startDate || task.dueDate;
    const predDue = pred.dueDate;

    if (currentStart && predDue) {
      const currentStartTime = new Date(currentStart).getTime();
      const predDueTime = new Date(predDue).getTime();
      
      if (predDueTime > currentStartTime) {
        return `Schedule Conflict: Predecessor is scheduled to complete on ${predDue}, which overlaps with this task's timeline!`;
      }
    }
    return null;
  };

  // Add a task inline under a phase
  const handleAddTaskInPhase = (phaseName) => {
    addTask(project.id, {
      title: 'New Task',
      description: '',
      status: 'not-started',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigneeId: resources[0]?.id || '',
      allocatedHours: 8,
      isMilestone: false,
      phase: phaseName,
      progress: 0,
      predecessorId: null,
      subtasks: [],
      comments: []
    });
  };

  // Add a new Phase
  const handleAddQuickTask = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask(project.id, {
      title: quickTitle,
      description: '',
      status: 'not-started',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigneeId: resources[0]?.id || '',
      allocatedHours: quickIsMilestone ? 0 : 8,
      isMilestone: quickIsMilestone,
      phase: quickPhase,
      progress: 0,
      predecessorId: null,
      subtasks: [],
      comments: []
    });

    setQuickTitle('');
  };

  // WBS CSV Exporter
  const handleExportCsv = () => {
    const headers = ['WBS', 'Type', 'Work Item Name', 'Phase', 'Predecessor', 'Assignee', 'Start Date', 'Due Date', 'Planned Work (Hours)', 'Progress'];
    const rows = [];

    DEFAULT_PHASES.forEach((phaseName, phaseIndex) => {
      const phaseTasks = getTasksByPhase(phaseName);
      rows.push([`${phaseIndex + 1}.0`, 'Phase', phaseName, phaseName, '', '', '', '', '', '']);

      phaseTasks.forEach((task, taskIndex) => {
        const assignee = resources.find(r => r.id === task.assigneeId)?.name || 'Unassigned';
        const predecessor = tasks.find(t => t.id === task.predecessorId)?.title || 'None';
        rows.push([
          `${phaseIndex + 1}.${taskIndex + 1}`,
          task.isMilestone ? 'Milestone' : 'Task',
          task.title,
          phaseName,
          predecessor,
          assignee,
          task.startDate || '',
          task.dueDate || '',
          task.allocatedHours || 0,
          `${task.progress || 0}%`
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_Workplan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Quick Creator & Global Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {!isReadOnly && (
          <form onSubmit={handleAddQuickTask} className="glass-panel" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexGrow: 1, flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Quick add task or milestone..." 
              value={quickTitle} 
              onChange={e => setQuickTitle(e.target.value)} 
              className="form-input" 
              style={{ flex: 2, minWidth: '180px' }}
              required
            />
            
            <select 
              value={quickPhase} 
              onChange={e => setQuickPhase(e.target.value)} 
              className="form-select"
              style={{ flex: 1, minWidth: '130px' }}
            >
              {DEFAULT_PHASES.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>

            <select 
              value={quickIsMilestone ? 'milestone' : 'task'} 
              onChange={e => setQuickIsMilestone(e.target.value === 'milestone')} 
              className="form-select"
              style={{ width: '120px' }}
            >
              <option value="task">As Task</option>
              <option value="milestone">As Milestone</option>
            </select>

            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              Add Row
            </button>
          </form>
        )}

        {/* Global Toolbar buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={expandAll} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
            Expand All
          </button>
          <button onClick={collapseAll} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
            Collapse All
          </button>
          <button onClick={handleExportCsv} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 12px', color: 'var(--accent-primary)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="wbs-grid-container">
        <table className="wbs-grid-table">
          <thead>
            <tr>
              <th className="wbs-th" style={{ width: '60px', textAlign: 'center' }}>WBS</th>
              <th className="wbs-th" style={{ minWidth: '250px' }}>Work Item Name</th>
              <th className="wbs-th" style={{ width: '90px' }}>Type</th>
              <th className="wbs-th" style={{ width: '130px' }}>Phase Section</th>
              <th className="wbs-th" style={{ width: '160px' }}>Predecessor</th>
              <th className="wbs-th" style={{ width: '140px' }}>Assignee</th>
              <th className="wbs-th" style={{ width: '130px' }}>Start Date</th>
              <th className="wbs-th" style={{ width: '130px' }}>Due Date</th>
              <th className="wbs-th" style={{ width: '80px', textAlign: 'center' }}>Work (h)</th>
              <th className="wbs-th" style={{ width: '160px' }}>Progress</th>
              <th className="wbs-th" style={{ width: '70px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_PHASES.map((phaseName, phaseIndex) => {
              const phaseTasks = getTasksByPhase(phaseName);
              const isCollapsed = collapsedPhases[phaseName];
              const phaseWbs = `${phaseIndex + 1}.0`;

              return (
                <React.Fragment key={phaseName}>
                  {/* Collapsible Phase Header Row */}
                  <tr className="wbs-phase-row" onClick={() => togglePhase(phaseName)}>
                    <td className="wbs-td wbs-wbs-cell" style={{ fontWeight: '700' }}>
                      {phaseWbs}
                    </td>
                    <td className="wbs-td" colSpan="10">
                      <div className="wbs-phase-title-td">
                        <svg 
                          className={`wbs-phase-collapse-icon ${isCollapsed ? 'collapsed' : ''}`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        <span>{phaseName}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          ({phaseTasks.length} items)
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Tasks in this Phase */}
                  {!isCollapsed && phaseTasks.map((task, taskIndex) => {
                    const taskWbs = `${phaseIndex + 1}.${taskIndex + 1}`;
                    const predInfo = getPredecessorStatus(task.predecessorId);
                    
                    // Circular dependency detection
                    const showCircularWarning = isCircularDependency(task.id, task.predecessorId);
                    
                    // Schedule conflict date check
                    const dateConflictWarning = checkScheduleConflict(task);
                    
                    const showWarning = (predInfo && !predInfo.isCompleted && task.status !== 'completed') || showCircularWarning || dateConflictWarning;
                    const progressValue = task.progress || 0;

                    let warningTitle = '';
                    if (showCircularWarning) {
                      warningTitle = 'Circular Dependency: Predecessor loops back on this task!';
                    } else if (dateConflictWarning) {
                      warningTitle = dateConflictWarning;
                    } else if (predInfo) {
                      warningTitle = `Pre-requisite "${predInfo.title}" is incomplete!`;
                    }

                    return (
                      <tr key={task.id} className="wbs-task-row">
                        {/* WBS index column */}
                        <td className="wbs-td wbs-wbs-cell">
                          {taskWbs}
                        </td>
                        
                        {/* Title inline-editable grid cell */}
                        <td className="wbs-td" style={{ paddingLeft: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {task.isMilestone ? (
                              /* Milestone Diamond */
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <svg 
                                  style={{ width: '14px', height: '14px', transition: 'all 0.15s' }} 
                                  viewBox="0 0 24 24" 
                                  fill={task.status === 'completed' ? 'var(--status-green)' : 'transparent'} 
                                  stroke={task.status === 'completed' ? 'var(--status-green)' : 'var(--status-amber)'} 
                                  strokeWidth="2.5"
                                >
                                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                                </svg>
                              </button>
                            ) : (
                              /* Standard Task Checkbox */
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }} 
                                className={`custom-checkbox ${task.status === 'completed' ? 'completed' : ''}`}
                              >
                                {task.status === 'completed' && (
                                  <svg style={{ width: '9px', height: '9px' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                            )}

                            {/* Clickable name to trigger sliding details panel */}
                            <input 
                              type="text" 
                              value={task.title} 
                              onChange={(e) => updateTask(project.id, task.id, { title: e.target.value })}
                              className="wbs-grid-input"
                              style={{ 
                                fontWeight: task.isMilestone ? '600' : '400',
                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)'
                              }}
                            />

                            {/* Alert indicator */}
                            {showWarning && (
                              <span 
                                title={warningTitle}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: '15px', height: '15px', borderRadius: '50%',
                                  backgroundColor: showCircularWarning ? 'var(--status-red-bg)' : 'var(--status-amber-bg)', 
                                  color: showCircularWarning ? 'var(--status-red)' : 'var(--status-amber)',
                                  fontSize: '0.7rem', fontWeight: '700', cursor: 'help', flexShrink: 0
                                }}
                              >
                                !
                              </span>
                            )}

                            {/* Details Panel trigger */}
                            <button
                              type="button"
                              onClick={() => setSelectedTask(task)}
                              className="btn-ghost"
                              style={{ padding: '2px', opacity: 0.5 }}
                              title="Open Task Details Drawer"
                            >
                              <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* Type cell */}
                        <td className="wbs-td">
                          <select
                            value={task.isMilestone ? 'milestone' : 'task'}
                            onChange={(e) => {
                              const isMilestone = e.target.value === 'milestone';
                              updateTask(project.id, task.id, { 
                                isMilestone,
                                allocatedHours: isMilestone ? 0 : 8
                              });
                            }}
                            className="wbs-grid-select"
                            style={{ 
                              color: task.isMilestone ? 'var(--status-amber)' : 'var(--accent-primary)',
                              fontWeight: '600',
                              fontSize: '0.75rem'
                            }}
                          >
                            <option value="task">Task</option>
                            <option value="milestone">Milestone</option>
                          </select>
                        </td>

                        {/* Phase section selector */}
                        <td className="wbs-td">
                          <select
                            value={task.phase || DEFAULT_PHASES[0]}
                            onChange={(e) => updateTask(project.id, task.id, { phase: e.target.value })}
                            className="wbs-grid-select"
                          >
                            {DEFAULT_PHASES.map(p => (
                              <option key={p} value={p}>{p.split(': ')[0]}</option>
                            ))}
                          </select>
                        </td>

                        {/* Predecessors selector */}
                        <td className="wbs-td">
                          <select
                            value={task.predecessorId || ''}
                            onChange={(e) => updateTask(project.id, task.id, { predecessorId: e.target.value || null })}
                            className="wbs-grid-select"
                            style={{
                              color: showCircularWarning ? 'var(--status-red)' : 'inherit',
                              fontWeight: showCircularWarning ? '600' : 'normal'
                            }}
                          >
                            <option value="">None</option>
                            {tasks.filter(t => t.id !== task.id).map(t => (
                              <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                          </select>
                        </td>

                        {/* Assignee selector */}
                        <td className="wbs-td">
                          <select
                            value={task.assigneeId || ''}
                            onChange={(e) => updateTask(project.id, task.id, { assigneeId: e.target.value })}
                            className="wbs-grid-select"
                          >
                            {resources.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Start Date */}
                        <td className="wbs-td">
                          <input 
                            type="date"
                            value={task.startDate || ''}
                            onChange={(e) => updateTask(project.id, task.id, { startDate: e.target.value })}
                            className="wbs-grid-input"
                          />
                        </td>

                        {/* Due Date */}
                        <td className="wbs-td">
                          <input 
                            type="date"
                            value={task.dueDate || ''}
                            onChange={(e) => updateTask(project.id, task.id, { dueDate: e.target.value })}
                            className="wbs-grid-input"
                          />
                        </td>

                        {/* Effort Work hours */}
                        <td className="wbs-td" style={{ textAlign: 'center' }}>
                          <input 
                            type="number"
                            value={task.allocatedHours || 0}
                            onChange={(e) => updateTask(project.id, task.id, { allocatedHours: Number(e.target.value) || 0 })}
                            className="wbs-grid-input"
                            style={{ textAlign: 'center', width: '55px' }}
                            min="0"
                            disabled={task.isMilestone}
                          />
                        </td>

                        {/* Progress slider % */}
                        <td className="wbs-td">
                          <div className="wbs-progress-slider-container">
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={progressValue}
                              onChange={(e) => handleProgressSlider(task, e.target.value)}
                              className="wbs-progress-slider"
                              disabled={isReadOnly}
                            />
                            <span style={{ fontSize: '0.75rem', minWidth: '32px', textAlign: 'right', fontWeight: '500' }}>
                              {progressValue}%
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="wbs-td" style={{ textAlign: 'center' }}>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => deleteTask(project.id, task.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                              title="Delete Task Row"
                            >
                              <svg style={{ width: '13px', height: '13px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Add Task Row under specific phase (only visible when expanded) */}
                  {!isReadOnly && !isCollapsed && (
                    <tr>
                      <td className="wbs-td wbs-wbs-cell" style={{ color: 'var(--text-muted)' }}>+</td>
                      <td className="wbs-td" colSpan="10" style={{ padding: '6px 12px' }}>
                        <button
                          type="button"
                          onClick={() => handleAddTaskInPhase(phaseName)}
                          className="btn-ghost"
                          style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px' }}
                        >
                          <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add new row under phase
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
