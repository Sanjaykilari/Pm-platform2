import React, { useState, useMemo } from 'react';

function TargetsView({
  project,
  addTarget,
  updateTarget,
  deleteTarget,
  currentUser
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState(null);
  const [activeSection, setActiveSection] = useState('okr');

  // Form state
  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [actualValue, setActualValue] = useState('');
  const [type, setType] = useState('okr');
  const [status, setStatus] = useState('on-track');
  const [owner, setOwner] = useState('');
  const [cadence, setCadence] = useState('quarterly');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(70);
  const [weightage, setWeightage] = useState(5);
  const [notes, setNotes] = useState('');
  const [keyResults, setKeyResults] = useState([{ title: '', metric: '', target: '', actual: '', weight: 1 }]);

  const isReadOnly = currentUser?.role === 'Portfolio Manager';
  const targets = project.targets || [];

  // Separate targets
  const okrs = targets.filter((t) => t.type === 'okr');
  const financialTargets = targets.filter((t) => t.type === 'financial');
  const customTargets = targets.filter((t) => t.type === 'custom');

  // Stats
  const stats = useMemo(() => {
    const total = targets.length;
    const byStatus = {
      'on-track': targets.filter(t => t.status === 'on-track').length,
      'warning': targets.filter(t => t.status === 'warning').length,
      'risk': targets.filter(t => t.status === 'risk').length,
      'met': targets.filter(t => t.status === 'met').length,
    };
    const avgConfidence = total > 0
      ? Math.round(targets.reduce((sum, t) => sum + (Number(t.confidenceScore) || 70), 0) / total)
      : 0;
    return { total, byStatus, avgConfidence };
  }, [targets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !metric.trim() || !targetValue.trim()) return;

    const validKeyResults = keyResults.filter(kr => kr.title.trim() && kr.target.trim());

    addTarget(project.id, {
      title: title.trim(),
      metric: metric.trim(),
      targetValue: targetValue.trim(),
      actualValue: actualValue.trim() || '0',
      type,
      status,
      owner: owner.trim() || null,
      cadence,
      startDate: startDate || null,
      dueDate: dueDate || null,
      confidenceScore: Number(confidenceScore),
      weightage: Number(weightage),
      notes: notes.trim(),
      keyResults: validKeyResults.length > 0 ? validKeyResults : [],
      lastUpdated: new Date().toISOString(),
    });

    // Reset form
    setTitle(''); setMetric(''); setTargetValue(''); setActualValue('');
    setType('okr'); setStatus('on-track'); setOwner(''); setCadence('quarterly');
    setStartDate(''); setDueDate(''); setConfidenceScore(70); setWeightage(5);
    setNotes(''); setKeyResults([{ title: '', metric: '', target: '', actual: '', weight: 1 }]);
    setShowAddForm(false);
  };

  const handleUpdateField = (targetId, field, value) => {
    updateTarget(project.id, targetId, { [field]: value, lastUpdated: new Date().toISOString() });
  };

  const addKeyResultRow = () => {
    setKeyResults(prev => [...prev, { title: '', metric: '', target: '', actual: '', weight: 1 }]);
  };

  const updateKeyResultRow = (index, field, value) => {
    setKeyResults(prev => prev.map((kr, i) => i === index ? { ...kr, [field]: value } : kr));
  };

  const removeKeyResultRow = (index) => {
    setKeyResults(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate objective completion from key results
  const getObjectiveCompletion = (target) => {
    const krs = target.keyResults || [];
    if (krs.length === 0) {
      const actual = parseFloat(target.actualValue) || 0;
      const goal = parseFloat(target.targetValue) || 1;
      return Math.min(Math.round((actual / goal) * 100), 100);
    }
    const totalWeight = krs.reduce((sum, kr) => sum + (Number(kr.weight) || 1), 0);
    const weightedSum = krs.reduce((sum, kr) => {
      const actual = parseFloat(kr.actual) || 0;
      const goal = parseFloat(kr.target) || 1;
      const pct = Math.min((actual / goal) * 100, 100);
      return sum + (pct * (Number(kr.weight) || 1));
    }, 0);
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  };

  // Time progress
  const getTimeProgress = (target) => {
    if (!target.startDate || !target.dueDate) return null;
    const start = new Date(target.startDate).getTime();
    const end = new Date(target.dueDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const statusColors = {
    'on-track': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'On Track' },
    'warning': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Warning' },
    'risk': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'At Risk' },
    'met': { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', label: 'Met' },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTargetCard = (target) => {
    const completion = getObjectiveCompletion(target);
    const timeProg = getTimeProgress(target);
    const krs = target.keyResults || [];
    const sc = statusColors[target.status] || statusColors['on-track'];
    const isExpanded = expandedObjective === target.id;
    const confidence = Number(target.confidenceScore) || 70;

    return (
      <div key={target.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', transition: 'box-shadow 0.2s ease', cursor: 'pointer' }} onClick={() => setExpandedObjective(isExpanded ? null : target.id)}>
        {/* Card Header */}
        <div style={{ padding: '18px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '700', backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
              {target.cadence && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{target.cadence}</span>}
              {target.owner && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>👤 {target.owner}</span>}
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.3' }}>{target.title}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: '600' }}>Metric:</span> {target.metric}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
            {/* Circular Progress */}
            <div style={{ position: 'relative', width: '52px', height: '52px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '52px', height: '52px', transform: 'rotate(-90deg)' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={sc.color} strokeWidth="3" strokeDasharray={`${completion}, 100`} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
              </svg>
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-primary)' }}>{completion}%</span>
            </div>
          </div>
        </div>

        {/* Values Bar */}
        <div style={{ padding: '0 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Current</span>
            {isReadOnly ? (
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{target.actualValue}</span>
            ) : (
              <input type="text" value={target.actualValue} onChange={(e) => handleUpdateField(target.id, 'actualValue', e.target.value)} onClick={(e) => e.stopPropagation()} style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', background: 'none', border: 'none', borderBottom: '1px dashed var(--border-subtle)', width: '80px', padding: '0' }} />
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Confidence</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: confidence >= 70 ? 'var(--status-green)' : confidence >= 40 ? 'var(--status-amber)' : 'var(--status-red)' }}>{confidence}%</span>
              <span style={{ fontSize: '0.7rem', color: confidence >= 70 ? 'var(--status-green)' : 'var(--status-red)' }}>{confidence >= 70 ? '↑' : '↓'}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Target</span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{target.targetValue}</div>
          </div>
        </div>

        {/* Time Progress */}
        {timeProg !== null && (
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{formatDate(target.startDate)}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '600' }}>{timeProg}% time elapsed</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{formatDate(target.dueDate)}</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${timeProg}%`, height: '100%', backgroundColor: timeProg > completion + 20 ? 'var(--status-red)' : 'var(--accent-secondary)', transition: 'width 0.3s ease' }} />
              <div style={{ position: 'absolute', left: `${completion}%`, top: '-2px', width: '2px', height: '8px', backgroundColor: 'var(--text-primary)', borderRadius: '1px' }} />
            </div>
          </div>
        )}

        {/* Key Results (expandable) */}
        {isExpanded && krs.length > 0 && (
          <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '14px' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '10px' }}>Key Results ({krs.length})</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {krs.map((kr, i) => {
                const krActual = parseFloat(kr.actual) || 0;
                const krGoal = parseFloat(kr.target) || 1;
                const krPct = Math.min(Math.round((krActual / krGoal) * 100), 100);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-primary)' }}>KR{i + 1}: {kr.title}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: krPct >= 100 ? 'var(--status-green)' : 'var(--accent-primary)' }}>{krPct}%</span>
                    </div>
                    {kr.metric && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Metric: {kr.metric}</span>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${krPct}%`, height: '100%', backgroundColor: krPct >= 100 ? 'var(--status-green)' : 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{kr.actual || '0'} / {kr.target}</span>
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Weight: {kr.weight}x</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes (expandable) */}
        {isExpanded && target.notes && (
          <div style={{ padding: '0 20px 14px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Notes</span>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{target.notes}</p>
          </div>
        )}

        {/* Card Footer Actions */}
        {!isReadOnly && (
          <div style={{ padding: '8px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>Health:</label>
              <select value={target.status} onChange={(e) => handleUpdateField(target.id, 'status', e.target.value)} style={{ padding: '3px 6px', fontSize: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <option value="on-track">On Track</option>
                <option value="warning">Warning</option>
                <option value="risk">At Risk</option>
                <option value="met">Met</option>
              </select>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '8px' }}>Confidence:</label>
              <input type="range" min="0" max="100" value={target.confidenceScore || 70} onChange={(e) => handleUpdateField(target.id, 'confidenceScore', Number(e.target.value))} style={{ width: '60px', accentColor: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-primary)', minWidth: '28px' }}>{target.confidenceScore || 70}%</span>
            </div>
            <button onClick={() => deleteTarget(project.id, target.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }} title="Delete target">🗑️</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="targets-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ===== SUMMARY DASHBOARD ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        {/* Total Targets */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Total Targets</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.total}</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{okrs.length} OKRs</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{financialTargets.length} Financial</span>
            {customTargets.length > 0 && <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' }}>{customTargets.length} Custom</span>}
          </div>
        </div>

        {/* Health Donut */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '56px', height: '56px', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3.5" />
              {stats.total > 0 && (
                <>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeDasharray={`${(stats.byStatus['on-track'] / stats.total) * 100}, 100`} />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeWidth="3.5" strokeDasharray={`${(stats.byStatus['met'] / stats.total) * 100}, 100`} strokeDashoffset={`-${(stats.byStatus['on-track'] / stats.total) * 100}`} />
                </>
              )}
            </svg>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.byStatus['met'] + stats.byStatus['on-track']}/{stats.total}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Health</span>
            {Object.entries(stats.byStatus).map(([key, val]) => (
              <span key={key} style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColors[key]?.color }} /> {statusColors[key]?.label}: {val}
              </span>
            ))}
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Avg. Confidence</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: stats.avgConfidence >= 70 ? 'var(--status-green)' : stats.avgConfidence >= 40 ? 'var(--status-amber)' : 'var(--status-red)' }}>{stats.avgConfidence}%</span>
          <div className="progress-bar" style={{ height: '6px' }}>
            <div className="progress-bar-fill" style={{ width: `${stats.avgConfidence}%`, backgroundColor: stats.avgConfidence >= 70 ? 'var(--status-green)' : stats.avgConfidence >= 40 ? 'var(--status-amber)' : 'var(--status-red)' }} />
          </div>
        </div>

        {/* Met Rate */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Targets Met</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{stats.byStatus.met}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {stats.total}</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            {stats.total > 0 ? Math.round((stats.byStatus.met / stats.total) * 100) : 0}% completion rate
          </span>
        </div>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { key: 'okr', label: 'Strategic OKRs', count: okrs.length },
            { key: 'financial', label: 'Financial Thresholds', count: financialTargets.length },
            { key: 'custom', label: 'Custom Targets', count: customTargets.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveSection(tab.key)} style={{
              padding: '6px 14px', fontSize: '0.78rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.15s ease',
              backgroundColor: activeSection === tab.key ? 'var(--accent-primary)' : 'transparent',
              color: activeSection === tab.key ? '#fff' : 'var(--text-secondary)',
            }}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        {!isReadOnly && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
            {showAddForm ? '✕ Close' : '+ Add Target'}
          </button>
        )}
      </div>

      {/* ===== ADD FORM ===== */}
      {showAddForm && !isReadOnly && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <svg style={{ width: '18px', height: '18px', color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            </svg>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>New Target / OKR</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label style={labelStyle}>Objective Title *</label>
              <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Increase platform adoption" required />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Key Metric *</label>
              <input type="text" className="form-input" value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="e.g. Monthly Active Users" required />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Target Value *</label>
              <input type="text" className="form-input" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="e.g. 50,000" required />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Current Value</label>
              <input type="text" className="form-input" value={actualValue} onChange={(e) => setActualValue(e.target.value)} placeholder="e.g. 15,000" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="form-input">
                <option value="okr">Strategic OKR</option>
                <option value="financial">Financial Threshold</option>
                <option value="custom">Custom Target</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Owner</label>
              <input type="text" className="form-input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Cadence</label>
              <select value={cadence} onChange={(e) => setCadence(e.target.value)} className="form-input">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Start Date</label>
              <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Due Date</label>
              <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Confidence Score: {confidenceScore}%</label>
              <input type="range" min="0" max="100" value={confidenceScore} onChange={(e) => setConfidenceScore(e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Weightage (1-10)</label>
              <input type="number" className="form-input" value={weightage} onChange={(e) => setWeightage(e.target.value)} min="1" max="10" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Initial Health</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input">
                <option value="on-track">On Track</option>
                <option value="warning">Warning</option>
                <option value="risk">At Risk</option>
                <option value="met">Met</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Notes</label>
            <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Qualitative progress notes..." rows="2" style={{ resize: 'vertical' }} />
          </div>

          {/* Key Results Builder */}
          {type === 'okr' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Key Results</label>
                <button type="button" onClick={addKeyResultRow} style={{ fontSize: '0.75rem', padding: '4px 10px', border: '1px solid var(--border-subtle)', borderRadius: '6px', background: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: '600' }}>+ Add KR</button>
              </div>
              {keyResults.map((kr, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-primary)', minWidth: '28px' }}>KR{i + 1}</span>
                  <input type="text" placeholder="Key Result title" value={kr.title} onChange={(e) => updateKeyResultRow(i, 'title', e.target.value)} className="form-input" style={{ flex: 2, padding: '6px 10px', fontSize: '0.78rem' }} />
                  <input type="text" placeholder="Metric" value={kr.metric} onChange={(e) => updateKeyResultRow(i, 'metric', e.target.value)} className="form-input" style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }} />
                  <input type="text" placeholder="Target" value={kr.target} onChange={(e) => updateKeyResultRow(i, 'target', e.target.value)} className="form-input" style={{ width: '70px', padding: '6px 10px', fontSize: '0.78rem' }} />
                  <input type="text" placeholder="Actual" value={kr.actual} onChange={(e) => updateKeyResultRow(i, 'actual', e.target.value)} className="form-input" style={{ width: '70px', padding: '6px 10px', fontSize: '0.78rem' }} />
                  <input type="number" placeholder="Wt" value={kr.weight} onChange={(e) => updateKeyResultRow(i, 'weight', e.target.value)} className="form-input" style={{ width: '50px', padding: '6px 10px', fontSize: '0.78rem' }} min="1" />
                  {keyResults.length > 1 && (
                    <button type="button" onClick={() => removeKeyResultRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
            Save Target
          </button>
        </form>
      )}

      {/* ===== TARGET CARDS GRID ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {activeSection === 'okr' && okrs.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: '1 / -1' }}>No Strategic OKRs logged for this project yet.</div>
        )}
        {activeSection === 'financial' && financialTargets.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: '1 / -1' }}>No Financial Targets logged for this project yet.</div>
        )}
        {activeSection === 'custom' && customTargets.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: '1 / -1' }}>No Custom Targets logged for this project yet.</div>
        )}
        {activeSection === 'okr' && okrs.map(t => renderTargetCard(t))}
        {activeSection === 'financial' && financialTargets.map(t => renderTargetCard(t))}
        {activeSection === 'custom' && customTargets.map(t => renderTargetCard(t))}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' };

export default TargetsView;
