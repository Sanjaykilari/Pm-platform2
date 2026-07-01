import React, { useState, useEffect } from 'react';

const Header = ({ 
  currentView, 
  projects = [], 
  portfolios = [], 
  programs = [], 
  setView, 
  currentUser, 
  addProject,
  setSelectedTask,
  setHighlightedItemId,
  isCreateModalOpen: propIsCreateModalOpen,
  setIsCreateModalOpen: propSetIsCreateModalOpen
}) => {
  // Create Project Modal States
  const [localIsCreateModalOpen, localSetIsCreateModalOpen] = useState(false);
  const isCreateModalOpen = propIsCreateModalOpen !== undefined ? propIsCreateModalOpen : localIsCreateModalOpen;
  const setIsCreateModalOpen = propSetIsCreateModalOpen !== undefined ? propSetIsCreateModalOpen : localSetIsCreateModalOpen;
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjDueDate, setNewProjDueDate] = useState('');
  const [newProjCapex, setNewProjCapex] = useState('');
  const [newProjOpex, setNewProjOpex] = useState('');
  const [newProjValue, setNewProjValue] = useState(5);
  const [modalError, setModalError] = useState('');

  // Search Bar States
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleDocumentClick = () => {
      setShowResults(false);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const results = [];

    projects.forEach(p => {
      // Search projects
      if (p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query))) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.name,
          subtitle: p.description || 'No description',
          projectId: p.id
        });
      }

      // Search WBS / Tasks
      (p.tasks || []).forEach(t => {
        if (t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query))) {
          results.push({
            type: 'task',
            id: t.id,
            title: t.title,
            subtitle: `Task in: ${p.name}`,
            projectId: p.id,
            task: t
          });
        }
      });

      // Search risks
      (p.risks || []).forEach(r => {
        if (r.title.toLowerCase().includes(query) || (r.mitigation && r.mitigation.toLowerCase().includes(query))) {
          results.push({
            type: 'risk',
            id: r.id,
            title: r.title,
            subtitle: `Risk in: ${p.name}`,
            projectId: p.id
          });
        }
      });

      // Search issues
      (p.issues || []).forEach(i => {
        if (i.title.toLowerCase().includes(query) || (i.description && i.description.toLowerCase().includes(query))) {
          results.push({
            type: 'issue',
            id: i.id,
            title: i.title,
            subtitle: `Issue in: ${p.name}`,
            projectId: p.id
          });
        }
      });

      // Search assumptions
      (p.assumptions || []).forEach(a => {
        if (a.title.toLowerCase().includes(query) || (a.description && a.description.toLowerCase().includes(query))) {
          results.push({
            type: 'assumption',
            id: a.id,
            title: a.title,
            subtitle: `Assumption in: ${p.name}`,
            projectId: p.id
          });
        }
      });

      // Search dependencies
      (p.dependencies || []).forEach(d => {
        if (d.title.toLowerCase().includes(query) || (d.description && d.description.toLowerCase().includes(query))) {
          results.push({
            type: 'dependency',
            id: d.id,
            title: d.title,
            subtitle: `Dependency in: ${p.name}`,
            projectId: p.id
          });
        }
      });
    });

    return results.slice(0, 10);
  };

  const searchResults = getSearchResults();

  const handleResultClick = (result) => {
    if (result.type === 'project') {
      setView(result.projectId, 'summary');
    } else if (result.type === 'task') {
      setView(result.projectId, 'list');
      if (setSelectedTask) {
        setTimeout(() => {
          setSelectedTask(result.task);
        }, 100);
      }
    } else if (result.type === 'risk') {
      setView(result.projectId, 'raid', 'risks');
    } else if (result.type === 'issue') {
      setView(result.projectId, 'raid', 'issues');
    } else if (result.type === 'assumption') {
      setView(result.projectId, 'raid', 'assumptions');
    } else if (result.type === 'dependency') {
      setView(result.projectId, 'raid', 'dependencies');
    }

    if (setHighlightedItemId && result.type !== 'project' && result.type !== 'task') {
      setHighlightedItemId(result.id);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  // Resolve title
  let title = 'Operations Center';
  let subtitle = 'Enterprise Portfolio Health & Analytics';
  
  if (currentView === 'resources') {
    title = 'Resource Capacity Planner';
    subtitle = 'Real-time team utilization & scheduling heatmap';
  } else if (currentView === 'intake') {
    title = 'Project Intake Portal';
    subtitle = 'Demand management, scoring, and approval queue';
  } else if (currentView.startsWith('port-')) {
    const port = portfolios.find(p => p.id === currentView);
    title = port ? port.name : 'Portfolio';
    subtitle = `Portfolio Owner: ${port ? port.owner : ''}`;
  } else if (currentView.startsWith('prog-')) {
    const prog = programs.find(pr => pr.id === currentView);
    title = prog ? prog.name : 'Program';
    subtitle = `Program Manager: ${prog ? prog.owner : ''} | Sponsor: ${prog ? prog.sponsor : ''}`;
  } else {
    const activeProject = projects.find(p => p.id === currentView);
    if (activeProject) {
      title = activeProject.name;
      subtitle = `Project Manager: ${activeProject.owner} | Due Date: ${activeProject.dueDate || 'Unscheduled'}`;
    }
  }

  // Get current date string
  const formatDate = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setModalError('');

    if (!newProjName.trim()) {
      setModalError('Please enter a project name.');
      return;
    }
    if (!newProjDesc.trim()) {
      setModalError('Please enter a project description.');
      return;
    }

    const newProjId = `proj-${Date.now()}`;
    const newProjectData = {
      id: newProjId,
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      owner: currentUser?.name || 'Individual User',
      dueDate: newProjDueDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'healthy',
      capexBudget: Number(newProjCapex) || 0,
      opexBudget: Number(newProjOpex) || 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: newProjDueDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      strategicAlignment: Number(newProjValue) || 5,
      portfolioId: null,
      programId: null,
      tasks: [],
      risks: [],
      capexItems: [],
      assumptions: [],
      issues: [],
      dependencies: [],
      actionItems: [],
      decisions: [],
      requirements: [],
      targets: [],
      discussions: []
    };

    addProject(newProjectData);
    setIsCreateModalOpen(false);
    
    // Clear inputs
    setNewProjName('');
    setNewProjDesc('');
    setNewProjDueDate('');
    setNewProjCapex('');
    setNewProjOpex('');
    setNewProjValue(5);

    // Automatically redirect to the newly created project workspace
    setView(newProjId);
  };

  return (
    <div className="header-panel">
      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="google-modal-overlay" style={{ zIndex: 3000 }}>
          <div className="google-modal-card" style={{ maxWidth: '450px' }}>
            <div className="google-modal-header" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Create New Project</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Launch a new standalone project in your workspace.</p>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <div className="form-group">
                <label className="input-label">Project Name</label>
                <input 
                  type="text" 
                  value={newProjName}
                  onChange={(e) => { setNewProjName(e.target.value); setModalError(''); }}
                  placeholder="e.g. Website Redesign"
                  className="auth-input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Description</label>
                <textarea 
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Summarize the project goals..."
                  className="auth-input-field"
                  style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group col-6" style={{ width: '50%' }}>
                  <label className="input-label">Due Date</label>
                  <input 
                    type="date" 
                    value={newProjDueDate}
                    onChange={(e) => setNewProjDueDate(e.target.value)}
                    className="auth-input-field"
                    required
                  />
                </div>
                <div className="form-group col-6" style={{ width: '50%' }}>
                  <label className="input-label">Strategic Value (1-10)</label>
                  <select 
                    value={newProjValue}
                    onChange={(e) => setNewProjValue(e.target.value)}
                    className="profile-select-input"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(val => (
                      <option key={val} value={val}>{val} - {val >= 8 ? 'High' : val >= 5 ? 'Medium' : 'Low'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-6" style={{ width: '50%' }}>
                  <label className="input-label">CAPEX Budget ($)</label>
                  <input 
                    type="number" 
                    value={newProjCapex}
                    onChange={(e) => setNewProjCapex(e.target.value)}
                    placeholder="e.g. 5000"
                    className="auth-input-field"
                  />
                </div>
                <div className="form-group col-6" style={{ width: '50%' }}>
                  <label className="input-label">OPEX Budget ($)</label>
                  <input 
                    type="number" 
                    value={newProjOpex}
                    onChange={(e) => setNewProjOpex(e.target.value)}
                    placeholder="e.g. 2000"
                    className="auth-input-field"
                  />
                </div>
              </div>

              {modalError && (
                <div className="auth-error-banner" style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
                  <span>⚠️</span>
                  <span>{modalError}</span>
                </div>
              )}

              <div className="wizard-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary flex-1" 
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-2"
                  style={{ flex: 2 }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Title & Subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <h1 className="header-title" style={{ fontSize: '1.25rem', fontWeight: '700' }}>{title}</h1>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Modern Search Bar */}
        <div className="search-bar" style={{ position: 'relative' }}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search WBS, RAID, projects..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Search Results Dropdown Popover */}
          {showResults && searchQuery.trim() && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                marginTop: '6px',
                right: 0,
                width: '320px',
                maxHeight: '350px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 2000,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                padding: '6px 0'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {searchResults.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                  No matches found for "{searchQuery}"
                </div>
              ) : (
                searchResults.map(result => (
                  <div 
                    key={`${result.type}-${result.id}`}
                    className="profile-menu-item"
                    onClick={() => handleResultClick(result)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem' }}>
                        {result.type === 'project' && '📄'}
                        {result.type === 'task' && '📋'}
                        {result.type === 'risk' && '⚠️'}
                        {result.type === 'issue' && '🚨'}
                        {result.type === 'assumption' && '💡'}
                        {result.type === 'dependency' && '🔗'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {result.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', paddingLeft: '20px' }}>
                      {result.subtitle}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Date Stamp */}
        <div className="calendar-date-stamp">
          <svg style={{ width: '14px', height: '14px', color: 'var(--accent-secondary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatDate()}</span>
        </div>

        {/* Quick Proposal / Project Creation Action */}
        {currentUser?.role === 'Individual User' ? (
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="btn btn-primary"
            style={{ borderRadius: '100px' }}
          >
            <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        ) : (
          currentView !== 'intake' && (
            <button 
              onClick={() => setView('intake')} 
              className="btn btn-primary"
              style={{ borderRadius: '100px' }}
            >
              <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Propose Project
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Header;
