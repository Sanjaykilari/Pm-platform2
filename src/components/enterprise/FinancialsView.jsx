import React, { useState, useMemo } from 'react';

const FinancialsView = ({ 
  project, 
  resources, 
  addCapexItem, 
  deleteCapexItem, 
  calculateOpex, 
  calculateProjectCost,
  currentUser
}) => {
  const isProjectManager = currentUser?.role === 'Project Manager';

  const [capexName, setCapexName] = useState('');
  const [capexCategory, setCapexCategory] = useState('Software');
  const [capexCost, setCapexCost] = useState('');
  const [capexVendor, setCapexVendor] = useState('');
  const [capexPo, setCapexPo] = useState('');
  const [capexInvoiceDate, setCapexInvoiceDate] = useState('');
  const [capexPaymentStatus, setCapexPaymentStatus] = useState('pending');
  const [activeFinTab, setActiveFinTab] = useState('overview');

  // ROI fields
  const [expectedRevenue, setExpectedRevenue] = useState('');
  const [paybackMonths, setPaybackMonths] = useState('');

  const capexItems = project.capexItems || [];
  const tasks = project.tasks || [];

  // Budget calculations
  const capexBudget = Number(project.capexBudget) || 0;
  const opexBudget = Number(project.opexBudget) || 0;
  const totalBudget = capexBudget + opexBudget;

  const capexSpent = capexItems.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const opexSpent = calculateOpex(project);
  const totalSpent = capexSpent + opexSpent;

  const variance = totalBudget - totalSpent;
  const isOverBudget = totalSpent > totalBudget;
  const burnPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // EVM Calculations
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const pctComplete = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const earnedValue = totalBudget * pctComplete;
  const plannedValue = totalBudget * 0.6; // assume 60% planned for this point

  const cpi = totalSpent > 0 ? (earnedValue / totalSpent) : 1;
  const spi = plannedValue > 0 ? (earnedValue / plannedValue) : 1;
  const eac = cpi > 0 ? (totalBudget / cpi) : totalBudget;
  const etc = eac - totalSpent;
  const vac = totalBudget - eac;

  // Monthly Burn Rate
  const startDate = project.startDate ? new Date(project.startDate) : null;
  const now = new Date();
  const monthsElapsed = startDate ? Math.max(1, Math.round((now - startDate) / (30 * 24 * 60 * 60 * 1000))) : 1;
  const monthlyBurnRate = totalSpent / monthsElapsed;

  // Resource Labor breakdown
  const laborBreakdown = useMemo(() => {
    const laborMap = {};
    resources.forEach(r => {
      laborMap[r.id] = { name: r.name, role: r.role, rate: r.hourlyRate, hours: 0, cost: 0 };
    });
    tasks.forEach(t => {
      if (t.assigneeId && laborMap[t.assigneeId] && t.status !== 'completed') {
        laborMap[t.assigneeId].hours += (Number(t.allocatedHours) || 0);
      }
    });
    return Object.values(laborMap).filter(l => l.hours > 0);
  }, [resources, tasks]);

  // CAPEX by Category
  const capexByCategory = useMemo(() => {
    const cats = {};
    capexItems.forEach(item => {
      const cat = item.category || 'Other';
      cats[cat] = (cats[cat] || 0) + (Number(item.cost) || 0);
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [capexItems]);

  // Cost by Phase (simulation)
  const costByPhase = useMemo(() => {
    const phases = { 'Initiation': 0, 'Planning': 0, 'Execution': 0, 'Closure': 0 };
    tasks.forEach(t => {
      const cost = (Number(t.allocatedHours) || 0) * 75; // avg rate
      if (t.status === 'completed') phases['Closure'] += cost * 0.2;
      if (['in-progress'].includes(t.status)) phases['Execution'] += cost;
      if (['todo', 'not-started', 'backlog'].includes(t.status)) phases['Planning'] += cost * 0.3;
    });
    phases['Initiation'] = totalSpent * 0.05;
    return Object.entries(phases);
  }, [tasks, totalSpent]);

  // Contingency
  const contingencyBudget = Number(project.contingencyBudget) || totalBudget * 0.1;
  const contingencyUsed = isOverBudget ? Math.abs(variance) : 0;
  const contingencyRemaining = Math.max(0, contingencyBudget - contingencyUsed);

  // ROI Calculations
  const roi = useMemo(() => {
    const rev = Number(expectedRevenue) || 0;
    const payback = Number(paybackMonths) || 0;
    const netBenefit = rev - totalSpent;
    const roiPct = totalSpent > 0 ? Math.round((netBenefit / totalSpent) * 100) : 0;
    const npv = rev > 0 ? Math.round(rev / Math.pow(1.1, payback / 12) - totalSpent) : 0;
    return { rev, payback, netBenefit, roiPct, npv };
  }, [expectedRevenue, paybackMonths, totalSpent]);

  const handleAddCapex = (e) => {
    e.preventDefault();
    if (isProjectManager) return;
    if (!capexName || !capexCost) return;

    addCapexItem(project.id, {
      name: capexName,
      category: capexCategory,
      cost: Number(capexCost) || 0,
      vendor: capexVendor || null,
      poNumber: capexPo || null,
      invoiceDate: capexInvoiceDate || null,
      paymentStatus: capexPaymentStatus,
    });

    setCapexName(''); setCapexCost(''); setCapexVendor(''); setCapexPo('');
    setCapexInvoiceDate(''); setCapexPaymentStatus('pending');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getEvmColor = (value) => {
    if (value >= 1) return 'var(--status-green)';
    if (value >= 0.9) return 'var(--status-amber)';
    return 'var(--status-red)';
  };

  const paymentStatusColors = {
    'pending': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    'paid': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    'overdue': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    'partial': { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  };

  const categoryColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ===== TOP METRICS ROW ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* Total Budget */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={metricLabel}>Total Budget</span>
            <svg style={{ width: '16px', height: '16px', color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(totalBudget)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>CAPEX: {formatCurrency(capexBudget)}</span>
            <span>OPEX: {formatCurrency(opexBudget)}</span>
          </div>
        </div>

        {/* Actual Spend */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={metricLabel}>Actual Spend</span>
            <svg style={{ width: '16px', height: '16px', color: isOverBudget ? 'var(--status-red)' : 'var(--status-amber)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: isOverBudget ? 'var(--status-red)' : 'var(--text-primary)' }}>{formatCurrency(totalSpent)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>CAPEX: {formatCurrency(capexSpent)}</span>
            <span>OPEX: {formatCurrency(opexSpent)}</span>
          </div>
        </div>

        {/* Variance */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={metricLabel}>Variance</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: isOverBudget ? 'var(--status-red)' : 'var(--status-green)' }}>{burnPct}% used</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: variance < 0 ? 'var(--status-red)' : 'var(--status-green)' }}>
            {variance < 0 ? `Over: ${formatCurrency(Math.abs(variance))}` : formatCurrency(variance)}
          </div>
          <div className="progress-bar" style={{ height: '6px', marginTop: '6px' }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(burnPct, 100)}%`, backgroundColor: isOverBudget ? 'var(--status-red)' : 'var(--status-green)' }} />
          </div>
        </div>

        {/* Monthly Burn Rate */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <span style={metricLabel}>Monthly Burn Rate</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>{formatCurrency(monthlyBurnRate)}</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{monthsElapsed} months elapsed</span>
        </div>

        {/* CPI */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <span style={metricLabel}>CPI (Cost Performance)</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: getEvmColor(cpi) }}>{cpi.toFixed(2)}</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{cpi >= 1 ? '✓ Under budget' : '⚠ Over budget'}</span>
        </div>

        {/* SPI */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <span style={metricLabel}>SPI (Schedule Performance)</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: getEvmColor(spi) }}>{spi.toFixed(2)}</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{spi >= 1 ? '✓ Ahead of schedule' : '⚠ Behind schedule'}</span>
        </div>
      </div>

      {/* ===== EVM DETAILS ROW ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <span style={metricLabel}>Earned Value (EV)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '4px' }}>{formatCurrency(earnedValue)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <span style={metricLabel}>Planned Value (PV)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '4px' }}>{formatCurrency(plannedValue)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <span style={metricLabel}>EAC (Estimate at Completion)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: eac > totalBudget ? 'var(--status-red)' : 'var(--status-green)', marginTop: '4px' }}>{formatCurrency(eac)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <span style={metricLabel}>ETC (Estimate to Complete)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>{formatCurrency(Math.max(0, etc))}</div>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <span style={metricLabel}>VAC (Variance at Completion)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: vac >= 0 ? 'var(--status-green)' : 'var(--status-red)', marginTop: '4px' }}>{formatCurrency(vac)}</div>
        </div>
      </div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', gap: '4px' }}>
        {[
          { key: 'overview', label: 'CAPEX & OPEX' },
          { key: 'breakdown', label: 'Cost Breakdown' },
          { key: 'contingency', label: 'Contingency & Reserve' },
          { key: 'roi', label: 'ROI Calculator' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveFinTab(tab.key)} style={{
            padding: '8px 16px', fontSize: '0.78rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.15s ease',
            backgroundColor: activeFinTab === tab.key ? 'var(--accent-primary)' : 'transparent',
            color: activeFinTab === tab.key ? '#fff' : 'var(--text-secondary)',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== CAPEX & OPEX TAB ===== */}
      {activeFinTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          {/* CAPEX Table */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>CAPEX Purchases (Capital Expenditures)</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Log hardware, software licenses, cloud infrastructure, and vendor costs.
            </p>
            
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                    <th style={thStyle}>Purchase</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Vendor</th>
                    <th style={thStyle}>PO #</th>
                    <th style={thStyle}>Cost</th>
                    <th style={thStyle}>Payment</th>
                    {!isProjectManager && <th style={{ ...thStyle, width: '40px' }}>Act.</th>}
                  </tr>
                </thead>
                <tbody>
                  {capexItems.map((item) => {
                    const ps = paymentStatusColors[item.paymentStatus] || paymentStatusColors['pending'];
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>{item.name}</span>
                            {item.invoiceDate && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Inv: {new Date(item.invoiceDate).toLocaleDateString()}</span>}
                          </div>
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: '0.68rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '500', border: '1px solid var(--border-subtle)' }}>{item.category}</span></td>
                        <td style={tdStyle}><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.vendor || '—'}</span></td>
                        <td style={tdStyle}><span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.poNumber || '—'}</span></td>
                        <td style={tdStyle}><span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{formatCurrency(item.cost)}</span></td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', backgroundColor: ps.bg, color: ps.color, textTransform: 'capitalize' }}>
                            {item.paymentStatus || 'pending'}
                          </span>
                        </td>
                        {!isProjectManager && (
                          <td style={tdStyle}>
                            <button onClick={() => deleteCapexItem(project.id, item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {capexItems.length === 0 && (
                    <tr><td colSpan={isProjectManager ? 6 : 7} style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No CAPEX purchases logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced CAPEX Form */}
            {isProjectManager ? (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                🔒 CAPEX logging is read-only for Project Managers
              </div>
            ) : (
              <form onSubmit={handleAddCapex} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Log New Purchase</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  <input type="text" placeholder="Purchase name" value={capexName} onChange={(e) => setCapexName(e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: '0.78rem' }} required />
                  <select value={capexCategory} onChange={(e) => setCapexCategory(e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: '0.78rem' }}>
                    <option value="Software">Software</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Training">Training</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="text" placeholder="Vendor" value={capexVendor} onChange={(e) => setCapexVendor(e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: '0.78rem' }} />
                  <input type="text" placeholder="PO Number" value={capexPo} onChange={(e) => setCapexPo(e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: '0.78rem' }} />
                  <input type="number" placeholder="Cost ($)" value={capexCost} onChange={(e) => setCapexCost(e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: '0.78rem' }} required />
                  <input type="date" placeholder="Invoice Date" value={capexInvoiceDate} onChange={(e) => setCapexInvoiceDate(e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: '0.78rem' }} />
                  <select value={capexPaymentStatus} onChange={(e) => setCapexPaymentStatus(e.target.value)} className="form-input" style={{ padding: '7px 10px', fontSize: '0.78rem' }}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button type="submit" className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }}>Log Purchase</button>
                </div>
              </form>
            )}
          </div>

          {/* OPEX Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>OPEX Labor Rollups</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Calculated from task hours × resource hourly rates. Completed tasks excluded.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                  <th style={thStyle}>Resource</th>
                  <th style={thStyle}>Rate</th>
                  <th style={thStyle}>Hours</th>
                  <th style={thStyle}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {laborBreakdown.map((labor) => (
                  <tr key={labor.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>{labor.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{labor.role}</span>
                      </div>
                    </td>
                    <td style={tdStyle}><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>${labor.rate}/hr</span></td>
                    <td style={tdStyle}><span style={{ fontWeight: '600', fontSize: '0.8rem' }}>{labor.hours} hrs</span></td>
                    <td style={tdStyle}><span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>{formatCurrency(labor.hours * labor.rate)}</span></td>
                  </tr>
                ))}
                {laborBreakdown.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active labor OPEX.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== COST BREAKDOWN TAB ===== */}
      {activeFinTab === 'breakdown' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* By Category */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>CAPEX by Category</h3>
            {capexByCategory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No purchases logged yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {capexByCategory.map(([cat, cost], i) => {
                  const pct = capexSpent > 0 ? Math.round((cost / capexSpent) * 100) : 0;
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: categoryColors[i % categoryColors.length] }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{cat}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(cost)} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: categoryColors[i % categoryColors.length], transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By Phase */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Cost Allocation by Phase</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {costByPhase.map(([phase, cost], i) => {
                const pct = totalSpent > 0 ? Math.round((cost / totalSpent) * 100) : 0;
                return (
                  <div key={phase} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{phase}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(cost)}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: categoryColors[i % categoryColors.length], transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Split Visualization */}
          <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Budget vs Actual — Stacked Comparison</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Budget</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{formatCurrency(totalBudget)}</span>
                </div>
                <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ width: `${totalBudget > 0 ? (capexBudget / totalBudget) * 100 : 50}%`, backgroundColor: '#6366f1', transition: 'width 0.3s ease' }} />
                  <div style={{ width: `${totalBudget > 0 ? (opexBudget / totalBudget) * 100 : 50}%`, backgroundColor: '#22c55e', transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} /> CAPEX {formatCurrency(capexBudget)}</span>
                  <span style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> OPEX {formatCurrency(opexBudget)}</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Actual Spend</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isOverBudget ? 'var(--status-red)' : 'var(--text-primary)' }}>{formatCurrency(totalSpent)}</span>
                </div>
                <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ width: `${totalSpent > 0 ? (capexSpent / totalSpent) * 100 : 50}%`, backgroundColor: '#818cf8', transition: 'width 0.3s ease' }} />
                  <div style={{ width: `${totalSpent > 0 ? (opexSpent / totalSpent) * 100 : 50}%`, backgroundColor: '#4ade80', transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#818cf8' }} /> CAPEX {formatCurrency(capexSpent)}</span>
                  <span style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }} /> OPEX {formatCurrency(opexSpent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTINGENCY TAB ===== */}
      {activeFinTab === 'contingency' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Contingency & Management Reserve</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contingency Budget</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(contingencyBudget)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Used (Overrun Coverage)</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: contingencyUsed > 0 ? 'var(--status-red)' : 'var(--text-primary)' }}>{formatCurrency(contingencyUsed)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Remaining</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: contingencyRemaining > 0 ? 'var(--status-green)' : 'var(--status-red)' }}>{formatCurrency(contingencyRemaining)}</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${contingencyBudget > 0 ? (contingencyUsed / contingencyBudget) * 100 : 0}%`, backgroundColor: contingencyUsed > contingencyBudget * 0.5 ? 'var(--status-red)' : 'var(--status-amber)' }} />
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Assessment</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: '1.5' }}>
                  {contingencyRemaining > contingencyBudget * 0.5
                    ? '✅ Contingency reserve is healthy. No immediate action needed.'
                    : contingencyRemaining > 0
                    ? '⚠️ Contingency reserve is being drawn down. Monitor closely.'
                    : '🚨 Contingency fully depleted. Escalate to executive sponsor immediately.'}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Forecast Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Projected Total Cost (EAC)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: eac > totalBudget ? 'var(--status-red)' : 'var(--status-green)', marginTop: '4px' }}>{formatCurrency(eac)}</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Remaining to Complete (ETC)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{formatCurrency(Math.max(0, etc))}</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Projected Monthly Run Rate</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-secondary)', marginTop: '4px' }}>{formatCurrency(monthlyBurnRate)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ROI CALCULATOR TAB ===== */}
      {activeFinTab === 'roi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>ROI Calculator</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expected Revenue / Benefit ($)</label>
                <input type="number" className="form-input" value={expectedRevenue} onChange={(e) => setExpectedRevenue(e.target.value)} placeholder="e.g. 500000" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payback Period (Months)</label>
                <input type="number" className="form-input" value={paybackMonths} onChange={(e) => setPaybackMonths(e.target.value)} placeholder="e.g. 18" />
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Project Investment</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(totalSpent)}</div>
              </div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>ROI Analysis Results</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>ROI %</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: roi.roiPct >= 0 ? 'var(--status-green)' : 'var(--status-red)', marginTop: '4px' }}>{roi.roiPct}%</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Net Benefit</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: roi.netBenefit >= 0 ? 'var(--status-green)' : 'var(--status-red)', marginTop: '4px' }}>{formatCurrency(roi.netBenefit)}</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>NPV (10% rate)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: roi.npv >= 0 ? 'var(--status-green)' : 'var(--status-red)', marginTop: '4px' }}>{formatCurrency(roi.npv)}</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Payback Period</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px' }}>{roi.payback || '—'} mo</div>
              </div>
            </div>
            {roi.rev > 0 && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: roi.roiPct >= 20 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${roi.roiPct >= 20 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  {roi.roiPct >= 50 ? '🚀 Excellent ROI — Strong business case.' : roi.roiPct >= 20 ? '✅ Healthy ROI — Solid investment.' : roi.roiPct >= 0 ? '⚠️ Marginal ROI — Review cost controls.' : '🚨 Negative ROI — Immediate review needed.'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const metricLabel = { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' };
const thStyle = { fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', padding: '10px 8px', textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 8px', verticalAlign: 'middle' };

export default FinancialsView;
