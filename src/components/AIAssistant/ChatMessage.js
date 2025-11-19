import React from 'react';

function ChatMessage({ message, isUser }) {
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-content">
        {!isUser && <div className="ai-avatar">🤖</div>}
        <div className="message-bubble">
          <div className="message-text">{message}</div>
        </div>
        {isUser && <div className="user-avatar">👤</div>}
      </div>
    </div>
  );
}

export default ChatMessage;
