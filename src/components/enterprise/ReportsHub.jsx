import React, { useState } from 'react';

const ReportsHub = ({ project }) => {
  const [activeReport, setActiveReport] = useState('burnup');

  const reports = [
    { id: 'burnup', name: 'Burnup Report', description: 'Visualize completed work vs total scope to track progress toward sprint completion.', icon: '🔥' },
    { id: 'burndown', name: 'Sprint Burndown', description: 'Track work remaining within the sprint and summarize performance.', icon: '📉' },
    { id: 'velocity', name: 'Velocity Report', description: 'Predict future capacity by reviewing value delivered in previous sprints.', icon: '⚡' },
    { id: 'cfd', name: 'Cumulative Flow Diagram', description: 'See which columns accumulate items to identify bottlenecks.', icon: '🌊' },
    { id: 'cycletime', name: 'Cycle Time Report', description: 'Understand how long it takes to ship work items through the pipeline.', icon: '⏱️' },
    { id: 'deployment', name: 'Deployment Frequency', description: 'Understand risk and how often you are shipping value.', icon: '🚀' }
  ];

  // --- Render Chart Mocks ---
  
  const renderBurnup = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Burnup Report</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tracking total scope (gray) against completed work (green) over the last 14 days.</p>
        
        <div style={{ position: 'relative', height: '300px', width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.02) 1px, transparent 1px)', backgroundSize: '100% 40px', borderBottom: '2px solid var(--border-subtle)', borderLeft: '2px solid var(--border-subtle)' }}>
          {/* Total Scope Line */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
            <polyline points="0,50 100,50 200,60 300,60 400,60 500,40 600,40 800,40" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeDasharray="5,5" />
            <polyline points="0,300 100,280 200,240 300,210 400,180 500,120 600,90" fill="none" stroke="var(--status-green)" strokeWidth="4" />
            {/* Shaded Area */}
            <polygon points="0,300 100,280 200,240 300,210 400,180 500,120 600,90 600,300 0,300" fill="var(--status-green-bg)" opacity="0.4" />
          </svg>
          <div style={{ position: 'absolute', right: '10%', top: '30px', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>Scope (32 points)</div>
          <div style={{ position: 'absolute', left: '70%', top: '100px', background: 'var(--status-green)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Completed (24 points)</div>
        </div>
      </div>
    );
  };

  const renderBurndown = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Sprint Burndown Chart</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tracking remaining effort for the current sprint cycle.</p>
        
        <div style={{ position: 'relative', height: '300px', width: '100%', borderBottom: '2px solid var(--border-subtle)', borderLeft: '2px solid var(--border-subtle)' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
            {/* Ideal Guideline */}
            <line x1="0" y1="20" x2="800" y2="300" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4,4" />
            {/* Actual Burndown */}
            <polyline points="0,20 100,20 200,80 300,80 400,140 500,120 600,190" fill="none" stroke="var(--status-red)" strokeWidth="4" />
          </svg>
          <div style={{ position: 'absolute', left: '70%', top: '210px', background: 'var(--status-red)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Actual Work Remaining</div>
        </div>
      </div>
    );
  };

  const renderVelocity = () => {
    const sprints = [
      { name: 'Sprint 1', committed: 40, completed: 35 },
      { name: 'Sprint 2', committed: 45, completed: 45 },
      { name: 'Sprint 3', committed: 50, completed: 42 },
      { name: 'Sprint 4', committed: 45, completed: 48 },
      { name: 'Sprint 5', committed: 55, completed: 50 },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Velocity Report</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Committed vs Completed story points over the last 5 sprints.</p>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', height: '300px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0px', paddingTop: '40px' }}>
          {sprints.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '100%', position: 'relative' }}>
              {/* Committed Bar */}
              <div style={{ width: '40px', height: `${(s.committed / 60) * 100}%`, backgroundColor: 'var(--border-accent)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-20px', width: '100%', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.committed}</span>
              </div>
              {/* Completed Bar */}
              <div style={{ width: '40px', height: `${(s.completed / 60) * 100}%`, backgroundColor: 'var(--status-green)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-20px', width: '100%', textAlign: 'center', fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 'bold' }}>{s.completed}</span>
              </div>
              <span style={{ position: 'absolute', bottom: '-24px', width: '100px', textAlign: 'center', left: '-6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCFD = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Cumulative Flow Diagram</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Identify bottlenecks by visualizing workflow columns over time.</p>
        
        <div style={{ position: 'relative', height: '300px', width: '100%', border: '1px solid var(--border-subtle)', overflow: 'hidden', borderRadius: '8px' }}>
          <svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
            <polygon points="0,300 0,0 800,0 800,300" fill="var(--bg-tertiary)" />
            <polygon points="0,300 0,50 200,80 400,100 600,150 800,200 800,300" fill="var(--status-blue-bg)" />
            <polygon points="0,300 0,150 200,180 400,200 600,220 800,250 800,300" fill="var(--accent-primary)" opacity="0.6" />
            <polygon points="0,300 0,250 200,260 400,260 600,270 800,280 800,300" fill="var(--status-green)" />
          </svg>
          <div style={{ position: 'absolute', right: '20px', top: '20px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--bg-tertiary)' }}></div> To Do</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--status-blue-bg)' }}></div> In Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--accent-primary)', opacity: 0.6 }}></div> In Review</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--status-green)' }}></div> Done</div>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'burnup': return renderBurnup();
      case 'burndown': return renderBurndown();
      case 'velocity': return renderVelocity();
      case 'cfd': return renderCFD();
      default: return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
          Detailed view for {reports.find(r => r.id === activeReport)?.name} coming soon!
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 220px)', gap: '20px' }}>
      
      {/* Sidebar: Reports List */}
      <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', paddingLeft: '8px' }}>Agile Reports</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {reports.map(report => (
            <div 
              key={report.id} 
              onClick={() => setActiveReport(report.id)}
              style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                backgroundColor: activeReport === report.id ? 'var(--bg-primary)' : 'transparent',
                boxShadow: activeReport === report.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                border: activeReport === report.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.2rem' }}>{report.icon}</span>
                <div style={{ fontSize: '0.85rem', fontWeight: activeReport === report.id ? '700' : '600', color: 'var(--text-primary)' }}>
                  {report.name}
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4', paddingLeft: '26px' }}>
                {report.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Chart View */}
      <div className="glass-panel" style={{ flexGrow: 1, padding: '32px' }}>
        {renderActiveReport()}
      </div>

    </div>
  );
};

export default ReportsHub;
