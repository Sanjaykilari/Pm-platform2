import React, { useState } from 'react';

const BoardView = ({ 
  project, 
  resources, 
  addTask, 
  updateTask, 
  deleteTask,
  replaceTasks,
  setSelectedTask,
  hideToggle = false,
  initialViewMode = 'box',
  isReadOnly = false
}) => {
  const [addingInCol, setAddingInCol] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  
  // Filtering & Grouping State
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'assignee', 'priority'
  const [sortMode, setSortMode] = useState('none'); // 'none', 'deadline'
  const [viewMode, setViewMode] = useState(initialViewMode); // controlled by parent toggle when hideToggle=true

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);

  // Board Configuration — 5 columns as requested
  const columns = [
    { id: 'backlog',     title: 'Backlog',     color: '#94a3b8', limitable: false },
    { id: 'todo',        title: 'To Do',       color: '#3b82f6', limitable: false },
    { id: 'not-started', title: 'Not Started', color: '#f59e0b', limitable: false },
    { id: 'in-progress', title: 'In Progress', color: '#8b5cf6', limitable: true },
    { id: 'completed',   title: 'Completed',   color: '#10b981', limitable: false }
  ];

  const [wipLimit, setWipLimit] = useState(5);
  const [editingWip, setEditingWip] = useState(false);

  const isOverdue = (task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  const getAssigneeInitials = (id) => {
    const res = resources.find(r => r.id === id);
    if (!res) return '?';
    return res.name.split(' ').map(n => n[0]).join('');
  };

  // Prepare tasks
  let filteredTasks = (project.tasks || []).filter(t => {
    if (filterAssignee !== 'all' && t.assigneeId !== filterAssignee) return false;
    return true;
  });

  if (sortMode === 'deadline') {
    filteredTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  // Calculate swimlanes for Box view
  const getSwimlanes = () => {
    if (groupBy === 'assignee') {
      const activeResIds = [...new Set(filteredTasks.map(t => t.assigneeId).filter(Boolean))];
      const lanes = activeResIds.map(id => ({
        id, title: resources.find(r => r.id === id)?.name || 'Unknown'
      }));
      if (filteredTasks.some(t => !t.assigneeId)) lanes.push({ id: 'unassigned', title: 'Unassigned' });
      return lanes;
    }
    if (groupBy === 'priority') {
      return [
        { id: 'high', title: 'High Priority' },
        { id: 'medium', title: 'Medium Priority' },
        { id: 'low', title: 'Low Priority' }
      ];
    }
    return [{ id: 'default', title: 'All Tasks' }];
  };

  const swimlanes = getSwimlanes();

  // Handlers for Add Task in Box View
  const handleAddCard = (status, laneId) => {
    if (!newTitle.trim()) { setAddingInCol(null); return; }
    const newTask = {
      title: newTitle.trim(),
      status,
      priority: groupBy === 'priority' ? laneId : 'medium',
      assigneeId: groupBy === 'assignee' ? (laneId === 'unassigned' ? '' : laneId) : '',
      allocatedHours: 4,
      progress: status === 'completed' ? 100 : 0,
      isMilestone: false,
      predecessorId: null,
      subtasks: [],
      comments: []
    };
    addTask(project.id, newTask);
    setNewTitle('');
    setAddingInCol(null);
  };

  const handleToggleSubtask = (e, task, subtaskIndex) => {
    e.stopPropagation();
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;
    updateTask(project.id, task.id, { subtasks: updatedSubtasks });
  };

  // Handlers for Drag & Drop
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = (e, columnId, laneId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    const updates = { 
      status: columnId,
      progress: columnId === 'completed' ? 100 : columnId === 'not-started' ? 0 : task.progress
    };

    if (groupBy === 'assignee') updates.assigneeId = laneId === 'unassigned' ? '' : laneId;
    if (groupBy === 'priority') updates.priority = laneId;

    updateTask(project.id, taskId, updates);
  };

  const handleDeleteDrop = (e) => {
    e.preventDefault();
    setIsDragOverDelete(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) deleteTask(project.id, taskId);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      
      {/* Board Controls Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Filter Cards:</span>
          <select 
            value={filterAssignee} 
            onChange={(e) => setFilterAssignee(e.target.value)} 
            className="form-select"
            style={{ width: '180px', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="all">All Assignees</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {filterAssignee !== 'all' && (
          <button 
            onClick={() => setFilterAssignee('all')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Main Content Container */}
      <div className="kanban-board" style={{ height: 'calc(100vh - 250px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* === BOX VIEW (KANBAN) === */}
        {viewMode === 'box' && swimlanes.map((lane) => {
          const laneTasks = filteredTasks.filter(t => {
            if (groupBy === 'none') return true;
            if (groupBy === 'assignee') return (lane.id === 'unassigned' && !t.assigneeId) || t.assigneeId === lane.id;
            if (groupBy === 'priority') return t.priority === lane.id;
            return true;
          });

          if (groupBy !== 'none' && laneTasks.length === 0) return null;

          return (
            <div key={lane.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {groupBy !== 'none' && (
                <div className="swimlane-header">
                  {lane.title} <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)' }}>({laneTasks.length} tasks)</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', minHeight: '300px' }}>
                {columns.map((column) => {
                  let colTasks = laneTasks.filter(t => t.status === column.id);
                  const isOverLimit = column.limitable && wipLimit > 0 && colTasks.length > wipLimit;
                  const addKey = `${lane.id}-${column.id}`;

                  return (
                    <div 
                      key={column.id} 
                      className="kanban-column"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id, lane.id)}
                      style={{ border: isOverLimit ? '2px dashed var(--status-red)' : '1px solid var(--border-subtle)', boxShadow: isOverLimit ? '0 0 12px rgba(220, 38, 38, 0.08)' : 'none', flex: 1 }}
                    >
                      <div className="kanban-column-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: column.color }}></div>
                          <span>{column.title}</span>
                          {column.limitable && groupBy === 'none' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', marginRight: '8px' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>WIP:</span>
                              {editingWip ? (
                                <input type="number" value={wipLimit} onChange={(e) => setWipLimit(Math.max(0, Number(e.target.value) || 0))} onBlur={() => setEditingWip(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingWip(false)} style={{ width: '35px', padding: '2px', fontSize: '0.7rem', textAlign: 'center' }} autoFocus />
                              ) : (
                                <span onClick={() => setEditingWip(true)} style={{ fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer', color: isOverLimit ? 'var(--status-red)' : 'var(--accent-primary)' }}>{wipLimit > 0 ? wipLimit : 'None'}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="kanban-column-count" style={{ marginLeft: column.limitable ? '0' : 'auto', backgroundColor: isOverLimit ? 'var(--status-red)' : 'rgba(0,0,0,0.05)', color: isOverLimit ? '#ffffff' : 'var(--text-secondary)' }}>{colTasks.length}</span>
                        <button onClick={() => setAddingInCol(addKey)} className="btn-ghost" style={{ padding: '4px', marginLeft: '6px' }}><svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></button>
                      </div>

                      {isOverLimit && groupBy === 'none' && (
                        <div style={{ backgroundColor: 'var(--status-red-bg)', border: '1px solid var(--status-red-border)', color: 'var(--status-red)', fontSize: '0.7rem', padding: '6px', borderRadius: '6px', marginBottom: '12px' }}>
                          WIP limit exceeded!
                        </div>
                      )}

                      {addingInCol === addKey && (
                        <div style={{ marginBottom: '12px' }}>
                          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCard(column.id, lane.id)} onBlur={() => handleAddCard(column.id, lane.id)} placeholder="Task title..." className="form-input" style={{ padding: '8px' }} autoFocus />
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flexGrow: 1, minHeight: '100px' }}>
                        {colTasks.map((task) => {
                          const subtasksCount = task.subtasks?.length || 0;
                          const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                          const overdue = isOverdue(task);
                          return (
                            <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} onClick={() => setSelectedTask(task)} className={`kanban-card sticky-note priority-${task.priority} ${overdue ? 'overdue' : ''}`}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="card-tag" style={{ border: 'none', padding: '2px 6px', fontSize: '0.6rem', backgroundColor: task.priority === 'high' ? 'var(--status-red-bg)' : task.priority === 'medium' ? 'var(--status-amber-bg)' : 'var(--status-blue-bg)', color: task.priority === 'high' ? 'var(--status-red)' : task.priority === 'medium' ? 'var(--status-amber)' : 'var(--status-blue)' }}>{task.priority.toUpperCase()}</span>
                                {overdue ? <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'white', backgroundColor: 'var(--status-red)', padding: '2px 6px', borderRadius: '8px' }}>OVERDUE</span> : <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{task.allocatedHours || 0}h</span>}
                              </div>
                              <h4 className="card-title" style={{ fontSize: '0.85rem', fontWeight: '500', margin: '6px 0 4px 0', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h4>
                              
                              {subtasksCount > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '4px' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Checklist ({completedSubtasks}/{subtasksCount})</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {task.subtasks.map((st, idx) => (
                                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', cursor: 'pointer' }} onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={st.completed} onChange={(e) => handleToggleSubtask(e, task, idx)} className="subtask-checkbox" />
                                        <span style={{ textDecoration: st.completed ? 'line-through' : 'none', opacity: st.completed ? 0.6 : 1 }}>{st.title}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '8px', position: 'relative', minHeight: '26px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: overdue ? 'var(--status-red)' : 'var(--text-secondary)', fontWeight: overdue ? '600' : 'normal' }}>
                                  <svg style={{ width: '11px', height: '11px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                  <span>{task.dueDate}</span>
                                </div>
                                <div style={{ position: 'absolute', right: '0', bottom: '0', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }} title="Assignee">
                                  {getAssigneeInitials(task.assigneeId)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {colTasks.length === 0 && addingInCol !== addKey && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', border: '1.5px dashed var(--border-subtle)' }}>Drop here</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* === LIST VIEW === */}
        {viewMode === 'list' && (
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="wbs-grid-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th className="wbs-th">Task Name</th>
                  <th className="wbs-th">Description</th>
                  <th className="wbs-th" style={{ width: '120px' }}>Status</th>
                  <th className="wbs-th" style={{ width: '100px' }}>Priority</th>
                  <th className="wbs-th" style={{ width: '140px' }}>Assignee</th>
                  <th className="wbs-th" style={{ width: '120px' }}>Due Date</th>
                  <th className="wbs-th" style={{ width: '120px' }}>Created</th>
                  <th className="wbs-th" style={{ width: '80px' }}>Effort</th>
                  <th className="wbs-th" style={{ width: '80px' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? filteredTasks.map(renderListRow) : (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tasks found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* === TIMELINE VIEW === */}
        {viewMode === 'timeline' && (() => {
          let minTime = Infinity; let maxTime = -Infinity;
          filteredTasks.forEach(t => {
            if (t.startDate) minTime = Math.min(minTime, new Date(t.startDate).getTime());
            if (t.dueDate) maxTime = Math.max(maxTime, new Date(t.dueDate).getTime());
          });
          if (minTime === Infinity) { minTime = Date.now(); maxTime = Date.now() + (30 * 86400000); }
          
          const totalDays = Math.max(14, Math.ceil((maxTime - minTime) / 86400000)) + 4; // Add padding
          const paddedMinTime = minTime - 86400000 * 2; // start 2 days before
          const dayWidth = 40; // px per day
          const timelineWidth = totalDays * dayWidth;

          const getDaysArray = () => {
            const days = [];
            for(let i=0; i<totalDays; i++) {
              days.push(new Date(paddedMinTime + (i * 86400000)));
            }
            return days;
          };

          const days = getDaysArray();

          return (
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Header with scroll sync */}
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ width: '250px', flexShrink: 0, padding: '16px', fontWeight: '700', fontSize: '0.85rem', borderRight: '2px solid var(--border-subtle)' }}>
                  Task Name
                </div>
                <div style={{ overflowX: 'auto', flexGrow: 1 }} className="hide-scrollbar" id="timeline-header-scroll">
                  <div style={{ width: `${timelineWidth}px`, display: 'flex', position: 'relative', height: '100%' }}>
                    {days.map((d, i) => (
                      <div key={i} style={{ width: `${dayWidth}px`, flexShrink: 0, borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', opacity: [0,6].includes(d.getDay()) ? 0.5 : 1 }}>
                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>{d.getDate()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ display: 'flex', overflowY: 'auto', flexGrow: 1 }}>
                {/* Fixed Task Names Column */}
                <div style={{ width: '250px', flexShrink: 0, borderRight: '2px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', zIndex: 2 }}>
                  {filteredTasks.map(t => (
                    <div key={t.id} onClick={() => setSelectedTask(t)} style={{ height: '50px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                      {t.title}
                    </div>
                  ))}
                  {filteredTasks.length === 0 && <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No tasks found</div>}
                </div>
                
                {/* Scrollable Timeline Grid */}
                <div 
                  style={{ overflowX: 'auto', flexGrow: 1, backgroundColor: 'var(--bg-tertiary)' }} 
                  onScroll={(e) => { 
                    const header = document.getElementById('timeline-header-scroll');
                    if(header) header.scrollLeft = e.target.scrollLeft; 
                  }}
                >
                  <div style={{ width: `${timelineWidth}px`, position: 'relative', backgroundImage: 'linear-gradient(to right, var(--border-subtle) 1px, transparent 1px)', backgroundSize: `${dayWidth}px 100%` }}>
                    {filteredTasks.map(task => {
                      const tStart = task.startDate ? new Date(task.startDate).getTime() : (task.dueDate ? new Date(task.dueDate).getTime() - 86400000 : minTime);
                      const tEnd = task.dueDate ? new Date(task.dueDate).getTime() : tStart + 86400000;
                      
                      const barLeft = ((tStart - paddedMinTime) / 86400000) * dayWidth;
                      const barWidth = Math.max(dayWidth, ((tEnd - tStart) / 86400000) * dayWidth);

                      return (
                        <div key={task.id} style={{ height: '50px', position: 'relative', borderBottom: '1px solid var(--border-subtle)' }}>
                          <div 
                            onClick={() => setSelectedTask(task)}
                            style={{ 
                              position: 'absolute', left: `${barLeft}px`, width: `${barWidth}px`, top: '10px', height: '30px', 
                              borderRadius: '15px', display: 'flex', alignItems: 'center', padding: '0 12px',
                              backgroundColor: task.status === 'completed' ? 'var(--status-green)' : isOverdue(task) ? 'var(--status-red)' : 'var(--accent-primary)',
                              color: 'white', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', overflow: 'hidden'
                            }}
                            title={`${task.title} | ${new Date(tStart).toLocaleDateString()} - ${new Date(tEnd).toLocaleDateString()}`}
                          >
                            {barWidth > 60 && task.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* === CALENDAR VIEW === */}
        {viewMode === 'calendar' && (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = today.getMonth(); // 0-11
          
          const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          const calendarCells = [];
          for (let i = 0; i < firstDayOfMonth; i++) {
            calendarCells.push(null);
          }
          for (let i = 1; i <= daysInMonth; i++) {
            calendarCells.push(new Date(year, month, i));
          }

          // Map tasks to days
          const tasksByDate = {};
          filteredTasks.forEach(t => {
            if (t.dueDate) {
              const dStr = t.dueDate; // 'YYYY-MM-DD' or whatever format
              // ensure format matching
              const parts = dStr.split('-');
              if (parts.length === 3) {
                // standard YYYY-MM-DD
                const formattedKey = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                if (!tasksByDate[formattedKey]) tasksByDate[formattedKey] = [];
                tasksByDate[formattedKey].push(t);
              } else {
                const dateObj = new Date(dStr);
                if (!isNaN(dateObj)) {
                  const formattedKey = dateObj.toISOString().split('T')[0];
                  if (!tasksByDate[formattedKey]) tasksByDate[formattedKey] = [];
                  tasksByDate[formattedKey].push(t);
                }
              }
            }
          });

          return (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{day}</div>
                ))}
                {calendarCells.map((dateObj, idx) => {
                  if (!dateObj) return <div key={idx} style={{ backgroundColor: 'transparent' }} />;
                  const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                  const dayTasks = tasksByDate[dateStr] || [];
                  const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  
                  return (
                    <div key={idx} style={{ border: isToday ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px', minHeight: '100px', backgroundColor: isToday ? 'var(--bg-tertiary)' : 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{dateObj.getDate()}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flexGrow: 1 }}>
                        {dayTasks.map(t => (
                          <div key={t.id} onClick={() => setSelectedTask(t)} style={{ fontSize: '0.7rem', padding: '4px 6px', backgroundColor: t.status === 'completed' ? 'var(--status-green)' : isOverdue(t) ? 'var(--status-red)' : 'var(--status-blue)', color: 'white', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.title}>
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Drop to Delete Zone */}
      {viewMode === 'box' && (
        <div className={`drop-to-delete-zone ${isDragging ? 'visible' : ''} ${isDragOverDelete ? 'drag-over' : ''}`} onDragOver={(e) => { e.preventDefault(); setIsDragOverDelete(true); }} onDragLeave={() => setIsDragOverDelete(false)} onDrop={handleDeleteDrop}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          Drop task here to permanently delete
        </div>
      )}
    </div>
  );
};

export default BoardView;

