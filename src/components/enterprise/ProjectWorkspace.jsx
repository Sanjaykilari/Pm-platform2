import React, { useState } from 'react';
import WorkplanView from './WorkplanView';
import ListView from './ListView';
import FinancialsView from './FinancialsView';
import RaidLogView from './RaidLogView';
import ProjectInfoView from './ProjectInfoView';
import ProjectSummaryView from './ProjectSummaryView';
import RequirementsView from '../../features/workplan/RequirementsView';
import TargetsView from '../../features/workplan/TargetsView';
import DiscussionsView from '../../features/collab/DiscussionsView';
import DocsView from './DocsView';
import ReportsHub from './ReportsHub';

const ProjectWorkspace = ({ 
  project, 
  resources, 
  addTask, 
  updateTask, 
  deleteTask, 
  replaceTasks,
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
  addCapexItem,
  deleteCapexItem,
  calculateOpex,
  calculateProjectCost,
  updateProjectDetails,
  setSelectedTask,
  currentUser,
  // New actions passed from App
  addActionItem,
  updateActionItem,
  deleteActionItem,
  addDecision,
  updateDecision,
  deleteDecision,
  addRequirement,
  updateRequirement,
  deleteRequirement,
  addTarget,
  updateTarget,
  deleteTarget,
  addDiscussionComment,
  profiles = [],
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  raidActiveSubTab,
  setRaidActiveSubTab,
  highlightedItemId
}) => {
  const [localActiveTab, setLocalActiveTab] = useState('summary');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmailInput, setShareEmailInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shareRole, setShareRole] = useState('Viewer');
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const isReadOnly = (() => {
    if (currentUser.role === 'PPM Administrator') return false;
    if (project.owner === currentUser.name) return false;
    const shared = (project.sharedWith || []).find(sw => sw.id === currentUser.id);
    if (shared && shared.role === 'Editor') return false;
    return true;
  })();

  const activeTasksCount = (project.tasks || []).filter(t => t.status !== 'completed').length;
  
  // Count open items for RAID indicator
  const openRisks = (project.risks || []).filter(r => r.status === 'open').length;
  const unvalidatedAssumptions = (project.assumptions || []).filter(a => a.status === 'unvalidated').length;
  const openIssues = (project.issues || []).filter(i => i.status === 'open').length;
  const blockedDeps = (project.dependencies || []).filter(d => d.status === 'blocked').length;
  const pendingActions = (project.actionItems || []).filter(a => a.status === 'pending').length;
  const activeRaidCount = openRisks + unvalidatedAssumptions + openIssues + blockedDeps + pendingActions;

  const handleShareSubmit = (e) => {
    e.preventDefault();
    const emailInput = shareEmailInput.trim();
    if (!emailInput) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      alert("Please enter a valid email address.");
      return;
    }

    const currentSharedList = project.sharedWith || [];
    
    // Check if already shared by email (case-insensitive)
    const alreadyShared = currentSharedList.some(sw => sw.email.toLowerCase() === emailInput.toLowerCase());
    if (alreadyShared) {
      alert(`Project is already shared with ${emailInput}`);
      return;
    }

    // Check if email matches current user's email
    if (currentUser.email && currentUser.email.toLowerCase() === emailInput.toLowerCase()) {
      alert("You cannot share the project with yourself.");
      return;
    }

    // Check if email matches project owner
    const ownerProfile = profiles.find(p => p.name.toLowerCase() === project.owner.toLowerCase() || p.username.toLowerCase() === project.owner.toLowerCase());
    if (ownerProfile && ownerProfile.email && ownerProfile.email.toLowerCase() === emailInput.toLowerCase()) {
      alert("This user is the owner of the project.");
      return;
    }

    // Find if target user exists in profiles
    const targetUser = profiles.find(p => p.email && p.email.toLowerCase() === emailInput.toLowerCase());
    
    let newShare;
    if (targetUser) {
      newShare = {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        email: targetUser.email,
        role: shareRole
      };
    } else {
      // Invite new guest user by email
      const username = emailInput.split('@')[0];
      newShare = {
        id: emailInput.toLowerCase(),
        name: emailInput,
        username: username,
        email: emailInput.toLowerCase(),
        role: shareRole,
        status: 'Invited'
      };
    }

    updateProjectDetails(project.id, { sharedWith: [...currentSharedList, newShare] });
    setShareEmailInput('');
    setShowSuggestions(false);
    setShareRole('Viewer');
  };

  const handleRemoveShare = (userIdToRemove) => {
    const currentSharedList = project.sharedWith || [];
    const updatedSharedWith = currentSharedList.filter(sw => sw.id !== userIdToRemove && sw.email !== userIdToRemove);
    updateProjectDetails(project.id, { sharedWith: updatedSharedWith });
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}?project=${project.id}`;
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  // Profiles that are not the current user and not already shared with
  const shareableUsers = profiles.filter(p => 
    p.id !== currentUser.id && 
    !(p.email && currentUser.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) &&
    !(project.sharedWith || []).some(sw => sw.id === p.id || (sw.email && p.email && sw.email.toLowerCase() === p.email.toLowerCase()))
  );

  const filteredSuggestions = shareEmailInput.trim() ? shareableUsers.filter(p => 
    p.name.toLowerCase().includes(shareEmailInput.toLowerCase()) || 
    (p.email && p.email.toLowerCase().includes(shareEmailInput.toLowerCase()))
  ) : [];

  return (
    <div style={styles.container} className="animate-fade">
      {/* Project Sub-header / Tabs */}
      <div style={{ ...styles.tabBar, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }} className="glass-panel">
        <div style={styles.tabGroup} className="workspace-tab-group">
          <button 
            onClick={() => setActiveTab('summary')} 
            style={{ ...styles.tab, ...(activeTab === 'summary' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Summary
          </button>

          <button 
            onClick={() => setActiveTab('workplan')} 
            style={{ ...styles.tab, ...(activeTab === 'workplan' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Workplan
            {activeTasksCount > 0 && <span style={styles.tabCount}>{activeTasksCount}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('raid')} 
            style={{ ...styles.tab, ...(activeTab === 'raid' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            RAID Log
            {activeRaidCount > 0 && (
              <span style={{ ...styles.tabCount, backgroundColor: 'var(--status-red-bg)', color: '#fca5a5' }}>
                {activeRaidCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('requirements')} 
            style={{ ...styles.tab, ...(activeTab === 'requirements' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Requirements
          </button>

          <button 
            onClick={() => setActiveTab('targets')} 
            style={{ ...styles.tab, ...(activeTab === 'targets' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Targets & OKRs
          </button>

          <button 
            onClick={() => setActiveTab('financials')} 
            style={{ ...styles.tab, ...(activeTab === 'financials' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Financials
          </button>

          <button 
            onClick={() => setActiveTab('discussions')} 
            style={{ ...styles.tab, ...(activeTab === 'discussions' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Discussions
          </button>

          <button 
            onClick={() => setActiveTab('docs')} 
            style={{ ...styles.tab, ...(activeTab === 'docs' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Docs
          </button>

          <button 
            onClick={() => setActiveTab('reports')} 
            style={{ ...styles.tab, ...(activeTab === 'reports' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Reports
          </button>

          <button 
            onClick={() => setActiveTab('info')} 
            style={{ ...styles.tab, ...(activeTab === 'info' ? styles.activeTab : {}) }}
            className="btn-ghost"
          >
            <svg style={styles.tabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
        </div>

        {/* Share Action */}
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="btn-ghost"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.8rem', 
            padding: '8px 14px', 
            color: 'var(--accent-indigo, #6366f1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            background: 'rgba(99, 102, 241, 0.04)',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            borderRadius: '100px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
          }}
        >
          <svg style={{ width: '13px', height: '13px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Share
        </button>
      </div>
 
      {/* Render Subview Content */}
      <div style={styles.contentArea}>
        {activeTab === 'summary' && (
          <ProjectSummaryView
            type="project"
            item={project}
            project={project}
            resources={resources}
            calculateOpex={calculateOpex}
            calculateProjectCost={calculateProjectCost}
          />
        )}
        {activeTab === 'workplan' && (
          <WorkplanView 
            project={project} 
            resources={resources} 
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            replaceTasks={replaceTasks}
            setSelectedTask={setSelectedTask} 
            isReadOnly={isReadOnly}
          />
        )}
        {activeTab === 'raid' && (
          <RaidLogView 
            project={project} 
            resources={resources}
            currentUser={currentUser}
            addRisk={addRisk}
            updateRisk={updateRisk}
            deleteRisk={deleteRisk}
            addAssumption={addAssumption}
            updateAssumption={updateAssumption}
            deleteAssumption={deleteAssumption}
            addIssue={addIssue}
            updateIssue={updateIssue}
            deleteIssue={deleteIssue}
            addDependency={addDependency}
            updateDependency={updateDependency}
            deleteDependency={deleteDependency}
            addActionItem={addActionItem}
            updateActionItem={updateActionItem}
            deleteActionItem={deleteActionItem}
            addDecision={addDecision}
            updateDecision={updateDecision}
            deleteDecision={deleteDecision}
            isReadOnly={isReadOnly}
            activeSubTab={raidActiveSubTab}
            setActiveSubTab={setRaidActiveSubTab}
            highlightedItemId={highlightedItemId}
          />
        )}
        {activeTab === 'requirements' && (
          <RequirementsView
            project={project}
            addRequirement={addRequirement}
            updateRequirement={updateRequirement}
            deleteRequirement={deleteRequirement}
            currentUser={currentUser}
            isReadOnly={isReadOnly}
          />
        )}
        {activeTab === 'targets' && (
          <TargetsView
            project={project}
            addTarget={addTarget}
            updateTarget={updateTarget}
            deleteTarget={deleteTarget}
            currentUser={currentUser}
            isReadOnly={isReadOnly}
          />
        )}
        {activeTab === 'financials' && (
          <FinancialsView 
            project={project} 
            resources={resources} 
            addCapexItem={addCapexItem}
            deleteCapexItem={deleteCapexItem}
            calculateOpex={calculateOpex}
            calculateProjectCost={calculateProjectCost}
            currentUser={currentUser}
            isReadOnly={isReadOnly}
          />
        )}
        {activeTab === 'discussions' && (
          <DiscussionsView
            projectId={project.id}
            targetType="project"
            targetId={project.id}
            discussions={project.discussions}
            addDiscussionComment={addDiscussionComment}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'docs' && (
          <DocsView 
            project={project} 
            currentUser={currentUser} 
          />
        )}
        {activeTab === 'reports' && (
          <ReportsHub 
            project={project} 
          />
        )}
        {activeTab === 'info' && (
          <ProjectInfoView
            project={project}
            updateProjectDetails={updateProjectDetails}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div
          className="google-modal-overlay"
          onClick={() => {
            setIsShareModalOpen(false);
            setShowSuggestions(false);
          }}
        >
          <div
            className="google-modal-card"
            style={{
              maxWidth: '480px',
              position: 'relative',
              padding: '24px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowSuggestions(false);
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsShareModalOpen(false);
                setShowSuggestions(false);
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                border: 'none',
                background: 'transparent',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                lineHeight: 1,
                padding: '4px'
              }}
            >
              &times;
            </button>

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Share Project
              </h2>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                marginBottom: 0
              }}>
                Invite team members to collaborate on this project.
              </p>
            </div>

            {/* Form Layout */}
            <form onSubmit={handleShareSubmit} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
              position: 'relative'
            }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Enter email to search or invite..."
                  value={shareEmailInput}
                  onChange={(e) => {
                    setShareEmailInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSuggestions(true);
                  }}
                  className="auth-input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  required
                />

                {/* Autocomplete Suggestions Box */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 1000,
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {filteredSuggestions.map(user => (
                      <div 
                        key={user.id}
                        className="profile-menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareEmailInput(user.email || `${user.username}@example.com`);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '6px 8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email || `${user.username}@example.com`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <select
                  className="profile-select-input"
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value)}
                  style={{ width: '100%', paddingRight: '2rem' }}
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!shareEmailInput.trim()}
                style={{
                  whiteSpace: 'nowrap',
                  opacity: !shareEmailInput.trim() ? 0.5 : 1
                }}
              >
                Add
              </button>
            </form>

            {/* Shared Members List */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: 'var(--text-secondary)',
                letterSpacing: '0.5px',
                marginBottom: '10px',
                marginTop: 0
              }}>
                Shared Members
              </h3>

              {(!project.sharedWith || project.sharedWith.length === 0) ? (
                <p style={{
                  fontStyle: 'italic',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  margin: 0
                }}>
                  This project is not shared with anyone yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {project.sharedWith.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--accent-indigo, #6366f1)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}>
                          {member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: 'var(--text-primary)'
                          }}>
                            {member.name}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)'
                          }}>
                            {member.email || `@${member.username}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}>
                          {member.role}
                        </span>
                        <button
                          className="btn-ghost"
                          onClick={() => handleRemoveShare(member.id)}
                          style={{
                            color: 'var(--status-red)',
                            fontSize: '0.75rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Copy Link Section */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px'
            }}>
              <h3 style={{
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: 'var(--text-secondary)',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                marginTop: 0
              }}>
                Copy Shareable Link
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="auth-input-field"
                  type="text"
                  readOnly
                  value={`${window.location.origin}?project=${project.id}`}
                  style={{
                    flex: 1,
                    background: 'var(--bg-secondary)',
                    cursor: 'default'
                  }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={handleCopyLink}
                  style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
  },
  tabBar: {
    padding: '4px 16px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
  },
  tabGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    padding: '12px 10px',
    position: 'relative',
    transition: 'all 0.15s ease',
    borderRadius: '0',
    backgroundColor: 'transparent',
    border: 'none',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    color: 'var(--accent-secondary)',
    borderBottom: '2px solid var(--accent-secondary)',
    fontWeight: '600',
  },
  tabIcon: {
    width: '15px',
    height: '15px',
  },
  tabCount: {
    fontSize: '0.7rem',
    backgroundColor: 'var(--status-blue-bg)',
    color: '#93c5fd',
    padding: '1px 6px',
    borderRadius: '8px',
    fontWeight: '700',
  },
  contentArea: {
    flexGrow: 1,
    overflowY: 'auto',
  },
};

export default ProjectWorkspace;
