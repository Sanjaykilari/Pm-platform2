import React, { useState, useEffect } from 'react';

const ProjectInfoView = ({ project, updateProjectDetails, currentUser, isReadOnly: propReadOnly = false }) => {
  const isProjectManager = propReadOnly; // Owner/editors are not read-only, regardless of role
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState('healthy');
  const [businessUnit, setBusinessUnit] = useState('Core Platform');
  const [category, setCategory] = useState('Applications');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [strategicAlignment, setStrategicAlignment] = useState(5);
  const [capexBudget, setCapexBudget] = useState(0);
  const [opexBudget, setOpexBudget] = useState(0);
  const [visibility, setVisibility] = useState('public');
  
  const [showSaved, setShowSaved] = useState(false);

  // Sync state with active project
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setOwner(project.owner || '');
      setStatus(project.status || 'healthy');
      setBusinessUnit(project.businessUnit || 'Core Platform');
      setCategory(project.category || 'Applications');
      setStartDate(project.startDate || '');
      setEndDate(project.endDate || '');
      setStrategicAlignment(project.strategicAlignment || 5);
      setCapexBudget(project.capexBudget || 0);
      setOpexBudget(project.opexBudget || 0);
      setVisibility(project.visibility || 'public');
    }
  }, [project]);

  const handleSave = (e) => {
    e.preventDefault();
    if (isProjectManager) return; // Prevent read-only edits

    updateProjectDetails(project.id, {
      name,
      description,
      owner,
      status,
      businessUnit,
      category,
      startDate,
      endDate,
      strategicAlignment: Number(strategicAlignment) || 5,
      capexBudget: Number(capexBudget) || 0,
      opexBudget: Number(opexBudget) || 0,
      visibility
    });

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="glass-panel animate-fade" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Project Metadata & Settings</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {isProjectManager 
              ? 'View project classifications, schedules, budgets, and portfolio categorizations.' 
              : 'Manage project classifications, schedules, budgets, and portfolio categorizations.'
            }
          </p>
        </div>
        
        {showSaved && (
          <div style={{ padding: '6px 14px', backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)', border: '1px solid var(--status-green-border)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600' }} className="animate-scale">
            Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Row 1: General Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="form-group">
            <label>Project Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="form-input"
              required 
              disabled={isProjectManager}
            />
          </div>

          <div className="form-group">
            <label>Project Owner / PM</label>
            <input 
              type="text" 
              value={owner} 
              onChange={e => setOwner(e.target.value)} 
              className="form-input"
              required 
              disabled={isProjectManager}
            />
          </div>
        </div>

        {/* Row 2: Description */}
        <div className="form-group">
          <label>Project Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="form-textarea"
            style={{ minHeight: '80px' }}
            required
            disabled={isProjectManager}
          ></textarea>
        </div>

        {/* Row 3: Classifications & Visibility */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div className="form-group">
            <label>PPM Health Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="form-select"
              style={{
                color: status === 'healthy' ? 'var(--status-green)' : status === 'warning' ? 'var(--status-amber)' : 'var(--status-red)',
                fontWeight: '600'
              }}
              disabled={isProjectManager}
            >
              <option value="healthy">🟢 Healthy</option>
              <option value="warning">🟡 Warning</option>
              <option value="risk">🔴 At Risk</option>
            </select>
          </div>

          <div className="form-group">
            <label>Business Unit</label>
            <select 
              value={businessUnit} 
              onChange={e => setBusinessUnit(e.target.value)}
              className="form-select"
              disabled={isProjectManager}
            >
              <option value="Core Platform">Core Platform</option>
              <option value="IT Services">IT Services</option>
              <option value="Core IT">Core IT</option>
              <option value="Operations">Operations</option>
              <option value="R&D Engineering">R&D Engineering</option>
            </select>
          </div>

          <div className="form-group">
            <label>Portfolio Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="form-select"
              disabled={isProjectManager}
            >
              <option value="Applications">Applications</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Security">Security</option>
              <option value="Analytics">Analytics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Project Visibility</label>
            <select 
              value={visibility} 
              onChange={e => setVisibility(e.target.value)}
              className="form-select"
              disabled={isProjectManager || currentUser?.role === 'Individual User'}
              style={{ fontWeight: '500' }}
            >
              {currentUser?.role === 'Individual User' ? (
                <option value="private">🔒 Private to Members</option>
              ) : (
                <>
                  <option value="public">🌐 Public to Org</option>
                  <option value="private">🔒 Private to Members</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Row 4: Timeline Scheduling */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="form-group">
            <label>Project Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="form-input" 
              disabled={isProjectManager}
            />
          </div>

          <div className="form-group">
            <label>Project End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="form-input" 
              disabled={isProjectManager}
            />
          </div>

          <div className="form-group">
            <label>Strategic Alignment: <span style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>{strategicAlignment}/10</span></label>
            <select
              value={strategicAlignment}
              onChange={e => setStrategicAlignment(Number(e.target.value))}
              className="form-select"
              disabled={isProjectManager}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(v => (
                <option key={v} value={v}>{v} - {v >= 8 ? 'High Priority' : v >= 5 ? 'Medium Priority' : 'Low Priority'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: Financial Allocations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="form-group">
            <label>CAPEX Budget Allocation ($)</label>
            <input 
              type="number" 
              value={capexBudget} 
              onChange={e => setCapexBudget(e.target.value)} 
              className="form-input" 
              min="0"
              disabled={isProjectManager}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Capital expenditures budget (hardware, licenses, etc.)</span>
          </div>

          <div className="form-group">
            <label>OPEX Budget Allocation ($)</label>
            <input 
              type="number" 
              value={opexBudget} 
              onChange={e => setOpexBudget(e.target.value)} 
              className="form-input" 
              min="0"
              disabled={isProjectManager}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Operating expenditures budget (allocated labor costs)</span>
          </div>
        </div>

        {/* Form Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          {isProjectManager ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              🔒 Settings are read-only for Viewers
            </div>
          ) : (
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 28px', fontSize: '0.9rem' }}>
              Save Project Settings
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectInfoView;
