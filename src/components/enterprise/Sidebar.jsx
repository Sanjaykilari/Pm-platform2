import React, { useState, useRef, useEffect } from 'react';

const Sidebar = ({ 
  currentView, 
  setView, 
  projects = [],
  portfolios = [],
  programs = [],
  currentUser,
  onLogout,
  setCurrentUser,
  profiles = [],
  pinned = false,
  setPinned
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);

  // Tree collapse state
  const [expandedPortfolios, setExpandedPortfolios] = useState({
    'port-1': true,
    'port-2': true
  });
  const [expandedPrograms, setExpandedPrograms] = useState({
    'prog-1': true,
    'prog-2': true,
    'prog-3': true
  });

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showMenu]);

  // Filter tree nodes based on user role permissions
  // Project Managers & Individual Users only see projects they own
  const getVisibleProjects = () => {
    if (currentUser.role === 'Project Manager' || currentUser.role === 'Individual User') {
      return projects.filter(p => 
        p.owner === currentUser.name || 
        p.sharedWith?.some(sw => 
          sw.id === currentUser.id || 
          (sw.email && currentUser.email && sw.email.toLowerCase() === currentUser.email.toLowerCase())
        )
      );
    }
    return projects;
  };

  const visibleProjects = getVisibleProjects();

  // Portfolio Managers only see projects in portfolios/programs they are associated with (or all for demo, but filtered projects)
  const visiblePrograms = programs;
  const visiblePortfolios = portfolios;

  const showManagementSection = currentUser.role !== 'Project Manager' && currentUser.role !== 'Individual User';
  const showResources = currentUser.role !== 'Project Manager' && currentUser.role !== 'Individual User';
  const showIntake = currentUser.role === 'PPM Administrator';

  const expanded = isHovered || pinned;

  const togglePortfolio = (id, e) => {
    e.stopPropagation();
    setExpandedPortfolios(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProgram = (id, e) => {
    e.stopPropagation();
    setExpandedPrograms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Find orphan projects (no portfolio & no program)
  const orphanProjects = visibleProjects.filter(p => !p.portfolioId && !p.programId);

  return (
    <div 
      className="sidebar-panel glass-panel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: expanded ? '260px' : '72px',
        padding: expanded ? '24px 16px' : '24px 12px',
        transition: 'width 0.2s ease-in-out, padding 0.2s ease-in-out',
        boxShadow: (isHovered && !pinned) ? '4px 0 20px rgba(0, 0, 0, 0.08)' : 'var(--shadow-md)',
        overflowX: 'hidden',
        zIndex: 110
      }}
    >
      {/* Brand Logo & Pin Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: expanded ? 'space-between' : 'center', 
          marginBottom: '24px', 
          padding: expanded ? '0 8px' : '0', 
          position: 'relative' 
        }}
      >
        {expanded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-indigo, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem',
              color: 'white',
            }}>▲</div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
              Aura<span style={{ color: 'var(--accent-primary, #6366f1)' }}>PPM</span>
            </span>
          </div>
        ) : (
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-indigo, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem',
              color: 'white',
            }}
          >
            ▲
          </div>
        )}

        {/* Pin/Unpin Toggle Button */}
        <button 
          onClick={() => setPinned(!pinned)} 
          className="btn-ghost"
          style={{ 
            padding: '4px', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? 'auto' : 'none',
            transition: 'opacity 0.15s ease',
            position: expanded ? 'static' : 'absolute',
            top: '36px'
          }}
          title={pinned ? "Unpin Sidebar" : "Pin Sidebar"}
        >
          <svg 
            style={{ 
              width: '12px', 
              height: '12px', 
              transform: pinned ? 'rotate(0deg)' : 'rotate(45deg)', 
              transition: 'transform 0.2s ease',
              color: pinned ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.56-3.2A2 2 0 0 1 15 9.56V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4.56a2 2 0 0 1-.56 1.24l-2.56 3.2a2 2 0 0 0-.44 1.24z" />
          </svg>
        </button>
      </div>

      {/* Main Core Views Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        <button 
          onClick={() => setView('home')} 
          className={`sidebar-nav-btn ${currentView === 'home' ? 'active' : ''}`}
          style={{ 
            justifyContent: expanded ? 'flex-start' : 'center', 
            padding: expanded ? '8px 12px' : '8px 0',
            gap: expanded ? '12px' : '0'
          }}
          title={!expanded ? "Home Dashboard" : ""}
        >
          <span style={{ fontSize: '1.1rem' }}>🏠</span>
          {expanded && <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Home Dashboard</span>}
        </button>

        {showManagementSection && (
          <button 
            onClick={() => setView('portfolio')} 
            className={`sidebar-nav-btn ${currentView === 'portfolio' ? 'active' : ''}`}
            style={{ 
              justifyContent: expanded ? 'flex-start' : 'center', 
              padding: expanded ? '8px 12px' : '8px 0',
              gap: expanded ? '12px' : '0'
            }}
            title={!expanded ? "Operations Dashboard" : ""}
          >
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            {expanded && <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Operations Center</span>}
          </button>
        )}
        
        {showResources && (
          <button 
            onClick={() => setView('resources')} 
            className={`sidebar-nav-btn ${currentView === 'resources' ? 'active' : ''}`}
            style={{ 
              justifyContent: expanded ? 'flex-start' : 'center', 
              padding: expanded ? '8px 12px' : '8px 0',
              gap: expanded ? '12px' : '0'
            }}
            title={!expanded ? "Resource Planner" : ""}
          >
            <span style={{ fontSize: '1.1rem' }}>👥</span>
            {expanded && <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Resource Planner</span>}
          </button>
        )}

        {showIntake && (
          <button 
            onClick={() => setView('intake')} 
            className={`sidebar-nav-btn ${currentView === 'intake' ? 'active' : ''}`}
            style={{ 
              justifyContent: expanded ? 'flex-start' : 'center', 
              padding: expanded ? '8px 12px' : '8px 0',
              gap: expanded ? '12px' : '0'
            }}
            title={!expanded ? "Project Intake Portal" : ""}
          >
            <span style={{ fontSize: '1.1rem' }}>📥</span>
            {expanded && <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Intake Portal</span>}
          </button>
        )}
      </div>

      <div className="sidebar-divider" style={{ borderBottom: '1px solid var(--border-subtle)', margin: '4px 0 12px 0' }} />

      {/* Hierarchical Tree Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto', gap: '8px' }} className="custom-scrollbar">
        {expanded ? (
          <>
            {currentUser.role === 'Individual User' ? (
              <span className="sidebar-section-title" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', padding: '0 8px' }}>
                My Workspace
              </span>
            ) : (
              <span className="sidebar-section-title" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', padding: '0 8px' }}>
                PPM Hierarchy Tree
              </span>
            )}
            
            <div className="hierarchy-tree-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Render Portfolios */}
              {currentUser.role !== 'Individual User' && visiblePortfolios.map((port) => {
                const isPortSelected = currentView === port.id;
                const isPortExpanded = expandedPortfolios[port.id];
                const portPrograms = visiblePrograms.filter(pr => pr.portfolioId === port.id);

                return (
                  <div key={port.id} className="tree-node-portfolio">
                    {/* Portfolio Row */}
                    <div 
                      onClick={() => setView(port.id)}
                      className={`tree-row portfolio-row ${isPortSelected ? 'active-node' : ''}`}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', gap: '6px', fontSize: '0.8rem', fontWeight: '600'
                      }}
                    >
                      <button 
                        onClick={(e) => togglePortfolio(port.id, e)}
                        style={{ border: 'none', background: 'none', padding: '0', cursor: 'pointer', width: '12px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
                      >
                        {isPortExpanded ? '▼' : '▶'}
                      </button>
                      <span>💼</span>
                      <span className="truncate-text" style={{ flexGrow: 1 }} title={port.name}>{port.name}</span>
                    </div>

                    {/* Collapsible Program Nodes */}
                    {isPortExpanded && (
                      <div className="tree-programs-container" style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                        {portPrograms.map((prog) => {
                          const isProgSelected = currentView === prog.id;
                          const isProgExpanded = expandedPrograms[prog.id];
                          const progProjects = visibleProjects.filter(pj => pj.programId === prog.id);

                          return (
                            <div key={prog.id} className="tree-node-program">
                              {/* Program Row */}
                              <div
                                onClick={() => setView(prog.id)}
                                className={`tree-row program-row ${isProgSelected ? 'active-node' : ''}`}
                                style={{
                                  display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', gap: '6px', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)'
                                }}
                              >
                                <button 
                                  onClick={(e) => toggleProgram(prog.id, e)}
                                  style={{ border: 'none', background: 'none', padding: '0', cursor: 'pointer', width: '10px', fontSize: '0.55rem', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                                >
                                  {isProgExpanded ? '▼' : '▶'}
                                </button>
                                <span>📁</span>
                                <span className="truncate-text" style={{ flexGrow: 1 }} title={prog.name}>{prog.name}</span>
                              </div>

                              {/* Collapsible Project Nodes */}
                              {isProgExpanded && (
                                <div className="tree-projects-container" style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                                  {progProjects.map((proj) => {
                                    const isProjSelected = currentView === proj.id;
                                    let statusDotColor = 'var(--status-green)';
                                    if (proj.status === 'warning') statusDotColor = 'var(--status-amber)';
                                    if (proj.status === 'risk') statusDotColor = 'var(--status-red)';

                                    return (
                                      <div
                                        key={proj.id}
                                        onClick={() => setView(proj.id)}
                                        className={`tree-row project-row ${isProjSelected ? 'active-node' : ''}`}
                                        style={{
                                          display: 'flex', alignItems: 'center', padding: '4px 8px 4px 14px', borderRadius: '6px', cursor: 'pointer', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)'
                                        }}
                                      >
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusDotColor, boxShadow: `0 0 4px ${statusDotColor}` }}></div>
                                        <span>📄</span>
                                        <span className="truncate-text" style={{ flexGrow: 1 }} title={proj.name}>{proj.name}</span>
                                      </div>
                                    );
                                  })}
                                  {progProjects.length === 0 && (
                                    <div style={{ padding: '4px 8px 4px 14px', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                      No child projects
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {portPrograms.length === 0 && (
                          <div style={{ padding: '4px 8px 4px 14px', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No programs
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Render Orphan Projects */}
              {orphanProjects.length > 0 && (
                <div className="tree-node-portfolio" style={{ marginTop: currentUser.role === 'Individual User' ? '0px' : '8px' }}>
                  {currentUser.role !== 'Individual User' && (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      <span>🔗</span>
                      <span style={{ marginLeft: '6px' }}>Standalone Projects</span>
                    </div>
                  )}
                  <div className="tree-projects-container" style={{ paddingLeft: currentUser.role === 'Individual User' ? '0px' : '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {orphanProjects.map((proj) => {
                      const isProjSelected = currentView === proj.id;
                      let statusDotColor = 'var(--status-green)';
                      if (proj.status === 'warning') statusDotColor = 'var(--status-amber)';
                      if (proj.status === 'risk') statusDotColor = 'var(--status-red)';

                      return (
                        <div
                          key={proj.id}
                          onClick={() => setView(proj.id)}
                          className={`tree-row project-row ${isProjSelected ? 'active-node' : ''}`}
                          style={{
                            display: 'flex', alignItems: 'center', padding: '4px 8px 4px 10px', borderRadius: '6px', cursor: 'pointer', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)'
                          }}
                        >
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusDotColor, boxShadow: `0 0 4px ${statusDotColor}` }}></div>
                          <span>📄</span>
                          <span className="truncate-text" style={{ flexGrow: 1 }} title={proj.name}>{proj.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Collapsed Icons Only List */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {currentUser.role !== 'Individual User' && visiblePortfolios.map((port) => (
              <button
                key={port.id}
                onClick={() => setView(port.id)}
                className={`sidebar-nav-btn ${currentView === port.id ? 'active' : ''}`}
                style={{ padding: '6px', borderRadius: '6px', display: 'flex', justifyContent: 'center' }}
                title={port.name}
              >
                <span style={{ fontSize: '1rem' }}>💼</span>
              </button>
            ))}
            {orphanProjects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setView(proj.id)}
                className={`sidebar-nav-btn ${currentView === proj.id ? 'active' : ''}`}
                style={{ padding: '6px', borderRadius: '6px', display: 'flex', justifyContent: 'center' }}
                title={`Standalone: ${proj.name}`}
              >
                <span style={{ fontSize: '1rem' }}>🔗</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-divider" style={{ borderBottom: '1px solid var(--border-subtle)', margin: '12px 0 8px 0' }} />

      {/* Profile Switcher Capsule */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        {/* Floating switcher popup menu */}
        {showMenu && (
          <div 
            className="profile-menu-popup"
            style={{
              left: '0',
              right: expanded ? '0' : 'auto',
              width: expanded ? 'auto' : '240px',
              bottom: 'calc(100% + 8px)'
            }}
          >
            <div style={{ padding: '8px 12px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
              Switch User Profile
            </div>
            {profiles.map(profile => (
              <div 
                key={profile.id}
                className={`profile-menu-item ${currentUser.id === profile.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentUser(profile);
                  setShowMenu(false);
                }}
              >
                <div className="profile-switcher-avatar" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                  {profile.avatar}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{profile.name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{profile.role}</span>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', padding: '4px 0 0 0' }}>
              <div 
                className="profile-menu-item"
                style={{ color: 'var(--status-red)', fontWeight: '600' }}
                onClick={() => {
                  onLogout();
                  setShowMenu(false);
                }}
              >
                <span>🚪</span>
                <span style={{ fontSize: '0.8rem', marginLeft: '8px' }}>Sign Out</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected profile clickable capsule trigger */}
        <div 
          className="profile-switcher" 
          onClick={() => setShowMenu(!showMenu)}
          style={{ 
            justifyContent: expanded ? 'flex-start' : 'center', 
            padding: expanded ? '12px' : '12px 0' 
          }}
          title={!expanded ? `${currentUser.name} (${currentUser.role})` : ""}
        >
          <div className="profile-switcher-avatar" style={{ margin: expanded ? '0' : '0 auto' }}>
            {currentUser.avatar}
          </div>
          {expanded && (
            <>
              <div className="profile-switcher-info">
                <div className="profile-switcher-name">{currentUser.name}</div>
                <div className="profile-switcher-role">{currentUser.role}</div>
              </div>
              <svg className="profile-switcher-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
