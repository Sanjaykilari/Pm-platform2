import React, { useState, useMemo } from 'react';

function RequirementsView({
  project,
  addRequirement,
  updateRequirement,
  deleteRequirement,
  currentUser
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedReq, setExpandedReq] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMoscow, setFilterMoscow] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [showTraceability, setShowTraceability] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('functional');
  const [type, setType] = useState('user-story');
  const [priority, setPriority] = useState('medium');
  const [moscowPriority, setMoscowPriority] = useState('should-have');
  const [source, setSource] = useState('stakeholder');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  const [assignee, setAssignee] = useState('');
  const [releaseVersion, setReleaseVersion] = useState('');
  const [riskImpact, setRiskImpact] = useState('medium');
  const [verificationMethod, setVerificationMethod] = useState('test');
  const [wbsTaskIds, setWbsTaskIds] = useState([]);

  const isReadOnly = currentUser?.role === 'Portfolio Manager';

  const requirements = project.requirements || [];
  const tasks = project.tasks || [];

  // Stats
  const stats = useMemo(() => {
    const total = requirements.length;
    const byStatus = {
      draft: requirements.filter(r => r.status === 'draft').length,
      'under-review': requirements.filter(r => r.status === 'under-review').length,
      approved: requirements.filter(r => r.status === 'approved').length,
      'in-development': requirements.filter(r => r.status === 'in-development').length,
      implemented: requirements.filter(r => r.status === 'implemented').length,
      verified: requirements.filter(r => r.status === 'verified').length,
    };
    const byMoscow = {
      'must-have': requirements.filter(r => r.moscowPriority === 'must-have').length,
      'should-have': requirements.filter(r => r.moscowPriority === 'should-have').length,
      'could-have': requirements.filter(r => r.moscowPriority === 'could-have').length,
      'wont-have': requirements.filter(r => r.moscowPriority === 'wont-have').length,
    };
    const linked = requirements.filter(r => {
      const ids = r.wbsTaskIds || (r.wbsTaskId ? [r.wbsTaskId] : []);
      return ids.length > 0;
    }).length;
    const verified = byStatus.verified;
    return { total, byStatus, byMoscow, linked, verified };
  }, [requirements]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addRequirement(project.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      priority,
      moscowPriority,
      source,
      acceptanceCriteria: acceptanceCriteria.trim(),
      estimatedEffort: estimatedEffort || null,
      assignee: assignee || null,
      releaseVersion: releaseVersion || null,
      riskImpact,
      verificationMethod,
      wbsTaskIds: wbsTaskIds.length > 0 ? wbsTaskIds : [],
      wbsTaskId: wbsTaskIds[0] || null,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });

    // Reset form
    setTitle(''); setDescription(''); setCategory('functional'); setType('user-story');
    setPriority('medium'); setMoscowPriority('should-have'); setSource('stakeholder');
    setAcceptanceCriteria(''); setEstimatedEffort(''); setAssignee('');
    setReleaseVersion(''); setRiskImpact('medium'); setVerificationMethod('test');
    setWbsTaskIds([]);
    setShowAddForm(false);
  };

  const handleStatusChange = (reqId, newStatus) => {
    updateRequirement(project.id, reqId, { status: newStatus });
  };

  const getTaskName = (taskId) => {
    if (!taskId) return 'Unlinked';
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.title : 'Task Not Found';
  };

  const toggleTaskLink = (taskId) => {
    setWbsTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Filtering
  const filteredRequirements = useMemo(() => {
    let filtered = [...requirements];
    if (filterCategory !== 'all') filtered = filtered.filter(r => r.category === filterCategory);
    if (filterStatus !== 'all') filtered = filtered.filter(r => r.status === filterStatus);
    if (filterMoscow !== 'all') filtered = filtered.filter(r => r.moscowPriority === filterMoscow);

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'title') { aVal = a.title; bVal = b.title; }
      else if (sortField === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        aVal = order[a.priority] || 0; bVal = order[b.priority] || 0;
      } else if (sortField === 'status') { aVal = a.status; bVal = b.status; }
      else { aVal = a.id; bVal = b.id; }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [requirements, filterCategory, filterStatus, filterMoscow, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'var(--text-muted)' },
    { value: 'under-review', label: 'Under Review', color: 'var(--status-blue)' },
    { value: 'approved', label: 'Approved', color: 'var(--accent-primary)' },
    { value: 'in-development', label: 'In Development', color: 'var(--status-amber)' },
    { value: 'implemented', label: 'Implemented', color: 'var(--accent-secondary)' },
    { value: 'verified', label: 'Verified', color: 'var(--status-green)' },
  ];

  const moscowColors = {
    'must-have': { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
    'should-have': { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
    'could-have': { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' },
    'wont-have': { bg: 'rgba(107, 114, 128, 0.12)', color: '#6b7280' },
  };

  const moscowLabels = { 'must-have': 'Must Have', 'should-have': 'Should Have', 'could-have': 'Could Have', 'wont-have': "Won't Have" };

  const coveragePct = stats.total > 0 ? Math.round((stats.linked / stats.total) * 100) : 0;
  const verifiedPct = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  return (
    <div className="requirements-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ===== STATS DASHBOARD ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* Total */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Total Requirements</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.total}</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(107,114,128,0.1)', color: 'var(--text-secondary)' }}>
              {stats.byStatus.draft} Draft
            </span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--status-blue)' }}>
              {stats.byStatus['under-review']} Review
            </span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--status-green)' }}>
              {stats.byStatus.verified} Verified
            </span>
          </div>
        </div>

        {/* MoSCoW Distribution */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>MoSCoW Distribution</span>
          <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
            {stats.total > 0 && (
              <>
                <div style={{ width: `${(stats.byMoscow['must-have'] / stats.total) * 100}%`, backgroundColor: '#ef4444', transition: 'width 0.3s ease' }} />
                <div style={{ width: `${(stats.byMoscow['should-have'] / stats.total) * 100}%`, backgroundColor: '#f59e0b', transition: 'width 0.3s ease' }} />
                <div style={{ width: `${(stats.byMoscow['could-have'] / stats.total) * 100}%`, backgroundColor: '#6366f1', transition: 'width 0.3s ease' }} />
                <div style={{ width: `${(stats.byMoscow['wont-have'] / stats.total) * 100}%`, backgroundColor: '#6b7280', transition: 'width 0.3s ease' }} />
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(stats.byMoscow).map(([key, count]) => (
              <span key={key} style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: moscowColors[key]?.color }} />
                {moscowLabels[key]} ({count})
              </span>
            ))}
          </div>
        </div>

        {/* Traceability Coverage */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Traceability Coverage</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: coveragePct >= 80 ? 'var(--status-green)' : coveragePct >= 50 ? 'var(--status-amber)' : 'var(--status-red)' }}>{coveragePct}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>linked to tasks</span>
          </div>
          <div className="progress-bar" style={{ height: '6px' }}>
            <div className="progress-bar-fill" style={{ width: `${coveragePct}%`, backgroundColor: coveragePct >= 80 ? 'var(--status-green)' : coveragePct >= 50 ? 'var(--status-amber)' : 'var(--status-red)' }} />
          </div>
        </div>

        {/* Verification Rate */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Verification Rate</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: verifiedPct >= 80 ? 'var(--status-green)' : 'var(--accent-primary)' }}>{verifiedPct}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>verified</span>
          </div>
          <div className="progress-bar" style={{ height: '6px' }}>
            <div className="progress-bar-fill" style={{ width: `${verifiedPct}%`, backgroundColor: 'var(--accent-primary)' }} />
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Requirements Pipeline</span>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {statusOptions.map((s, i) => {
              const count = stats.byStatus[s.value] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <React.Fragment key={s.value}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: s.color }}>{count}</span>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: i === 0 ? '3px 0 0 3px' : i === statusOptions.length - 1 ? '0 3px 3px 0' : '0', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(pct, count > 0 ? 15 : 0)}%`, height: '100%', backgroundColor: s.color, transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.1' }}>{s.label}</span>
                  </div>
                  {i < statusOptions.length - 1 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginTop: '-12px' }}>›</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="form-input" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
            <option value="all">All Categories</option>
            <option value="functional">Functional</option>
            <option value="non-functional">Non-Functional</option>
            <option value="technical">Technical</option>
            <option value="business">Business</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-input" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
            <option value="all">All Statuses</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterMoscow} onChange={(e) => setFilterMoscow(e.target.value)} className="form-input" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
            <option value="all">All Priorities (MoSCoW)</option>
            <option value="must-have">Must Have</option>
            <option value="should-have">Should Have</option>
            <option value="could-have">Could Have</option>
            <option value="wont-have">Won't Have</option>
          </select>
          <button onClick={() => setShowTraceability(!showTraceability)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: showTraceability ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            {showTraceability ? '✕ Hide' : '🔗'} Traceability
          </button>
        </div>
        {!isReadOnly && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
            {showAddForm ? '✕ Close Form' : '+ Add Requirement'}
          </button>
        )}
      </div>

      {/* ===== ADD FORM ===== */}
      {showAddForm && !isReadOnly && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <svg style={{ width: '18px', height: '18px', color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>New Requirement Specification</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label style={labelStyle}>Title *</label>
              <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. User authentication via OAuth2" required />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Requirement Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="form-input">
                <option value="user-story">User Story</option>
                <option value="epic">Epic</option>
                <option value="use-case">Use Case</option>
                <option value="functional-spec">Functional Spec</option>
                <option value="non-functional">Non-Functional Spec</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                <option value="functional">Functional</option>
                <option value="non-functional">Non-Functional</option>
                <option value="technical">Technical</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>MoSCoW Priority</label>
              <select value={moscowPriority} onChange={(e) => setMoscowPriority(e.target.value)} className="form-input">
                <option value="must-have">Must Have</option>
                <option value="should-have">Should Have</option>
                <option value="could-have">Could Have</option>
                <option value="wont-have">Won't Have</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Priority Level</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-input">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="form-input">
                <option value="stakeholder">Stakeholder</option>
                <option value="regulatory">Regulatory / Compliance</option>
                <option value="technical">Technical Debt</option>
                <option value="market">Market Research</option>
                <option value="user-feedback">User Feedback</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Estimated Effort (Story Points)</label>
              <input type="number" className="form-input" value={estimatedEffort} onChange={(e) => setEstimatedEffort(e.target.value)} placeholder="e.g. 8" min="0" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Assignee</label>
              <input type="text" className="form-input" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Release Version</label>
              <input type="text" className="form-input" value={releaseVersion} onChange={(e) => setReleaseVersion(e.target.value)} placeholder="e.g. v2.1.0" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Risk Impact (if not delivered)</label>
              <select value={riskImpact} onChange={(e) => setRiskImpact(e.target.value)} className="form-input">
                <option value="critical">Critical — Blocks launch</option>
                <option value="high">High — Major feature gap</option>
                <option value="medium">Medium — Reduced quality</option>
                <option value="low">Low — Minor inconvenience</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Verification Method</label>
              <select value={verificationMethod} onChange={(e) => setVerificationMethod(e.target.value)} className="form-input">
                <option value="test">Test</option>
                <option value="inspection">Inspection</option>
                <option value="analysis">Analysis</option>
                <option value="demonstration">Demonstration</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={labelStyle}>Description</label>
              <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed requirement description..." rows="3" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Acceptance Criteria</label>
              <textarea className="form-input" value={acceptanceCriteria} onChange={(e) => setAcceptanceCriteria(e.target.value)} placeholder="Given... When... Then..." rows="3" style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* WBS Task Linking (multi-select) */}
          {tasks.length > 0 && (
            <div className="form-group">
              <label style={labelStyle}>Link to WBS Tasks (select multiple)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-subtle)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
                {tasks.map(t => (
                  <button key={t.id} type="button" onClick={() => toggleTaskLink(t.id)} style={{
                    padding: '3px 10px', fontSize: '0.7rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', cursor: 'pointer',
                    backgroundColor: wbsTaskIds.includes(t.id) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: wbsTaskIds.includes(t.id) ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}>
                    {wbsTaskIds.includes(t.id) ? '✓ ' : ''}{t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
            Save Requirement
          </button>
        </form>
      )}

      {/* ===== TRACEABILITY MATRIX ===== */}
      {showTraceability && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            🔗 Requirements Traceability Matrix
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Maps each requirement to its linked WBS tasks, showing forward traceability from specification to implementation.
          </p>
          {requirements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No requirements to trace.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                    <th style={{ ...thStyle, width: '80px' }}>REQ ID</th>
                    <th style={{ ...thStyle, minWidth: '180px' }}>Requirement</th>
                    <th style={thStyle}>MoSCoW</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Verification</th>
                    <th style={{ ...thStyle, minWidth: '200px' }}>Linked Tasks</th>
                    <th style={thStyle}>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req, idx) => {
                    const linkedIds = req.wbsTaskIds || (req.wbsTaskId ? [req.wbsTaskId] : []);
                    const isLinked = linkedIds.length > 0;
                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontWeight: '600' }}>REQ-{idx + 1}</span></td>
                        <td style={tdStyle}><span style={{ fontWeight: '600' }}>{req.title}</span></td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: moscowColors[req.moscowPriority]?.bg || 'var(--bg-tertiary)', color: moscowColors[req.moscowPriority]?.color || 'var(--text-secondary)' }}>
                            {moscowLabels[req.moscowPriority] || req.moscowPriority || 'N/A'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: statusOptions.find(s => s.value === req.status) ? `${statusOptions.find(s => s.value === req.status).color}18` : 'var(--bg-tertiary)', color: statusOptions.find(s => s.value === req.status)?.color || 'var(--text-secondary)' }}>
                            {statusOptions.find(s => s.value === req.status)?.label || req.status}
                          </span>
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{req.verificationMethod || 'N/A'}</span></td>
                        <td style={tdStyle}>
                          {isLinked ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {linkedIds.map(id => (
                                <span key={id} style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: '500' }}>
                                  🔗 {getTaskName(id)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--status-red)' }}>⚠ Unlinked</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', backgroundColor: isLinked ? 'var(--status-green)' : 'var(--status-red)' }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== REQUIREMENTS TABLE ===== */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={thStyle} onClick={() => handleSort('id')}><span style={sortableStyle}>ID {sortField === 'id' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span></th>
                <th style={thStyle} onClick={() => handleSort('title')}><span style={sortableStyle}>Title {sortField === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span></th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>MoSCoW</th>
                <th style={thStyle} onClick={() => handleSort('priority')}><span style={sortableStyle}>Priority {sortField === 'priority' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span></th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Effort</th>
                <th style={thStyle}>Linked Tasks</th>
                <th style={thStyle} onClick={() => handleSort('status')}><span style={sortableStyle}>Status {sortField === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span></th>
                {!isReadOnly && <th style={thStyle}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 9 : 10} style={{ padding: '40px 0', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No requirements found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRequirements.map((req, idx) => {
                  const linkedIds = req.wbsTaskIds || (req.wbsTaskId ? [req.wbsTaskId] : []);
                  const isExpanded = expandedReq === req.id;
                  return (
                    <React.Fragment key={req.id}>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', backgroundColor: isExpanded ? 'rgba(99,102,241,0.04)' : 'transparent', transition: 'background-color 0.15s ease' }} onClick={() => setExpandedReq(isExpanded ? null : req.id)}>
                        <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.75rem' }}>REQ-{requirements.indexOf(req) + 1}</span></td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{req.title}</span>
                            {req.assignee && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>👤 {req.assignee}</span>}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {(req.type || 'user-story').replace('-', ' ')}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: moscowColors[req.moscowPriority]?.bg || 'var(--bg-tertiary)', color: moscowColors[req.moscowPriority]?.color || 'var(--text-secondary)' }}>
                            {moscowLabels[req.moscowPriority] || 'N/A'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '600',
                            backgroundColor: req.priority === 'critical' ? 'rgba(220,38,38,0.12)' : req.priority === 'high' ? 'rgba(239,68,68,0.12)' : req.priority === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(107,114,128,0.12)',
                            color: req.priority === 'critical' ? '#dc2626' : req.priority === 'high' ? '#ef4444' : req.priority === 'medium' ? '#f59e0b' : '#6b7280'
                          }}>
                            {req.priority}
                          </span>
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{(req.source || '').replace('-', ' ') || '—'}</span></td>
                        <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{req.estimatedEffort ? `${req.estimatedEffort} SP` : '—'}</span></td>
                        <td style={tdStyle}>
                          {linkedIds.length > 0 ? (
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '500' }}>🔗 {linkedIds.length} task{linkedIds.length > 1 ? 's' : ''}</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--status-red)' }}>Unlinked</span>
                          )}
                        </td>
                        <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                          {isReadOnly ? (
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: statusOptions.find(s => s.value === req.status) ? `${statusOptions.find(s => s.value === req.status).color}18` : 'var(--bg-tertiary)', color: statusOptions.find(s => s.value === req.status)?.color || 'var(--text-secondary)' }}>
                              {statusOptions.find(s => s.value === req.status)?.label || req.status}
                            </span>
                          ) : (
                            <select value={req.status} onChange={(e) => handleStatusChange(req.id, e.target.value)} style={{ padding: '3px 6px', fontSize: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          )}
                        </td>
                        {!isReadOnly && (
                          <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => deleteRequirement(project.id, req.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }} title="Delete requirement">🗑️</button>
                          </td>
                        )}
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr style={{ backgroundColor: 'rgba(99,102,241,0.02)' }}>
                          <td colSpan={isReadOnly ? 9 : 10} style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                              {req.description && (
                                <div>
                                  <span style={{ ...labelStyle, marginBottom: '4px', display: 'block' }}>Description</span>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{req.description}</p>
                                </div>
                              )}
                              {req.acceptanceCriteria && (
                                <div>
                                  <span style={{ ...labelStyle, marginBottom: '4px', display: 'block' }}>Acceptance Criteria</span>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap', fontFamily: 'monospace', backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px' }}>{req.acceptanceCriteria}</p>
                                </div>
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div><span style={metaLabelStyle}>Verification:</span> <span style={metaValueStyle}>{req.verificationMethod || 'N/A'}</span></div>
                                <div><span style={metaLabelStyle}>Risk Impact:</span> <span style={{ ...metaValueStyle, color: req.riskImpact === 'critical' || req.riskImpact === 'high' ? 'var(--status-red)' : 'inherit' }}>{req.riskImpact || 'N/A'}</span></div>
                                <div><span style={metaLabelStyle}>Release:</span> <span style={metaValueStyle}>{req.releaseVersion || 'Unplanned'}</span></div>
                                <div><span style={metaLabelStyle}>Created:</span> <span style={metaValueStyle}>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                              </div>
                              {linkedIds.length > 0 && (
                                <div>
                                  <span style={{ ...labelStyle, marginBottom: '4px', display: 'block' }}>Linked WBS Tasks</span>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {linkedIds.map(id => (
                                      <span key={id} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)', fontWeight: '500' }}>
                                        🔗 {getTaskName(id)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' };
const thStyle = { fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', verticalAlign: 'middle' };
const sortableStyle = { display: 'flex', alignItems: 'center', gap: '3px' };
const metaLabelStyle = { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'capitalize' };
const metaValueStyle = { fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '500', textTransform: 'capitalize' };

export default RequirementsView;
