import React, { useState } from 'react';

const DocsView = ({ project, currentUser }) => {
  const [docs, setDocs] = useState([
    { id: 'doc-1', title: 'Product Requirements Document (PRD)', author: project.owner, date: '2026-06-01', content: '# PRD\n\nThis document outlines the core requirements for the project.' },
    { id: 'doc-2', title: 'Architecture Specs', author: 'Alice Chen', date: '2026-06-03', content: '# Architecture\n\nWe will use a modern React frontend with a Node backend.' },
    { id: 'doc-3', title: 'Meeting Notes - Kickoff', author: currentUser.name, date: '2026-06-05', content: 'Discussed initial timelines and resourcing.' }
  ]);
  const [activeDoc, setActiveDoc] = useState(docs[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleCreateNew = () => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Document',
      author: currentUser.name,
      date: new Date().toLocaleDateString(),
      content: ''
    };
    setDocs([...docs, newDoc]);
    setActiveDoc(newDoc);
    setEditTitle('Untitled Document');
    setEditContent('');
    setIsEditing(true);
  };

  const handleSave = () => {
    const updated = docs.map(d => 
      d.id === activeDoc.id ? { ...d, title: editTitle, content: editContent } : d
    );
    setDocs(updated);
    setActiveDoc({ ...activeDoc, title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const startEdit = () => {
    setEditTitle(activeDoc.title);
    setEditContent(activeDoc.content);
    setIsEditing(true);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 220px)', gap: '20px' }}>
      
      {/* Sidebar: Document List */}
      <div className="glass-panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Project Pages</h3>
          <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>+ New</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flexGrow: 1 }}>
          {docs.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => { setActiveDoc(doc); setIsEditing(false); }}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                backgroundColor: activeDoc?.id === doc.id ? 'var(--accent-primary)' : 'transparent',
                color: activeDoc?.id === doc.id ? '#ffffff' : 'var(--text-primary)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: activeDoc?.id === doc.id ? '600' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {doc.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Document Editor/Viewer */}
      <div className="glass-panel" style={{ flexGrow: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeDoc ? (
          isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <input 
                type="text" 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                className="form-input" 
                style={{ fontSize: '1.5rem', fontWeight: '700', border: 'none', borderBottom: '2px solid var(--border-subtle)', borderRadius: '0', padding: '8px 0', background: 'transparent' }} 
                placeholder="Document Title..."
              />
              <textarea 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                className="form-input" 
                style={{ flexGrow: 1, resize: 'none', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6', padding: '16px', border: '1px solid var(--border-subtle)' }}
                placeholder="Start typing markdown..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setIsEditing(false)} className="btn btn-ghost">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary">Save Document</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>{activeDoc.title}</h1>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Created by {activeDoc.author} • Last updated {activeDoc.date}</div>
                </div>
                <button onClick={startEdit} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <svg style={{ width: '14px', height: '14px', marginRight: '6px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit Page
                </button>
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {activeDoc.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>This page is empty.</span>}
              </div>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Select a document or create a new one.
          </div>
        )}
      </div>

    </div>
  );
};

export default DocsView;
