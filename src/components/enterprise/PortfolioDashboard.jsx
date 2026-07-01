import React, { useState } from 'react';

const PortfolioDashboard = ({ 
  projects = [], 
  resources = [], 
  intakeRequests = [], 
  setView, 
  calculateOpex, 
  calculateProjectProgress, 
  calculateProjectCost,
  approveIntakeRequest,
  declineIntakeRequest
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLead, setFilterLead] = useState('all');
  const [filterBu, setFilterBu] = useState('all');

  // Extract unique filter options
  const uniqueLeads = Array.from(new Set(projects.map(p => p.owner).filter(Boolean)));
  const uniqueBus = Array.from(new Set(projects.map(p => p.businessUnit || 'General')));

  // Filter projects list
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesLead = filterLead === 'all' || project.owner === filterLead;
    const matchesBu = filterBu === 'all' || (project.businessUnit || 'General') === filterBu;

    return matchesSearch && matchesStatus && matchesLead && matchesBu;
  });

  // Aggregate Metrics
  const totalBudget = projects.reduce((sum, p) => {
    return sum + (Number(p.capexBudget) || 0) + (Number(p.opexBudget) || 0);
  }, 0);

  const totalSpent = projects.reduce((sum, p) => {
    return sum + calculateProjectCost(p);
  }, 0);

  const pendingRequests = intakeRequests.filter(r => r.status === 'pending');
  
  const healthCount = projects.filter(p => p.status === 'healthy').length;
  const warningCount = projects.filter(p => p.status === 'warning').length;
  const riskCount = projects.filter(p => p.status === 'risk').length;

  // RAID metrics rollup
  const totalRaidExposure = projects.reduce((sum, p) => {
    const risks = (p.risks || []).filter(r => r.status === 'open').length;
    const issues = (p.issues || []).filter(i => i.status === 'open').length;
    const deps = (p.dependencies || []).filter(d => d.status === 'blocked').length;
    return sum + risks + issues + deps;
  }, 0);

  // Total Risk Exposure Index calculation
  const totalRiskScore = projects.reduce((sum, p) => {
    return sum + (p.risks || [])
      .filter(r => r.status === 'open')
      .reduce((s, r) => s + (Number(r.likelihood) || 0) * (Number(r.impact) || 0), 0);
  }, 0);

  const openRisks = projects.flatMap(p => (p.risks || []).filter(r => r.status === 'open'));
  const lowRisksCount = openRisks.filter(r => (Number(r.likelihood) || 0) * (Number(r.impact) || 0) < 6).length;
  const medRisksCount = openRisks.filter(r => {
    const s = (Number(r.likelihood) || 0) * (Number(r.impact) || 0);
    return s >= 6 && s < 15;
  }).length;
  const highRisksCount = openRisks.filter(r => (Number(r.likelihood) || 0) * (Number(r.impact) || 0) >= 15).length;

  // Next-Milestone Schedule Indicators
  const allMilestones = projects.flatMap(p => {
    return (p.tasks || [])
      .filter(t => t.isMilestone && t.status !== 'completed' && t.dueDate)
      .map(t => ({
        ...t,
        projectName: p.name
      }));
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const upcomingMilestones = allMilestones.slice(0, 3);

  // Business Unit rollups
  const buRollups = uniqueBus.map(bu => {
    const buProjects = projects.filter(p => (p.businessUnit || 'General') === bu);
    const count = buProjects.length;
    const budget = buProjects.reduce((s, p) => s + (Number(p.capexBudget) || 0) + (Number(p.opexBudget) || 0), 0);
    const progressSum = buProjects.reduce((s, p) => s + calculateProjectProgress(p), 0);
    const avgProgress = count > 0 ? Math.round(progressSum / count) : 0;
    return { bu, count, budget, avgProgress };
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* KPI 1: Budget */}
        <div className="metrics-card glass-panel">
          <div className="card-header">
            <span className="card-label">Total Portfolio Budget</span>
            <div className="card-icon">
              <svg style={{ width: '18px', height: '18px', color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <div className="card-value">{formatCurrency(totalBudget)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>CAPEX: {formatCurrency(projects.reduce((s,p)=>s+(Number(p.capexBudget)||0), 0))}</span>
            <span>OPEX: {formatCurrency(projects.reduce((s,p)=>s+(Number(p.opexBudget)||0), 0))}</span>
          </div>
        </div>

        {/* KPI 2: Spent */}
        <div className="metrics-card glass-panel">
          <div className="card-header">
            <span className="card-label">Actual Total Spent</span>
            <div className="card-icon">
              <svg style={{ width: '18px', height: '18px', color: 'var(--status-amber)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
          </div>
          <div className="card-value" style={{ 
            color: totalSpent > totalBudget ? 'var(--status-red)' : 'inherit' 
          }}>
            {formatCurrency(totalSpent)}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{
                width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%`,
                background: totalSpent > totalBudget ? 'var(--status-red)' : 'var(--accent-primary)'
              }}
            ></div>
          </div>
          <div className="card-subtext" style={{ marginTop: '6px' }}>
            {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of portfolio budget spent
          </div>
        </div>

        {/* KPI 3: Health */}
        <div className="metrics-card glass-panel">
          <div className="card-header">
            <span className="card-label">Health Distribution</span>
            <div className="card-icon">
              <svg style={{ width: '18px', height: '18px', color: 'var(--status-green)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', margin: '6px 0' }}>
            <span className="health-badge good">{healthCount} Healthy</span>
            <span className="health-badge warning">{warningCount} Warning</span>
            <span className="health-badge critical">{riskCount} At Risk</span>
          </div>
          <div className="card-subtext" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Real‑time PPM rollups</span>
            <span style={{ color: totalRaidExposure > 0 ? 'var(--status-red)' : 'var(--status-green)', fontWeight: '600' }}>
              ⚠️ {totalRaidExposure} RAID Blockers
            </span>
          </div>
        </div>

        {/* KPI 4: Proposals */}
        <div className="metrics-card glass-panel">
          <div className="card-header">
            <span className="card-label">Intake Proposals</span>
            <div className="card-icon">
              <svg style={{ width: '18px', height: '18px', color: 'var(--accent-secondary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
          </div>
          <div className="card-value">{pendingRequests.length}</div>
          <button 
            onClick={() => setView('intake')} 
            style={{ 
              background: 'none', border: 'none', color: 'var(--accent-secondary)', 
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', padding: 0
            }}
          >
            Review Queue &rarr;
          </button>
        </div>
      </div>

      {/* Filter Toolbar Panel */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search projects by name, descriptions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '14px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 3, justifyContent: 'flex-end' }}>
          <div className="form-group" style={{ width: '130px' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ padding: '6px 12px' }}>
              <option value="all">All Statuses</option>
              <option value="healthy">🟢 Healthy</option>
              <option value="warning">🟡 Warning</option>
              <option value="risk">🔴 At Risk</option>
            </select>
          </div>

          <div className="form-group" style={{ width: '140px' }}>
            <select value={filterLead} onChange={e => setFilterLead(e.target.value)} className="form-select" style={{ padding: '6px 12px' }}>
              <option value="all">All Project Leads</option>
              {uniqueLeads.map(lead => (
                <option key={lead} value={lead}>{lead}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ width: '150px' }}>
            <select value={filterBu} onChange={e => setFilterBu(e.target.value)} className="form-select" style={{ padding: '6px 12px' }}>
              <option value="all">All Business Units</option>
              {uniqueBus.map(bu => (
                <option key={bu} value={bu}>{bu}</option>
              ))}
            </select>
          </div>

          {(searchQuery || filterStatus !== 'all' || filterLead !== 'all' || filterBu !== 'all') && (
            <button 
              onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterLead('all'); setFilterBu('all'); }}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Projects and Operations Sidebar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left: Projects Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Active Enterprise Projects</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {filteredProjects.length} of {projects.length} Portfolios
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredProjects.map((project) => {
              const progress = calculateProjectProgress(project);
              const cost = calculateProjectCost(project);
              const budget = (Number(project.capexBudget) || 0) + (Number(project.opexBudget) || 0);
              const isOverBudget = cost > budget;

              let healthClass = 'good';
              let healthText = 'Healthy';
              if (project.status === 'warning') {
                healthClass = 'warning';
                healthText = 'Warning';
              } else if (project.status === 'risk') {
                healthClass = 'critical';
                healthText = 'At Risk';
              }

              return (
                <div key={project.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{project.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lead: {project.owner}</span>
                    </div>
                    <span className={`health-badge ${healthClass}`} style={{ fontSize: '0.65rem', padding: '3px 8px' }}>{healthText}</span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--accent-primary)' }}></div>
                    </div>
                  </div>

                  {/* Financials & Metadata */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Spent vs Budget</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: isOverBudget ? 'var(--status-red)' : 'var(--text-primary)' }}>
                        {formatCurrency(cost)} <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '400' }}>/ {formatCurrency(budget)}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Business Unit</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                        {project.businessUnit || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Manage Button */}
                  <button 
                    onClick={() => setView(project.id)} 
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', padding: '6px 0', fontSize: '0.75rem', borderRadius: '6px', gap: '6px' }}
                  >
                    Open Project Workspace
                    <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              );
            })}
            {filteredProjects.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontSize: '0.85rem', border: '1.5px dashed var(--border-subtle)', borderRadius: '8px' }}>
                No portfolios match the selected search filters.
              </div>
            )}
          </div>
        </div>

        {/* Right: Portfolio Operations Center Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Portfolio Risk Exposure Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '12px' }}>
              <svg style={{ width: '16px', height: '16px', color: 'var(--status-red)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Risk & Exposure Analysis
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Portfolio Risk Index</span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: totalRiskScore > 20 ? 'var(--status-red)' : totalRiskScore > 10 ? 'var(--status-amber)' : 'var(--status-green)' }}>
                {totalRiskScore}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🔴 High Severity (Score &gt;= 15)</span>
                <span style={{ fontWeight: '600', color: 'var(--status-red)' }}>{highRisksCount} risks</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🟡 Medium Severity (Score 6-12)</span>
                <span style={{ fontWeight: '600', color: 'var(--status-amber)' }}>{medRisksCount} risks</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>🟢 Low Severity (Score &lt; 6)</span>
                <span style={{ fontWeight: '600', color: 'var(--status-green)' }}>{lowRisksCount} risks</span>
              </div>
            </div>
          </div>

          {/* Section 2: Upcoming Portfolio Milestones Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '12px' }}>
              <svg style={{ width: '16px', height: '16px', color: 'var(--status-amber)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
              </svg>
              Key Portfolio Milestones
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingMilestones.map((milestone) => {
                const dueTime = new Date(milestone.dueDate).getTime();
                const nowTime = Date.now();
                const diffDays = Math.ceil((dueTime - nowTime) / (24 * 60 * 60 * 1000));
                
                let badgeBg = 'var(--status-blue-bg)';
                let badgeText = 'var(--status-blue)';
                let label = `In ${diffDays} days`;

                if (diffDays < 0) {
                  badgeBg = 'var(--status-red-bg)';
                  badgeText = 'var(--status-red)';
                  label = 'Overdue';
                } else if (diffDays <= 7) {
                  badgeBg = 'var(--status-red-bg)';
                  badgeText = 'var(--status-red)';
                  label = 'Urgent';
                } else if (diffDays <= 30) {
                  badgeBg = 'var(--status-amber-bg)';
                  badgeText = 'var(--status-amber)';
                }

                return (
                  <div key={milestone.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{milestone.title}</span>
                      <span className="badge" style={{ backgroundColor: badgeBg, color: badgeText, fontSize: '0.65rem', padding: '2px 6px' }}>
                        {label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>{milestone.projectName}</span>
                      <span>Due: {milestone.dueDate}</span>
                    </div>
                  </div>
                );
              })}
              {upcomingMilestones.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  No upcoming milestones scheduled.
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Business Unit Allocations Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '12px' }}>
              <svg style={{ width: '16px', height: '16px', color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              Business Unit Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {buRollups.map((rollup) => (
                <div key={rollup.bu} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{rollup.bu}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{rollup.count} {rollup.count === 1 ? 'proj' : 'projs'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Budget: {formatCurrency(rollup.budget)}</span>
                    <span>Avg Progress: {rollup.avgProgress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '4px', marginTop: '2px' }}>
                    <div className="progress-bar-fill" style={{ width: `${rollup.avgProgress}%`, background: 'var(--accent-primary)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
