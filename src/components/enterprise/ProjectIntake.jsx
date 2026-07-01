import React, { useState } from 'react';

const ProjectIntake = ({ 
  intakeRequests = [], 
  addIntakeRequest, 
  approveIntakeRequest, 
  declineIntakeRequest 
}) => {
  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [proposedBy, setProposedBy] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState('');
  
  // Scorecard Sliders (1-10)
  const [strategicAlignment, setStrategicAlignment] = useState(5);
  const [financialValue, setFinancialValue] = useState(5);
  const [techFeasibility, setTechFeasibility] = useState(5);
  const [riskImpact, setRiskImpact] = useState(5);
  const [resourceComplexity, setResourceComplexity] = useState(5);

  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, declined
  
  // Notes dialog states
  const [notesRequestId, setNotesRequestId] = useState(null);
  const [actionType, setActionType] = useState(''); // approve, decline
  const [adminNotesText, setAdminNotesText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description || !proposedBy || !budgetEstimate) return;

    addIntakeRequest({
      name,
      description,
      proposedBy,
      budgetEstimate: Number(budgetEstimate) || 0,
      strategicAlignment: Number(strategicAlignment),
      financialValue: Number(financialValue),
      techFeasibility: Number(techFeasibility),
      riskImpact: Number(riskImpact),
      resourceComplexity: Number(resourceComplexity),
    });

    setName('');
    setDescription('');
    setProposedBy('');
    setBudgetEstimate('');
    setStrategicAlignment(5);
    setFinancialValue(5);
    setTechFeasibility(5);
    setRiskImpact(5);
    setResourceComplexity(5);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleActionClick = (id, type) => {
    setNotesRequestId(id);
    setActionType(type);
    setAdminNotesText('');
  };

  const submitActionWithNotes = () => {
    if (!notesRequestId) return;
    if (actionType === 'approve') {
      approveIntakeRequest(notesRequestId, adminNotesText);
    } else {
      declineIntakeRequest(notesRequestId, adminNotesText);
    }
    setNotesRequestId(null);
    setActionType('');
    setAdminNotesText('');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const filteredRequests = intakeRequests.filter(r => r.status === activeTab);

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Success Notification */}
      {showSuccess && (
        <div style={{ padding: '12px 20px', backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)', border: '1px solid var(--status-green-border)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '12px' }} className="animate-scale">
          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          PPM scorecard submission successful! Logged in administrative backlog.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '32px' }}>
        
        {/* Left Side: 5-Factor Scorecard Submit Form */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '6px' }}>Submit Project Proposal</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
            Enter project feasibility factors to calculate the balanced PPM score. Max score is 50.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label>Project Title</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Employee Portal Redesign" 
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Proposed By</label>
                <input 
                  type="text" 
                  value={proposedBy} 
                  onChange={(e) => setProposedBy(e.target.value)} 
                  placeholder="e.g. Marcus Vance" 
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Est. Budget ($)</label>
                <input 
                  type="number" 
                  value={budgetEstimate} 
                  onChange={(e) => setBudgetEstimate(e.target.value)} 
                  placeholder="Budget" 
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Business Goals & Justification</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Detail key business goals, targets, and expected outcomes..." 
                className="form-textarea"
                style={{ minHeight: '60px' }}
                required
              ></textarea>
            </div>

            {/* Scorecard Matrix Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>Scorecard Feasibility Inputs</h4>
              
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Strategic Alignment</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{strategicAlignment}/10</span>
                </label>
                <input type="range" min="1" max="10" value={strategicAlignment} onChange={e=>setStrategicAlignment(e.target.value)} style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Financial Value / ROI</span>
                  <span style={{ color: 'var(--status-green)', fontWeight: '600' }}>{financialValue}/10</span>
                </label>
                <input type="range" min="1" max="10" value={financialValue} onChange={e=>setFinancialValue(e.target.value)} style={{ accentColor: 'var(--status-green)', cursor: 'pointer' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Technology Feasibility</span>
                  <span style={{ color: 'var(--status-blue)', fontWeight: '600' }}>{techFeasibility}/10</span>
                </label>
                <input type="range" min="1" max="10" value={techFeasibility} onChange={e=>setTechFeasibility(e.target.value)} style={{ accentColor: 'var(--status-blue)', cursor: 'pointer' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Risk Impact (lower is better)</span>
                  <span style={{ color: 'var(--status-red)', fontWeight: '600' }}>{riskImpact}/10</span>
                </label>
                <input type="range" min="1" max="10" value={riskImpact} onChange={e=>setRiskImpact(e.target.value)} style={{ accentColor: 'var(--status-red)', cursor: 'pointer' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Resource Complexity (lower is better)</span>
                  <span style={{ color: 'var(--status-amber)', fontWeight: '600' }}>{resourceComplexity}/10</span>
                </label>
                <input type="range" min="1" max="10" value={resourceComplexity} onChange={e=>setResourceComplexity(e.target.value)} style={{ accentColor: 'var(--status-amber)', cursor: 'pointer' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: '6px' }}>
              Submit Project Scorecard
            </button>
          </form>
        </div>

        {/* Right Side: Tabbed Intake Queue Logs */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', maxHeight: '720px', overflowY: 'auto' }}>
          
          {/* Sub-tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '14px', marginBottom: '20px', paddingBottom: '8px' }}>
            {[
              { id: 'pending', label: 'Pending Review', count: intakeRequests.filter(r=>r.status==='pending').length, color: 'var(--status-amber)' },
              { id: 'approved', label: 'Approved Log', count: intakeRequests.filter(r=>r.status==='approved').length, color: 'var(--status-green)' },
              { id: 'declined', label: 'Declined Log', count: intakeRequests.filter(r=>r.status==='declined').length, color: 'var(--status-red)' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setNotesRequestId(null); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', position: 'relative', padding: '4px 8px',
                  color: activeTab === tab.id ? tab.color : 'var(--text-secondary)'
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ fontSize: '0.65rem', marginLeft: '6px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '10px', color: 'var(--text-secondary)' }}>{tab.count}</span>
                )}
                {activeTab === tab.id && (
                  <div style={{ position: 'absolute', bottom: '-9px', left: 0, right: 0, height: '2px', backgroundColor: tab.color }}></div>
                )}
              </button>
            ))}
          </div>

          {/* Proposals List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRequests.map((request) => {
              // PPM score color code
              let scoreColor = 'var(--status-blue)';
              if (request.score >= 38) scoreColor = 'var(--status-green)';
              else if (request.score >= 26) scoreColor = 'var(--status-amber)';
              else scoreColor = 'var(--status-red)';

              return (
                <div key={request.id} style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Proposal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{request.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submitted by: {request.proposedBy}</span>
                    </div>
                    <span className="badge" style={{ 
                      fontSize: '0.7rem', 
                      backgroundColor: request.status === 'approved' ? 'var(--status-green-bg)' : request.status === 'declined' ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
                      color: request.status === 'approved' ? 'var(--status-green)' : request.status === 'declined' ? 'var(--status-red)' : 'var(--status-amber)'
                    }}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{request.description}</p>

                  {/* Balanced Scorecard Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', padding: '8px 4px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Align</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{request.strategicAlignment || 5}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ROI</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{request.financialValue || 5}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Feas</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{request.techFeasibility || 5}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--status-red)' }}>{request.riskImpact || 5}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Comp</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--status-amber)' }}>{request.resourceComplexity || 5}</span>
                    </div>
                  </div>

                  {/* Total Balanced Score and Budget */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Estimated Budget: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(request.budgetEstimate)}</strong>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      PPM Score: <strong style={{ color: scoreColor, fontSize: '0.9rem' }}>{request.score}/50</strong>
                    </span>
                  </div>

                  {/* Decision/Action Notes for Approved/Declined */}
                  {request.adminNotes && (
                    <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--text-muted)', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Admin Decision Note:</span>
                      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{request.adminNotes}"</p>
                    </div>
                  )}

                  {/* Inline Decision notes submission field */}
                  {notesRequestId === request.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)', padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '600', color: actionType === 'approve' ? 'var(--status-green)' : 'var(--status-red)' }}>
                        Add review notes for {actionType === 'approve' ? 'Approval' : 'Decline'}:
                      </label>
                      <textarea 
                        value={adminNotesText} 
                        onChange={(e)=>setAdminNotesText(e.target.value)} 
                        placeholder="e.g. Budget and alignment matches strategic plan. Spinning up workspace..." 
                        className="form-textarea"
                        style={{ fontSize: '0.75rem', minHeight: '50px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setNotesRequestId(null)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Cancel</button>
                        <button onClick={submitActionWithNotes} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem', backgroundColor: actionType === 'approve' ? 'var(--status-green)' : 'var(--status-red)' }}>Submit decision</button>
                      </div>
                    </div>
                  ) : (
                    /* Action Triggers for Pending items */
                    request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button 
                          onClick={() => handleActionClick(request.id, 'approve')} 
                          className="btn btn-primary"
                          style={{ flexGrow: 1.5, fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px', justifyContent: 'center' }}
                        >
                          Approve & Spin-up
                        </button>
                        <button 
                          onClick={() => handleActionClick(request.id, 'decline')} 
                          className="btn btn-secondary"
                          style={{ flexGrow: 1, fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px', justifyContent: 'center', borderColor: 'var(--status-red-border)', color: 'var(--status-red)' }}
                        >
                          Decline
                        </button>
                      </div>
                    )
                  )}

                </div>
              );
            })}
            {filteredRequests.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0', border: '1.5px dashed var(--border-subtle)', borderRadius: '8px' }}>
                No requests found in this archive.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectIntake;
