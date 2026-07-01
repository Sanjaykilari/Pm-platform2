import React, { useMemo, useState } from 'react';

const PropertyField = ({ label, fieldKey, type = 'text', value, badge, badgeColor, badgeBg, block, options = [], isEditing, editForm, setEditForm, defaultHealthBg, defaultHealthColor }) => {
  const isEditMode = isEditing && fieldKey;
  const currentVal = isEditMode ? editForm[fieldKey] : value;
  
  return (
    <div style={{ display: 'flex', flexDirection: block ? 'column' : 'row', justifyContent: block ? 'flex-start' : 'space-between', alignItems: block ? 'flex-start' : 'center', gap: block ? '4px' : '12px', borderBottom: block ? 'none' : '1px dashed var(--border-subtle)', paddingBottom: block ? '0' : '8px', minHeight: '32px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{label}</span>
      
      {isEditMode ? (
        type === 'select' ? (
          <select
            value={currentVal || ''}
            onChange={(e) => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
            className="bg-muted text-sm border border-border rounded px-2 py-1 w-40 text-right"
          >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : type === 'number' ? (
          <input 
            type="number"
            value={currentVal || ''}
            onChange={(e) => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
            className="bg-muted text-sm border border-border rounded px-2 py-1 w-40 text-right"
          />
        ) : type === 'date' ? (
          <input 
            type="date"
            value={currentVal || ''}
            onChange={(e) => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
            className="bg-muted text-sm border border-border rounded px-2 py-1 w-40 text-right"
          />
        ) : type === 'textarea' ? (
          <textarea 
            value={currentVal || ''}
            onChange={(e) => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
            className="bg-muted text-sm border border-border rounded px-2 py-1 w-full"
            rows={3}
          />
        ) : (
          <input 
            type="text"
            value={currentVal || ''}
            onChange={(e) => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
            className="bg-muted text-sm border border-border rounded px-2 py-1 w-40 text-right"
          />
        )
      ) : badge ? (
        <span className="badge" style={{ backgroundColor: badgeBg || defaultHealthBg, color: badgeColor || defaultHealthColor, fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', border: `1px solid ${badgeColor || defaultHealthColor}` }}>
          {value}
        </span>
      ) : (
        <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-primary)', textAlign: block ? 'left' : 'right', lineHeight: block ? '1.4' : '1' }}>
          {value || '—'}
        </span>
      )}
    </div>
  );
};

const PropertySection = ({ title, children, icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', borderBottom: '2px solid var(--bg-tertiary)', paddingBottom: '8px' }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
    </div>
    {children}
  </div>
);

const ProjectSummaryView = ({ 
  type = 'project',
  item, 
  projects = [],
  programs = [],
  resources = [], 
  updateProjectDetails,
  calculateOpex, 
  calculateProjectCost 
}) => {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(item);

  const handleSave = () => {
    updateProjectDetails(item.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(item);
    setIsEditing(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unscheduled';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ------------------ PROJECT VIEW (DEFAULT) ------------------
  const tasks = item.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const risks = item.risks || [];
  const issues = item.issues || [];
  const requirements = item.requirements || [];
  const targets = item.targets || [];
  const okrs = targets.filter(t => t.type === 'okr');

  const capexBudget = Number(item.capexBudget) || 0;
  const opexBudget = Number(item.opexBudget) || 0;
  const totalBudget = capexBudget + opexBudget;
  const currentCost = calculateProjectCost(item);
  const costVariance = totalBudget - currentCost;
  const burnPct = totalBudget > 0 ? Math.round((currentCost / totalBudget) * 100) : 0;
  const earnedValue = totalBudget * (progress / 100);
  const cpi = currentCost > 0 ? earnedValue / currentCost : 1;

  const reqStats = useMemo(() => {
    const total = requirements.length;
    if (total === 0) return { total: 0, completed: 0, inProgress: 0, draft: 0 };
    return {
      total,
      completed: requirements.filter(r => ['implemented', 'verified'].includes(r.status)).length,
      inProgress: requirements.filter(r => ['under-review', 'approved', 'in-development'].includes(r.status)).length,
      draft: requirements.filter(r => r.status === 'draft').length,
    };
  }, [requirements]);

  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const milestones = [...tasks]
    .filter(t => t.priority === 'high' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  let healthColor = 'var(--status-green)';
  let healthBg = 'var(--status-green-bg)';
  if (item.status === 'warning') {
    healthColor = 'var(--status-amber)';
    healthBg = 'var(--status-amber-bg)';
  } else if (item.status === 'risk') {
    healthColor = 'var(--status-red)';
    healthBg = 'var(--status-red-bg)';
  }

  const riskGrid = {
    high_high: risks.filter(r => r.probability === 'high' && r.impact === 'high').length,
    high_med: risks.filter(r => r.probability === 'high' && r.impact === 'medium').length,
    high_low: risks.filter(r => r.probability === 'high' && r.impact === 'low').length,
    med_high: risks.filter(r => r.probability === 'medium' && r.impact === 'high').length,
    med_med: risks.filter(r => r.probability === 'medium' && r.impact === 'medium').length,
    med_low: risks.filter(r => r.probability === 'medium' && r.impact === 'low').length,
    low_high: risks.filter(r => r.probability === 'low' && r.impact === 'high').length,
    low_med: risks.filter(r => r.probability === 'low' && r.impact === 'medium').length,
    low_low: risks.filter(r => r.probability === 'low' && r.impact === 'low').length,
  };

  if (type !== 'project') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade">
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h2>{item.name}</h2>
          <p>Portfolio/Program dashboard templates coming soon. Please select a project.</p>
        </div>
      </div>
    );
  }


  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '100%', alignItems: 'stretch' }} className="animate-fade">
      
      <div className="hide-scrollbar" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderTop: `4px solid ${healthColor}`, minHeight: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg style={{ width: '22px', height: '22px', color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Project Details</h3>
            </div>
            <div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCancel} className="text-xs px-3 py-1 rounded bg-muted hover:bg-muted/80">Cancel</button>
                  <button onClick={handleSave} className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80">Save</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="text-xs px-3 py-1 rounded bg-secondary hover:bg-secondary/80">Edit Details</button>
              )}
            </div>
          </div>

          <PropertySection title="Delivery & General" icon="📦">
            <PropertyField label="Project Name" fieldKey="name" value={item.name}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Project ID" value={item.id}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Status" fieldKey="status" type="select" options={[{label:'On Track', value:'on-track'},{label:'Warning', value:'warning'},{label:'Risk', value:'risk'}]} value={item.status} badge={!isEditing}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Priority" fieldKey="priority" type="select" options={[{label:'Low', value:'Low'},{label:'Medium', value:'Medium'},{label:'High', value:'High'}]} value={item.priority || 'Medium'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Start Date" fieldKey="startDate" type="date" value={formatDate(item.startDate)}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="End Date" fieldKey="endDate" type="date" value={formatDate(item.endDate)}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Description" fieldKey="description" type="textarea" value={item.description} block={true}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
          </PropertySection>

          <PropertySection title="Stakeholders" icon="👥">
            <PropertyField label="Owner / Lead" fieldKey="owner" value={item.owner || 'Unassigned'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Executive Sponsor" fieldKey="sponsor" value={item.sponsor || 'Not Assigned'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Product Manager" fieldKey="productManager" value={item.productManager || 'Not Assigned'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Business Unit" fieldKey="businessUnit" value={item.businessUnit || 'Core Platform'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
          </PropertySection>

          <PropertySection title="Strategic Alignment" icon="🎯">
            <PropertyField label="Primary Objective" value={okrs[0]?.title || 'General Operations'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Business Value Score" fieldKey="businessValue" type="select" options={[{label:'High',value:'High'},{label:'Medium',value:'Medium'},{label:'Low',value:'Low'}]} value={item.businessValue || 'High'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Target ROI" fieldKey="targetRoi" value={item.targetRoi || '18%'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Market Segment" fieldKey="marketSegment" value={item.marketSegment || 'Enterprise'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
          </PropertySection>

          <PropertySection title="Execution & Financials" icon="💰">
            <PropertyField label="CAPEX Budget" fieldKey="capexBudget" type="number" value={formatCurrency(capexBudget)}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="OPEX Budget" fieldKey="opexBudget" type="number" value={formatCurrency(opexBudget)}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Total Budget" value={formatCurrency(totalBudget)}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Contingency Reserve" value={formatCurrency(totalBudget * 0.1)}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
          </PropertySection>

          <PropertySection title="Tech Debt & Health" icon="🛠️">
            <PropertyField label="Tech Debt Level" fieldKey="techDebtLevel" type="select" options={[{label:'Low',value:'Low'},{label:'Medium',value:'Medium'},{label:'High',value:'High'}]} value={item.techDebtLevel || 'Low'} badge={!isEditing} badgeColor="var(--status-green)" badgeBg="var(--status-green-bg)"  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Security Compliance" fieldKey="securityCompliance" value={item.securityCompliance || '100% Verified'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Architecture Review" fieldKey="architectureReview" value={item.architectureReview || 'Approved'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
            <PropertyField label="Last Security Audit" fieldKey="lastAuditDate" type="date" value={item.lastAuditDate || 'Oct 2023'}  isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} defaultHealthBg={healthBg} defaultHealthColor={healthColor} />
          </PropertySection>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '10px', justifyContent: 'center', gridColumn: '1 / -1' }}>📄 Export Full PDF Report</button>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '10px', justifyContent: 'center' }}>✉️ Send Status</button>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '10px', justifyContent: 'center' }}>📅 Schedule Review</button>
          </div>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '4px' }}>
        
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Executive Summary</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {issues.length > 0 ? (
                <span style={{ color: 'var(--status-red)', fontWeight: '600' }}>⚠ {issues.length} critical issues require your attention.</span>
              ) : (
                <span>All critical paths are currently unblocked.</span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Overall Progress</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{progress}%</span>
             </div>
             <div style={{ width: '60px', height: '60px' }}>
               <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-primary)" strokeWidth="4" strokeDasharray={`${progress}, 100`} />
               </svg>
             </div>
          </div>
        </div>

        {milestones.length > 0 && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={sectionTitleStyle}>Milestone Timeline</h3>
            <div style={{ position: 'relative', marginTop: '30px', marginBottom: '10px' }}>
              <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', backgroundColor: 'var(--bg-tertiary)', transform: 'translateY(-50%)', borderRadius: '2px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {milestones.map((m, i) => {
                  const isDone = m.status === 'completed';
                  const isPast = new Date(m.dueDate) < new Date() && !isDone;
                  const nodeColor = isDone ? 'var(--status-green)' : isPast ? 'var(--status-red)' : 'var(--accent-primary)';
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: nodeColor, border: '3px solid var(--bg-primary)', zIndex: 2, marginBottom: '8px', boxShadow: `0 0 0 2px ${nodeColor}40` }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{m.title}</span>
                      <span style={{ fontSize: '0.65rem', color: isPast ? 'var(--status-red)' : 'var(--text-muted)' }}>{formatDate(m.dueDate)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={sectionTitleStyle}>Budget Health</h3>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(135deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" strokeDasharray="75, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={cpi >= 1 ? 'var(--status-green)' : 'var(--status-red)'} strokeWidth="4" strokeDasharray={`${Math.min(burnPct * 0.75, 75)}, 100`} />
                </svg>
                <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{burnPct}%</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spent</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Actual Spend</span>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: costVariance < 0 ? 'var(--status-red)' : 'var(--text-primary)' }}>{formatCurrency(currentCost)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>CPI (Efficiency)</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: cpi >= 1 ? 'var(--status-green)' : 'var(--status-red)' }}>{cpi.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={sectionTitleStyle}>Strategic OKRs</h3>
            {okrs.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No OKRs defined.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                {okrs.slice(0, 3).map(okr => {
                  const completion = Math.min(Math.round(((parseFloat(okr.actualValue) || 0) / (parseFloat(okr.targetValue) || 1)) * 100), 100);
                  return (
                    <div key={okr.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{okr.title}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{completion}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '6px' }}>
                        <div className="progress-bar-fill" style={{ width: `${completion}%`, backgroundColor: 'var(--accent-primary)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={sectionTitleStyle}>Risk Heatmap</h3>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px', height: '120px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', paddingRight: '4px' }}>
                  <span>High</span><span>Med</span><span>Low</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '2px', width: '120px' }}>
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.high_high > 0 ? '#dc2626' : '#fecaca', color: riskGrid.high_high > 0 ? '#fff' : 'transparent' }}>{riskGrid.high_high}</div>
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.med_high > 0 ? '#ef4444' : '#fee2e2', color: riskGrid.med_high > 0 ? '#fff' : 'transparent' }}>{riskGrid.med_high}</div>
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.low_high > 0 ? '#f59e0b' : '#fef3c7', color: riskGrid.low_high > 0 ? '#fff' : 'transparent' }}>{riskGrid.low_high}</div>
                  
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.high_med > 0 ? '#ef4444' : '#fee2e2', color: riskGrid.high_med > 0 ? '#fff' : 'transparent' }}>{riskGrid.high_med}</div>
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.med_med > 0 ? '#f59e0b' : '#fef3c7', color: riskGrid.med_med > 0 ? '#fff' : 'transparent' }}>{riskGrid.med_med}</div>
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.low_med > 0 ? '#10b981' : '#d1fae5', color: riskGrid.low_med > 0 ? '#fff' : 'transparent' }}>{riskGrid.low_med}</div>
                  
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.high_low > 0 ? '#f59e0b' : '#fef3c7', color: riskGrid.high_low > 0 ? '#fff' : 'transparent' }}>{riskGrid.high_low}</div>
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.med_low > 0 ? '#10b981' : '#d1fae5', color: riskGrid.med_low > 0 ? '#fff' : 'transparent' }}>{riskGrid.med_low}</div>
                  <div style={{ ...heatmapCell, backgroundColor: riskGrid.low_low > 0 ? '#34d399' : '#a7f3d0', color: riskGrid.low_low > 0 ? '#fff' : 'transparent' }}>{riskGrid.low_low}</div>
                </div>
                <div />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
                  <span>Low</span><span>Med</span><span>High</span>
                </div>
                <div />
                <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', gridColumn: '2' }}>Impact</div>
              </div>
              <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '0.6rem', color: 'var(--text-muted)', paddingLeft: '4px', textAlign: 'center' }}>Probability</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={sectionTitleStyle}>Requirements Coverage</h3>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
                  {reqStats.total > 0 && (
                    <>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray={`${(reqStats.completed / reqStats.total) * 100}, 100`} />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${(reqStats.inProgress / reqStats.total) * 100}, 100`} strokeDashoffset={`-${(reqStats.completed / reqStats.total) * 100}`} />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#9ca3af" strokeWidth="4" strokeDasharray={`${(reqStats.draft / reqStats.total) * 100}, 100`} strokeDashoffset={`-${((reqStats.completed + reqStats.inProgress) / reqStats.total) * 100}`} />
                    </>
                  )}
                </svg>
                <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{reqStats.total > 0 ? Math.round((reqStats.completed / reqStats.total) * 100) : 0}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}/> Completed: {reqStats.completed}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}/> In Progress: {reqStats.inProgress}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9ca3af' }}/> Draft: {reqStats.draft}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={sectionTitleStyle}>Execution Velocity</h3>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-primary)', lineHeight: '1' }}>{completedTasks}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tasks Completed</span>
               </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '12px' }}>
               <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1rem', fontWeight: '700', color: 'var(--status-amber)' }}>{tasks.filter(t => t.status === 'in-progress').length}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Doing</span>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{tasks.filter(t => ['todo', 'not-started', 'backlog'].includes(t.status)).length}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>To Do</span>
               </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={sectionTitleStyle}>Upcoming Deadlines</h3>
            {upcomingTasks.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No upcoming tasks.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                {upcomingTasks.map(t => {
                  const days = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const isOverdue = days < 0;
                  return (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)'}` }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{t.assigneeId ? resources.find(r => r.id === t.assigneeId)?.name || 'Unassigned' : 'Unassigned'}</span>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '50px' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: isOverdue ? 'var(--status-red)' : days <= 3 ? 'var(--status-amber)' : 'var(--text-secondary)' }}>
                          {isOverdue ? `Overdue` : `${days} d`}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{formatDate(t.dueDate)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const sectionTitleStyle = { fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' };
const heatmapCell = { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', borderRadius: '4px' };

export default ProjectSummaryView;
