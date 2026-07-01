import React, { useState } from 'react';

function DiscussionsView({
  projectId,
  targetType,
  targetId,
  discussions = [],
  addDiscussionComment,
  currentUser
}) {
  const [commentText, setCommentText] = useState('');

  // Filter comments for this specific item
  const filteredComments = discussions.filter(
    (c) => c.targetType === targetType && c.targetId === targetId
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addDiscussionComment(
      projectId,
      targetType,
      targetId,
      commentText.trim(),
      currentUser ? currentUser.name : 'Unknown User'
    );
    setCommentText('');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="discussions-container card">
      <div className="discussions-header">
        <h3>Comments & Discussions</h3>
        <span className="comments-count-badge">{filteredComments.length} comments</span>
      </div>

      <div className="discussions-list">
        {filteredComments.length === 0 ? (
          <div className="discussions-empty-state">
            <p>No comments logged yet. Start the conversation!</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="discussion-item">
              <div className="discussion-avatar">
                {getInitials(comment.author)}
              </div>
              <div className="discussion-bubble">
                <div className="discussion-meta">
                  <span className="discussion-author">{comment.author}</span>
                  <span className="discussion-time">{formatTimestamp(comment.timestamp)}</span>
                </div>
                <div className="discussion-text">{comment.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="discussions-form">
        <textarea
          className="form-input discussion-textarea"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          rows="3"
        />
        <div className="discussion-form-actions">
          <button type="submit" className="btn-primary discussion-post-btn" disabled={!commentText.trim()}>
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
}

export default DiscussionsView;
