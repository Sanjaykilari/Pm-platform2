import React, { useState } from 'react';

const RaidLogView = ({ 
  project, 
  resources = [],
  currentUser,
  addRisk, 
  updateRisk, 
  deleteRisk,
  addAssumption,
  updateAssumption,
  deleteAssumption,
  addIssue,
  updateIssue,
  deleteIssue,
  addDependency,
  updateDependency,
  deleteDependency,
  addActionItem,
  updateActionItem,
  deleteActionItem,
  addDecision,
  updateDecision,
  deleteDecision,
  isReadOnly: propReadOnly = false,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab,
  highlightedItemId
}) => {
  const [localActiveSubTab, setLocalActiveSubTab] = useState('risks');
  const activeSubTab = propActiveSubTab !== undefined ? propActiveSubTab : localActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab !== undefined ? propSetActiveSubTab : setLocalActiveSubTab;

  const isReadOnly = propReadOnly || currentUser?.role === 'Portfolio Manager';

  // Form States - Risks
  const [riskTitle, setRiskTitle] = useState('');
  const [riskLikelihood, setRiskLikelihood] = useState(3);
  const [riskImpact, setRiskImpact] = useState(3);
  const [riskMitigation, setRiskMitigation] = useState('');
  const [riskOwner, setRiskOwner] = useState('');
  const [riskMitStatus, setRiskMitStatus] = useState('not-started');

  // Form States - Assumptions
  const [assTitle, setAssTitle] = useState('');
  const [assDesc, setAssDesc] = useState('');
  const [assCategory, setAssCategory] = useState('Technical');
  const [assDate, setAssDate] = useState('');
  const [assOwner, setAssOwner] = useState('');
  const [assValNotes, setAssValNotes] = useState('');
  const [assValBy, setAssValBy] = useState('');

  // Form States - Issues
  const [issTitle, setIssTitle] = useState('');
  const [issDesc, setIssDesc] = useState('');
  const [issSeverity, setIssSeverity] = useState('medium');
  const [issOwner, setIssOwner] = useState('');
  const [issResPlan, setIssResPlan] = useState('');

  // Form States - Dependencies
  const [depTitle, setDepTitle] = useState('');
  const [depDesc, setDepDesc] = useState('');
  const [depType, setDepType] = useState('internal');
  const [depImpact, setDepImpact] = useState('medium');
  const [depOwner, setDepOwner] = useState('');
  const [depExpectedDate, setDepExpectedDate] = useState('');

  // Form States - Action Items
  const [actTitle, setActTitle] = useState('');
  const [actAssigneeId, setActAssigneeId] = useState('');
  const [actDueDate, setActDueDate] = useState('');

  // Form States - Decisions
  const [decTitle, setDecTitle] = useState('');
  const [decDeciders, setDecDeciders] = useState('');
  const [decDate, setDecDate] = useState('');
  const [decOptions, setDecOptions] = useState('');
  const [decNotes, setDecNotes] = useState('');

  const risks = project.risks || [];
  const assumptions = project.assumptions || [];
  const issues = project.issues || [];
  const dependencies = project.dependencies || [];
  const actionItems = project.actionItems || [];
  const decisions = project.decisions || [];

  // Submit Handlers
  const handleRiskSubmit = (e) => {
    e.preventDefault();
    if (!riskTitle || !riskOwner) return;
    addRisk(project.id, {
      title: riskTitle,
      likelihood: Number(riskLikelihood),
      impact: Number(riskImpact),
      mitigation: riskMitigation,
      owner: riskOwner,
      status: 'open',
      mitigationStatus: riskMitStatus
    });
    setRiskTitle(''); setRiskMitigation(''); setRiskOwner(''); setRiskLikelihood(3); setRiskImpact(3); setRiskMitStatus('not-started');
  };

  const handleAssSubmit = (e) => {
    e.preventDefault();
    if (!assTitle || !assOwner) return;
    addAssumption(project.id, {
      title: assTitle,
      description: assDesc,
      category: assCategory,
      validationDate: assDate || null,
      owner: assOwner,
      status: 'unvalidated',
      validationNotes: assValNotes,
      validatedBy: assValBy
    });
    setAssTitle(''); setAssDesc(''); setAssOwner(''); setAssDate(''); setAssValNotes(''); setAssValBy('');
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issTitle || !issOwner) return;
    addIssue(project.id, {
      title: issTitle,
      description: issDesc,
      severity: issSeverity,
      owner: issOwner,
      resolution: issResPlan,
      status: 'open',
      resolutionNotes: '',
      closureCategory: 'Fixed',
      resolvedDate: ''
    });
    setIssTitle(''); setIssDesc(''); setIssOwner(''); setIssResPlan('');
  };

  const handleDepSubmit = (e) => {
    e.preventDefault();
    if (!depTitle || !depOwner) return;
    addDependency(project.id, {
      title: depTitle,
      description: depDesc,
      type: depType,
      impact: depImpact,
      owner: depOwner,
      status: 'pending',
      expectedDeliveryDate: depExpectedDate || ''
    });
    setDepTitle(''); setDepDesc(''); setDepOwner(''); setDepExpectedDate('');
  };

  const handleActSubmit = (e) => {
    e.preventDefault();
    if (!actTitle) return;
    addActionItem(project.id, {
      title: actTitle,
      assigneeId: actAssigneeId || null,
      dueDate: actDueDate || '',
      status: 'pending'
    });
    setActTitle(''); setActAssigneeId(''); setActDueDate('');
  };

  const handleDecSubmit = (e) => {
    e.preventDefault();
    if (!decTitle) return;
    addDecision(project.id, {
      title: decTitle,
      deciders: decDeciders,
      dateDecided: decDate || new Date().toISOString().split('T')[0],
      optionsConsidered: decOptions,
      notes: decNotes
    });
    setDecTitle(''); setDecDeciders(''); setDecDate(''); setDecOptions(''); setDecNotes('');
  };

  const getMatrixCellClass = (l, i) => {
    const sev = l * i;
    if (sev >= 15) return 'level-5';
    if (sev >= 10) return 'level-4';
    if (sev >= 8) return 'level-3';
    if (sev >= 4) return 'level-2';
    return 'level-1';
  };

  const getResourceName = (resId) => {
    const res = resources.find(r => r.id === resId);
    return res ? res.name : 'Unassigned';
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      
      {/* RAID Dashboard Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        {[
          { label: 'Risks', count: risks.length, active: risks.filter(r=>r.status==='open').length, color: 'var(--status-amber)', border: '#f59e0b' },
          { label: 'Issues', count: issues.length, active: issues.filter(i=>i.status==='open').length, color: 'var(--status-red)', border: '#dc2626' },
          { label: 'Assumptions', count: assumptions.length, active: assumptions.filter(a=>a.status==='unvalidated').length, color: 'var(--status-blue)', border: '#3b82f6' },
          { label: 'Dependencies', count: dependencies.length, active: dependencies.filter(d=>d.status==='blocked' || d.status==='delayed').length, color: '#6366f1', border: '#6366f1' },
          { label: 'Action Items', count: actionItems.length, active: actionItems.filter(a=>a.status==='pending').length, color: 'var(--status-green)', border: '#10b981' },
          { label: 'Decisions', count: decisions.length, active: decisions.length, color: '#0f172a', border: '#94a3b8' }
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderLeft: `4px solid ${kpi.border}`,
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            cursor: 'default',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.count}</div>
            <div style={{ fontSize: '0.75rem', color: kpi.active > 0 ? kpi.color : 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: kpi.active > 0 ? kpi.color : 'var(--text-muted)', display: 'inline-block' }}></span>
              {kpi.active} active
            </div>
          </div>
        ))}
      </div>

      {/* RAID Sub-tabs Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '16px', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {[
          { id: 'risks', label: 'Risks', count: risks.length, color: 'var(--status-red)' },
          { id: 'assumptions', label: 'Assumptions', count: assumptions.length, color: 'var(--status-blue)' },
          { id: 'issues', label: 'Issues', count: issues.filter(i=>i.status==='open').length, color: 'var(--status-amber)' },
          { id: 'dependencies', label: 'Dependencies', count: dependencies.length, color: 'var(--status-blue)' },
          { id: 'actionItems', label: 'Action Items', count: actionItems.length, color: 'var(--status-green)' },
          { id: 'decisions', label: 'Decisions', count: decisions.length, color: '#0f766e' }
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => setActiveSubTab(subTab.id)}
            style={{
              padding: '6px 16px', fontSize: '0.85rem', fontWeight: '600', position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              color: activeSubTab === subTab.id ? subTab.color : 'var(--text-secondary)'
            }}
          >
            {subTab.label}
            {subTab.count > 0 && (
              <span style={{ fontSize: '0.65rem', marginLeft: '6px', background: 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                {subTab.count}
              </span>
            )}
            {activeSubTab === subTab.id && (
              <div style={{ position: 'absolute', bottom: '-11px', left: 0, right: 0, height: '2px', backgroundColor: subTab.color }}></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div style={{ marginTop: '10px' }}>
        {/* ==================== RISKS TAB ==================== */}
        {activeSubTab === 'risks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
              {/* Matrix Grid */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Severity Assessment Matrix</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Visual mapping of open risk events. Plotted bubbles are derived from Likelihood &times; Impact scores.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Likelihood (1 &rarr; 5)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '380px' }}>
                      <div className="risk-matrix-grid">
                        {[5, 4, 3, 2, 1].map((lValue) => (
                          <React.Fragment key={lValue}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', width: '20px' }}>
                              {lValue}
                            </div>
                            {[1, 2, 3, 4, 5].map((iValue) => {
                              const matchingRisks = risks.filter(
                                r => r.likelihood === lValue && r.impact === iValue && r.status === 'open'
                              );

                              return (
                                <div key={iValue} className={`risk-matrix-cell ${getMatrixCellClass(lValue, iValue)}`}>
                                  {matchingRisks.map((risk) => (
                                    <div key={risk.id} className="risk-bubble-marker" title={`${risk.title} (Severity: ${risk.likelihood * risk.impact})`}>
                                      R{risks.indexOf(risk) + 1}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                        <div></div>
                        {[1, 2, 3, 4, 5].map((iValue) => (
                          <div key={iValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', height: '20px' }}>
                            {iValue}
                          </div>
                        ))}
                      </div>
                      <div style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '10px', letterSpacing: '0.5px' }}>
                        Impact (1 &rarr; 5)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Risk Assessment Rules</h3>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong style={{ color: 'var(--status-red)' }}>Critical (15 - 25)</strong>: High probability and severe impact. Requires immediate PM intervention.</li>
                    <li><strong style={{ color: 'var(--status-amber)' }}>Major (8 - 12)</strong>: Significant schedule or financial risks. Active mitigation plan required.</li>
                    <li><strong style={{ color: 'var(--status-blue)' }}>Minor (1 - 6)</strong>: Acceptable operational friction. Review during team syncs.</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{risks.filter(r => r.status === 'open').length}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>Open Risks</div>
                  </div>
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--status-green)' }}>{risks.filter(r => r.status === 'mitigated').length}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>Mitigated</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
              {/* Risks Table */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Active Risk Registry</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Ref</th>
                      <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Risk Event</th>
                      <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>L &times; I</th>
                      <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Mitigation Plan</th>
                      <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Mit. Status</th>
                      <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Owner</th>
                      <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px', width: '50px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((risk, index) => (
                      <tr key={risk.id} style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: risk.id === highlightedItemId ? 'rgba(254, 240, 138, 0.4)' : 'transparent', transition: 'background-color 0.5s ease' }}>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>R{index + 1}</td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', fontWeight: '500' }}>{risk.title}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${getMatrixCellClass(risk.likelihood, risk.impact)}`} style={{ fontSize: '0.75rem', padding: '3px 8px', border: 'none' }}>
                            {risk.likelihood} &times; {risk.impact} ({risk.likelihood * risk.impact})
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{risk.mitigation || 'No mitigation entered.'}</td>
                        <td style={{ padding: '12px 8px' }}>
                          {isReadOnly ? (
                            <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{risk.mitigationStatus || 'Not Started'}</span>
                          ) : (
                            <select
                              value={risk.mitigationStatus || 'not-started'}
                              onChange={(e) => updateRisk(project.id, risk.id, { mitigationStatus: e.target.value })}
                              className="form-select"
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{risk.owner}</td>
                        <td style={{ padding: '12px 8px' }}>
                          {!isReadOnly && (
                            <button onClick={()=>deleteRisk(project.id, risk.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {risks.length === 0 && (
                      <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No risks logged. Registry is empty.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Form */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', alignSelf: 'start' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Log Project Risk</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Identify issues before they manifest to structure mitigations.</p>
                {isReadOnly ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You do not have permission to log risks.</p>
                ) : (
                  <form onSubmit={handleRiskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group">
                      <label>Risk Title</label>
                      <input type="text" value={riskTitle} onChange={e=>setRiskTitle(e.target.value)} placeholder="e.g. AWS outage halts deployment" className="form-input" required />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Likelihood (1‑5)</label>
                        <select value={riskLikelihood} onChange={e=>setRiskLikelihood(e.target.value)} className="form-select">
                          <option value="1">1 - Rare</option>
                          <option value="2">2 - Unlikely</option>
                          <option value="3">3 - Moderate</option>
                          <option value="4">4 - Likely</option>
                          <option value="5">5 - Almost Certain</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Impact (1‑5)</label>
                        <select value={riskImpact} onChange={e=>setRiskImpact(e.target.value)} className="form-select">
                          <option value="1">1 - Negligible</option>
                          <option value="2">2 - Minor</option>
                          <option value="3">3 - Moderate</option>
                          <option value="4">4 - Major</option>
                          <option value="5">5 - Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Mitigation Strategy</label>
                      <input type="text" value={riskMitigation} onChange={e=>setRiskMitigation(e.target.value)} placeholder="Action items to limit impact..." className="form-input" />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Owner</label>
                        <input type="text" value={riskOwner} onChange={e=>setRiskOwner(e.target.value)} placeholder="Owner name" className="form-input" required />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Mit. Status</label>
                        <select value={riskMitStatus} onChange={e=>setRiskMitStatus(e.target.value)} className="form-select">
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Log Active Risk</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ASSUMPTIONS TAB ==================== */}
        {activeSubTab === 'assumptions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            {/* Table */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Assumptions & Hypotheses</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th>Ref</th>
                    <th>Assumption details</th>
                    <th>Category</th>
                    <th>Validation date</th>
                    <th>Owner</th>
                    <th>Status</th>
                    {!isReadOnly && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {assumptions.map((ass, idx) => (
                    <tr key={ass.id} style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: ass.id === highlightedItemId ? 'rgba(254, 240, 138, 0.4)' : 'transparent', transition: 'background-color 0.5s ease' }}>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>A{idx + 1}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: '500' }}>{ass.title}</div>
                        {ass.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{ass.description}</div>}
                        {ass.validatedBy && <div style={{ fontSize: '0.7rem', color: 'var(--status-green)', marginTop: '4px' }}>Validated by: {ass.validatedBy} ({ass.validationNotes})</div>}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{ass.category}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{ass.validationDate || 'Continuous'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{ass.owner}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {isReadOnly ? (
                          <span style={{ fontSize: '0.75rem' }}>{ass.status}</span>
                        ) : (
                          <select value={ass.status || 'unvalidated'} onChange={e=>updateAssumption(project.id, ass.id, { status: e.target.value })} className="form-select" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', background: ass.status==='validated'?'var(--status-green-bg)':'var(--status-blue-bg)', color: ass.status==='validated'?'var(--status-green)':'var(--status-blue)', fontWeight: '600' }}>
                            <option value="unvalidated">Unvalidated</option>
                            <option value="validated">Validated</option>
                          </select>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {!isReadOnly && (
                          <button onClick={()=>deleteAssumption(project.id, ass.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {assumptions.length === 0 && (
                    <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No assumptions tracked yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Register Assumption</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Explicitly track assumptions that guide project planning.</p>
              {isReadOnly ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You do not have permission to register assumptions.</p>
              ) : (
                <form onSubmit={handleAssSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>Assumption Statement</label>
                    <input type="text" value={assTitle} onChange={e=>setAssTitle(e.target.value)} placeholder="e.g. Server response is <150ms" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Description & impact if false</label>
                    <textarea value={assDesc} onChange={e=>setAssDesc(e.target.value)} placeholder="Describe impact if this assumption is falsified..." className="form-textarea" style={{ minHeight: '50px' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Category</label>
                      <select value={assCategory} onChange={e=>setAssCategory(e.target.value)} className="form-select">
                        <option value="Technical">Technical</option>
                        <option value="Resource">Resource</option>
                        <option value="Financial">Financial</option>
                        <option value="Schedule">Schedule</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Owner</label>
                      <input type="text" value={assOwner} onChange={e=>setAssOwner(e.target.value)} placeholder="Owner name" className="form-input" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Expected Validation Date</label>
                    <input type="date" value={assDate} onChange={e=>setAssDate(e.target.value)} className="form-input" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Validated By</label>
                      <input type="text" value={assValBy} onChange={e=>setAssValBy(e.target.value)} placeholder="Verifier name" className="form-input" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Verification Notes</label>
                      <input type="text" value={assValNotes} onChange={e=>setAssValNotes(e.target.value)} placeholder="Outcome comments" className="form-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Log Assumption</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ==================== ISSUES TAB ==================== */}
        {activeSubTab === 'issues' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            {/* Table */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Project Escalated Issues</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th>Ref</th>
                    <th>Issue Detail</th>
                    <th>Severity</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Resolution Log</th>
                    {!isReadOnly && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {issues.map((iss, idx) => (
                    <tr key={iss.id} style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: iss.id === highlightedItemId ? 'rgba(254, 240, 138, 0.4)' : 'transparent', transition: 'background-color 0.5s ease' }}>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>I{idx + 1}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: '500' }}>{iss.title}</div>
                        {iss.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{iss.description}</div>}
                        {iss.resolution && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>Resolution Plan: {iss.resolution}</div>}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {(() => {
                          const safeSeverity = iss.severity || iss.priority || 'medium';
                          return (
                            <span className="badge" style={{ fontSize: '0.7rem', color: safeSeverity==='high'?'var(--status-red)':safeSeverity==='medium'?'var(--status-amber)':'var(--status-blue)', backgroundColor: safeSeverity==='high'?'var(--status-red-bg)':safeSeverity==='medium'?'var(--status-amber-bg)':'var(--status-blue-bg)', border: 'none', padding: '3px 8px' }}>
                              {safeSeverity.toUpperCase()}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{iss.owner}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {isReadOnly ? (
                          <span style={{ fontSize: '0.75rem' }}>{iss.status}</span>
                        ) : (
                          <select value={iss.status || 'open'} onChange={e=>updateIssue(project.id, iss.id, { status: e.target.value })} className="form-select" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', background: iss.status==='resolved'?'var(--status-green-bg)':'var(--status-red-bg)', color: iss.status==='resolved'?'var(--status-green)':'var(--status-red)', fontWeight: '600' }}>
                            <option value="open">Open</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>
                        {iss.status === 'resolved' ? (
                          <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div><strong>Date:</strong> {iss.resolvedDate || 'N/A'}</div>
                            <div><strong>Cat:</strong> {iss.closureCategory || 'Fixed'}</div>
                            <div><strong>Notes:</strong> {iss.resolutionNotes || 'N/A'}</div>
                          </div>
                        ) : !isReadOnly ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input 
                              type="text" 
                              placeholder="Resolution notes..." 
                              value={iss.resolutionNotes || ''} 
                              onChange={e => updateIssue(project.id, iss.id, { resolutionNotes: e.target.value })}
                              className="form-input"
                              style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <select 
                                value={iss.closureCategory || 'Fixed'} 
                                onChange={e => updateIssue(project.id, iss.id, { closureCategory: e.target.value })}
                                className="form-select"
                                style={{ padding: '2px 4px', fontSize: '0.7rem' }}
                              >
                                <option value="Fixed">Fixed</option>
                                <option value="Workaround">Workaround</option>
                                <option value="No Action">No Action</option>
                              </select>
                              <button 
                                onClick={() => updateIssue(project.id, iss.id, { status: 'resolved', resolvedDate: new Date().toISOString().split('T')[0] })}
                                className="btn btn-primary"
                                style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {!isReadOnly && (
                          <button onClick={()=>deleteIssue(project.id, iss.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {issues.length === 0 && (
                    <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No open issues registered. Project path is clear!</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Log Project Issue</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Escalate active hurdles to drive prompt resolution.</p>
              {isReadOnly ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You do not have permission to log issues.</p>
              ) : (
                <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>Issue Title</label>
                    <input type="text" value={issTitle} onChange={e=>setIssTitle(e.target.value)} placeholder="e.g. Figma licenses expired" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Issue Description</label>
                    <textarea value={issDesc} onChange={e=>setIssDesc(e.target.value)} placeholder="Provide detailed hurdle context..." className="form-textarea" style={{ minHeight: '50px' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Severity</label>
                      <select value={issSeverity} onChange={e=>setIssSeverity(e.target.value)} className="form-select">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Owner</label>
                      <input type="text" value={issOwner} onChange={e=>setIssOwner(e.target.value)} placeholder="Owner name" className="form-input" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Initial Resolution Plan</label>
                    <input type="text" value={issResPlan} onChange={e=>setIssResPlan(e.target.value)} placeholder="Mitigation plan statement..." className="form-input" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Log Active Issue</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ==================== DEPENDENCIES TAB ==================== */}
        {activeSubTab === 'dependencies' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            {/* Table */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Cross‑functional Dependencies</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Dependency Block</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Type</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Impact</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Expected Delivery</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Owner</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Status & Latency</th>
                    {!isReadOnly && <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px', width: '50px' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {dependencies.map((dep) => {
                    const isLate = dep.expectedDeliveryDate && project.dueDate && new Date(dep.expectedDeliveryDate) > new Date(project.dueDate);
                    const daysLate = isLate ? Math.ceil((new Date(dep.expectedDeliveryDate) - new Date(project.dueDate)) / (24 * 60 * 60 * 1000)) : 0;

                    return (
                      <tr key={dep.id} style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: dep.id === highlightedItemId ? 'rgba(254, 240, 138, 0.4)' : 'transparent', transition: 'background-color 0.5s ease' }}>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', fontWeight: '500' }}>
                          <div>{dep.title}</div>
                          {dep.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{dep.description}</div>}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', textTransform: 'capitalize' }}>{dep.type}</td>
                        <td style={{ padding: '12px 8px' }}>
                          {(() => {
                            const safeImpact = dep.impact || 'medium';
                            return (
                              <span className="badge" style={{ fontSize: '0.7rem', color: safeImpact==='high'?'var(--status-red)':safeImpact==='medium'?'var(--status-amber)':'var(--status-blue)', backgroundColor: safeImpact==='high'?'var(--status-red-bg)':safeImpact==='medium'?'var(--status-amber-bg)':'var(--status-blue-bg)', border: 'none', padding: '3px 8px' }}>
                                {safeImpact.toUpperCase()}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {isReadOnly ? (
                            <span style={{ fontSize: '0.85rem' }}>{dep.expectedDeliveryDate || 'N/A'}</span>
                          ) : (
                            <input 
                              type="date" 
                              value={dep.expectedDeliveryDate || ''} 
                              onChange={e=>updateDependency(project.id, dep.id, { expectedDeliveryDate: e.target.value })}
                              className="form-input"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{dep.owner || 'N/A'}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {isReadOnly ? (
                              <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{dep.status || 'Pending'}</span>
                            ) : (
                              <select value={dep.status || 'pending'} onChange={e=>updateDependency(project.id, dep.id, { status: e.target.value })} className="form-select" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', background: dep.status==='blocked'?'var(--status-red-bg)':dep.status==='delayed'?'var(--status-amber-bg)':'var(--status-green-bg)', color: dep.status==='blocked'?'var(--status-red)':dep.status==='delayed'?'var(--status-amber)':'var(--status-green)', fontWeight: '600' }}>
                                <option value="pending">Pending</option>
                                <option value="on-track">On Track</option>
                                <option value="delayed">Delayed</option>
                                <option value="blocked">Blocked</option>
                              </select>
                            )}
                            
                            {isLate && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--status-red)', fontWeight: '600', background: 'var(--status-red-bg)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }} title={`Expected delivery date surpasses project due date (${project.dueDate})`}>
                                ⚠️ Latency Alert: +{daysLate}d
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {!isReadOnly && (
                            <button onClick={()=>deleteDependency(project.id, dep.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {dependencies.length === 0 && (
                    <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No cross dependencies logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Log Dependency</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Define external milestones or internal team handoffs.</p>
              {isReadOnly ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You do not have permission to log dependencies.</p>
              ) : (
                <form onSubmit={handleDepSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>Dependency Deliverable</label>
                    <input type="text" value={depTitle} onChange={e=>setDepTitle(e.target.value)} placeholder="e.g. Legal approval of client NDA" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Description & Handoff Criteria</label>
                    <textarea value={depDesc} onChange={e=>setDepDesc(e.target.value)} placeholder="Describe criteria or blocking tasks..." className="form-textarea" style={{ minHeight: '50px' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Type</label>
                      <select value={depType} onChange={e=>setDepType(e.target.value)} className="form-select">
                        <option value="internal">Internal Team</option>
                        <option value="external">External Vendor</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Impact Severity</label>
                      <select value={depImpact} onChange={e=>setDepImpact(e.target.value)} className="form-select">
                        <option value="low">Low Impact</option>
                        <option value="medium">Medium Impact</option>
                        <option value="high">High / Critical</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Expected Handoff Date</label>
                      <input type="date" value={depExpectedDate} onChange={e=>setDepExpectedDate(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Owner / Contact</label>
                      <input type="text" value={depOwner} onChange={e=>setDepOwner(e.target.value)} placeholder="e.g. John Doe" className="form-input" required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Log Dependency</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ==================== ACTION ITEMS TAB ==================== */}
        {activeSubTab === 'actionItems' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            {/* Table */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Action Items & Reminders</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ width: '40px' }}>Done</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Action Item</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Assignee</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Due Date</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Status</th>
                    {!isReadOnly && <th style={{ width: '50px' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((act) => (
                    <tr key={act.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <input
                          type="checkbox"
                          checked={act.status === 'completed'}
                          disabled={isReadOnly}
                          onChange={(e) => updateActionItem(project.id, act.id, { status: e.target.checked ? 'completed' : 'pending' })}
                          style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem', fontWeight: '500', textDecoration: act.status === 'completed' ? 'line-through' : 'none', color: act.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {act.title}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{getResourceName(act.assigneeId)}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{act.dueDate || 'Unscheduled'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`badge-pill badge-${act.status === 'completed' ? 'green' : 'neutral'}`} style={{ fontSize: '0.7rem' }}>
                          {act.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {!isReadOnly && (
                          <button onClick={()=>deleteActionItem(project.id, act.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {actionItems.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No action items logged. Project checklist is empty!</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Log Action Item</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Assign short-term actions or tasks to resources.</p>
              {isReadOnly ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You do not have permission to log action items.</p>
              ) : (
                <form onSubmit={handleActSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>Action Item Title</label>
                    <input type="text" value={actTitle} onChange={e=>setActTitle(e.target.value)} placeholder="e.g. Schedule review meeting" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Assignee</label>
                    <select value={actAssigneeId} onChange={e=>setActAssigneeId(e.target.value)} className="form-select">
                      <option value="">-- Choose Assignee --</option>
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" value={actDueDate} onChange={e=>setActDueDate(e.target.value)} className="form-input" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Log Action Item</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ==================== DECISIONS TAB ==================== */}
        {activeSubTab === 'decisions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            {/* Table/List */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Project Decision Log</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Decision</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Deciders</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Date</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Options Considered</th>
                    <th style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '12px 8px' }}>Resolution/Notes</th>
                    {!isReadOnly && <th style={{ width: '50px' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((dec, idx) => (
                    <tr key={dec.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem', fontWeight: '600' }}>
                        <div>{dec.title}</div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{dec.deciders}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{dec.dateDecided}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dec.optionsConsidered || 'N/A'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{dec.notes}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {!isReadOnly && (
                          <button onClick={()=>deleteDecision(project.id, dec.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {decisions.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No decisions registered for this project yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Log Formal Decision</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Maintain a record of architectural or strategic decisions.</p>
              {isReadOnly ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You do not have permission to log decisions.</p>
              ) : (
                <form onSubmit={handleDecSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>Decision Made</label>
                    <input type="text" value={decTitle} onChange={e=>setDecTitle(e.target.value)} placeholder="e.g. Migrate local state to context" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Key Deciders</label>
                    <input type="text" value={decDeciders} onChange={e=>setDecDeciders(e.target.value)} placeholder="e.g. Sanjay K, Alice C" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Date Decided</label>
                    <input type="date" value={decDate} onChange={e=>setDecDate(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Options Considered</label>
                    <input type="text" value={decOptions} onChange={e=>setDecOptions(e.target.value)} placeholder="e.g. Redux vs Context vs Zustand" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Resolution Notes / Rationale</label>
                    <textarea value={decNotes} onChange={e=>setDecNotes(e.target.value)} placeholder="Explain why this decision was made..." className="form-textarea" style={{ minHeight: '50px' }} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Log Decision</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaidLogView;
