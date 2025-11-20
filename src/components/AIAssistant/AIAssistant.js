import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { getOpenAIResponse, hasAPIKey } from '../../services/openAIService';
import APIKeySettings from './APIKeySettings';
import './AIAssistant.css';

function AIAssistant({ isOpen, onClose, projectData, currentPhase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAPIKeySettings, setShowAPIKeySettings] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const messagesEndRef = useRef(null);

  // Check API key status on mount and after settings close
  useEffect(() => {
    const checkAPIKey = async () => {
      const hasKey = await hasAPIKey();
      setApiKeyConfigured(hasKey);
      
      // Set initial welcome message based on API key status
      if (messages.length === 0) {
        if (hasKey) {
          setMessages([
            { text: "Hi! I'm your Six Sigma AI assistant powered by OpenAI. I can help review your work, explain concepts, and provide suggestions. How can I help you today?", isUser: false }
          ]);
        } else {
          setMessages([
            { text: "👋 Welcome! To use the AI assistant, please configure your OpenAI API key. Click the ⚙️ Settings button above to get started.", isUser: false }
          ]);
        }
      }
    };
    
    checkAPIKey();
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAPIKeySaved = async () => {
    const hasKey = await hasAPIKey();
    setApiKeyConfigured(hasKey);
    setMessages([
      { text: "✅ API key configured successfully! I'm now ready to help you with your Six Sigma project. How can I assist you today?", isUser: false }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if API key is configured
    if (!apiKeyConfigured) {
      setMessages(prev => [...prev, 
        { text: input.trim(), isUser: true },
        { text: "⚠️ Please configure your OpenAI API key first. Click the ⚙️ Settings button to add your key.", isUser: false }
      ]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      // Get AI response with project context
      const projectContext = {
        ...projectData,
        currentPhase: currentPhase
      };
      
      const aiResponse = await getOpenAIResponse(userMessage, projectContext);
      
      // Add AI response
      setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "I apologize, but I encountered an error. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = async (action) => {
    const actions = {
      review: "Please review my current work in this phase.",
      explain: "Can you explain what I should focus on in this phase?",
      suggest: "What do you suggest I do next?",
      help: "I need help with this phase."
    };

    const message = actions[action];
    setInput(message);
    
    // Auto-send the message
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear chat history? This cannot be undone.')) {
      setMessages([
        { text: "Chat history cleared. How can I help you today?", isUser: false }
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant-sidebar">
        <div className="ai-assistant-header">
          <div className="header-title">
            <span className="ai-icon">🤖</span>
            <h3>Six Sigma AI Assistant</h3>
            <span className={`api-status ${apiKeyConfigured ? 'connected' : 'disconnected'}`}>
              {apiKeyConfigured ? '🟢 Connected' : '🔴 Not Configured'}
            </span>
          </div>
          <div className="header-actions">
            <button 
              className="settings-btn" 
              onClick={() => setShowAPIKeySettings(true)} 
              title="API Key Settings"
            >
              ⚙️
            </button>
            <button className="close-btn" onClick={onClose} title="Close">×</button>
          </div>
        </div>

        <div className="current-context">
          <span className="context-label">Current Phase:</span>
          <span className="context-phase">{currentPhase?.toUpperCase() || 'DEFINE'}</span>
        </div>

        <div className="quick-actions">
          <button 
            className="quick-action-btn" 
            onClick={() => handleQuickAction('review')}
            disabled={isLoading}
          >
            🔍 Review My Work
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => handleQuickAction('explain')}
            disabled={isLoading}
          >
            💡 Explain This Phase
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => handleQuickAction('suggest')}
            disabled={isLoading}
          >
            ✨ Suggest Next Steps
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => handleQuickAction('help')}
            disabled={isLoading}
          >
            🆘 Get Help
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg.text} isUser={msg.isUser} />
          ))}
          {isLoading && (
            <div className="chat-message ai-message">
              <div className="message-content">
                <div className="ai-avatar">🤖</div>
                <div className="message-bubble loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="input-actions">
            <button 
              className="clear-history-btn" 
              onClick={handleClearHistory}
              title="Clear chat history"
            >
              🗑️
            </button>
          </div>
          <textarea
            className="chat-input"
            placeholder="Ask me anything about your Six Sigma project..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={2}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '...' : '➤'}
          </button>
        </div>

        <div className="ai-footer">
          <small>
            {apiKeyConfigured 
              ? '🤖 Powered by OpenAI GPT-3.5 Turbo' 
              : '⚙️ Configure API key to enable AI assistance'}
          </small>
        </div>

        {showAPIKeySettings && (
          <APIKeySettings 
            onClose={() => setShowAPIKeySettings(false)}
            onKeySaved={handleAPIKeySaved}
          />
        )}
      </div>
    </div>
  );
}

export default AIAssistant;
