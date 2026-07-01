import React, { useState, useEffect } from 'react';

const TaskDetailPanel = ({ 
  task, 
  projectId, 
  resources, 
  updateTask, 
  onClose,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not-started');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [allocatedHours, setAllocatedHours] = useState(0);
  const [actualHours, setActualHours] = useState(0);
  
  const [logHours, setLogHours] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Bottom Tabs: comments or activity audit history
  const [bottomTab, setBottomTab] = useState('comments'); // comments, history

  // Sync state with active task prop
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'not-started');
      setPriority(task.priority || 'medium');
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate || '');
      setAllocatedHours(task.allocatedHours || 0);
      setActualHours(task.actualHours || 0);
    }
  }, [task]);

  if (!task) return null;

  // Custom change logger to maintain audit logs
  const handleFieldChange = (field, value) => {
    let actionText = '';
    if (field === 'status') {
      actionText = `changed status to "${value.toUpperCase().replace('-', ' ')}"`;
    } else if (field === 'title') {
      actionText = `renamed task to "${value}"`;
    } else if (field === 'assigneeId') {
      const res = resources.find(r => r.id === value);
      actionText = `assigned task to ${res ? res.name : 'Unassigned'}`;
    } else if (field === 'dueDate') {
      actionText = `changed due date to ${value || 'Unscheduled'}`;
    } else if (field === 'priority') {
      actionText = `set priority to "${value.toUpperCase()}"`;
    } else if (field === 'allocatedHours') {
      actionText = `updated planned labor to ${value}h`;
    } else if (field === 'actualHours') {
      actionText = `modified actual hours directly to ${value}h`;
    } else if (field === 'description') {
      actionText = `updated description details`;
    }

    const newHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: currentUser?.name || 'System User',
      action: actionText,
      timestamp: new Date().toISOString()
    };

    updateTask(projectId, task.id, { 
      [field]: value,
      history: [...(task.history || []), newHistoryItem]
    });
  };

  const handleLogAdditionalHours = (e) => {
    e.preventDefault();
    const hours = Number(logHours) || 0;
    if (hours <= 0) return;

    const newTotal = (task.actualHours || 0) + hours;
    setActualHours(newTotal);

    const newHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: currentUser?.name || 'System User',
      action: `logged ${hours}h of effort (total actual: ${newTotal}h)`,
      timestamp: new Date().toISOString()
    };

    updateTask(projectId, task.id, {
      actualHours: newTotal,
      history: [...(task.history || []), newHistoryItem]
    });

    setLogHours('');
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newSubtaskTitle,
      completed: false
    };

    const updatedSubtasks = [...(task.subtasks || []), newSub];
    
    const newHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: currentUser?.name || 'System User',
      action: `created subtask checklist item "${newSubtaskTitle}"`,
      timestamp: new Date().toISOString()
    };

    updateTask(projectId, task.id, { 
      subtasks: updatedSubtasks,
      history: [...(task.history || []), newHistoryItem]
    });
    
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subtaskId, subtaskTitle, currentCompleted) => {
    const updatedSubtasks = (task.subtasks || []).map(sub => 
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );

    const newHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: currentUser?.name || 'System User',
      action: `${!currentCompleted ? 'completed' : 're-opened'} subtask "${subtaskTitle}"`,
      timestamp: new Date().toISOString()
    };

    updateTask(projectId, task.id, { 
      subtasks: updatedSubtasks,
      history: [...(task.history || []), newHistoryItem]
    });
  };

  const handleDeleteSubtask = (subtaskId, subtaskTitle) => {
    const updatedSubtasks = (task.subtasks || []).filter(sub => sub.id !== subtaskId);
    
    const newHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: currentUser?.name || 'System User',
      action: `deleted subtask checklist item "${subtaskTitle}"`,
      timestamp: new Date().toISOString()
    };

    updateTask(projectId, task.id, { 
      subtasks: updatedSubtasks,
      history: [...(task.history || []), newHistoryItem]
    });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newCom = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: currentUser?.name || 'System User',
      text: newCommentText,
      timestamp: new Date().toISOString()
    };

    const updatedComments = [...(task.comments || []), newCom];

    const newHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: currentUser?.name || 'System User',
      action: `added a comment on the task`,
      timestamp: new Date().toISOString()
    };

    updateTask(projectId, task.id, { 
      comments: updatedComments,
      history: [...(task.history || []), newHistoryItem]
    });

    setNewCommentText('');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div 
        className="drawer-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '24px', overflowY: 'auto' }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <select 
            value={status} 
            onChange={(e) => {
              setStatus(e.target.value);
              handleFieldChange('status', e.target.value);
            }}
            className="form-select"
            style={{
              width: '130px', border: 'none', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', padding: '6px 12px',
              color: status === 'completed' ? 'var(--status-green)' : status === 'in-progress' ? 'var(--accent-primary)' : 'var(--text-muted)',
              backgroundColor: status === 'completed' ? 'var(--status-green-bg)' : status === 'in-progress' ? 'var(--status-blue-bg)' : 'rgba(0,0,0,0.03)'
            }}
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Details Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Editable Title */}
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => handleFieldChange('title', e.target.value)}
            style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-primary)', border: 'none', background: 'none', width: '100%', outline: 'none', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}
            placeholder="Untitled Task"
          />

          {/* Form Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '110px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Assignee</span>
              <select 
                value={assigneeId} 
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  handleFieldChange('assigneeId', e.target.value);
                }}
                className="form-select"
              >
                <option value="">Unassigned</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '110px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Due Date</span>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleFieldChange('dueDate', e.target.value);
                }}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '110px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Priority</span>
              <select 
                value={priority} 
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleFieldChange('priority', e.target.value);
                }}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Effort/Labor Hours Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '14px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Planned Estimate</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="number" 
                    value={allocatedHours} 
                    onChange={(e) => setAllocatedHours(Number(e.target.value) || 0)}
                    onBlur={(e) => handleFieldChange('allocatedHours', Number(e.target.value) || 0)}
                    className="form-input"
                    style={{ width: '70px', padding: '4px 8px', fontSize: '0.85rem', textAlign: 'center' }}
                    min="0"
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>hours</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Actual Hours Spent</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="number" 
                    value={actualHours} 
                    onChange={(e) => setActualHours(Number(e.target.value) || 0)}
                    onBlur={(e) => handleFieldChange('actualHours', Number(e.target.value) || 0)}
                    className="form-input"
                    style={{ width: '70px', padding: '4px 8px', fontSize: '0.85rem', textAlign: 'center' }}
                    min="0"
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>hours</span>
                </div>
              </div>
            </div>

            {/* Transactional Effort Logger */}
            <form onSubmit={handleLogAdditionalHours} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Log Quick Effort:</span>
              <input 
                type="number" 
                placeholder="0"
                value={logHours}
                onChange={(e) => setLogHours(e.target.value)}
                style={{ width: '50px', padding: '4px', fontSize: '0.8rem', textAlign: 'center', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: '#ffffff' }}
                min="0.5"
                step="0.5"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>hours</span>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', marginLeft: 'auto' }}
              >
                Log Time
              </button>
            </form>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Description</h4>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              onBlur={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Give detailed business context or task specifications..." 
              className="form-textarea"
              style={{ minHeight: '80px', fontSize: '0.85rem' }}
            ></textarea>
          </div>

          {/* Subtask Checklist */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Subtasks Checklist</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {(task.subtasks || []).map((sub) => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                  <button 
                    onClick={() => toggleSubtask(sub.id, sub.title, sub.completed)} 
                    className={`custom-checkbox ${sub.completed ? 'completed' : ''}`}
                    style={{ width: '16px', height: '16px' }}
                  >
                    {sub.completed && (
                      <svg style={{ width: '9px', height: '9px' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span style={{ 
                    fontSize: '0.85rem', flexGrow: 1,
                    textDecoration: sub.completed ? 'line-through' : 'none',
                    color: sub.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}>
                    {sub.title}
                  </span>
                  <button 
                    onClick={() => handleDeleteSubtask(sub.id, sub.title)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Add a subtask..." 
                value={newSubtaskTitle} 
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Add
              </button>
            </form>
          </div>

          {/* Tabbed Activity Feed & Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '14px', paddingBottom: '6px' }}>
              <button 
                type="button" 
                onClick={() => setBottomTab('comments')} 
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', position: 'relative',
                  color: bottomTab === 'comments' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}
              >
                Comments ({(task.comments || []).length})
                {bottomTab === 'comments' && <div style={{ position: 'absolute', bottom: '-7px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--accent-primary)' }}></div>}
              </button>
              <button 
                type="button" 
                onClick={() => setBottomTab('history')} 
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', position: 'relative',
                  color: bottomTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}
              >
                Audit Log ({(task.history || []).length})
                {bottomTab === 'history' && <div style={{ position: 'absolute', bottom: '-7px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--accent-primary)' }}></div>}
              </button>
            </div>

            {bottomTab === 'comments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                  {(task.comments || []).map((com) => (
                    <div key={com.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{com.author}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatDateTime(com.timestamp)}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{com.text}</p>
                    </div>
                  ))}
                  {(task.comments || []).length === 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No comments yet.</div>
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea 
                    placeholder="Write comment..." 
                    value={newCommentText} 
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="form-textarea"
                    style={{ minHeight: '50px', fontSize: '0.85rem' }}
                    required
                  ></textarea>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '6px 12px', fontSize: '0.75rem' }}>
                    Post Comment
                  </button>
                </form>
              </div>
            )}

            {bottomTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingLeft: '8px', borderLeft: '2px solid var(--border-subtle)' }}>
                {(task.history || []).map((hist) => (
                  <div key={hist.id} style={{ position: 'relative', paddingBottom: '12px', paddingLeft: '14px' }}>
                    {/* Circle marker */}
                    <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', border: '2px solid #ffffff' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{hist.user}</span>
                      <span>{formatDateTime(hist.timestamp)}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{hist.action}</p>
                  </div>
                ))}
                {(task.history || []).length === 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No activity logged yet. Modifications will appear here.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
