import React, { useState, useEffect } from 'react';
import { saveOpenAIKey, getOpenAIKey, removeOpenAIKey } from '../../services/userPreferencesService';
import './APIKeySettings.css';

function APIKeySettings({ onClose, onKeySaved }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationStatus, setValidationStatus] = useState(''); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(true);

  // Load API key on mount
  useEffect(() => {
    const loadKey = async () => {
      try {
        const key = await getOpenAIKey();
        setApiKey(key);
      } catch (error) {
        console.error('Error loading API key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadKey();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setValidationMessage('Please enter an API key');
      setValidationStatus('error');
      return;
    }

    // Basic format validation
    if (!apiKey.startsWith('sk-')) {
      setValidationMessage('OpenAI API keys should start with "sk-"');
      setValidationStatus('error');
      return;
    }

    try {
      await saveOpenAIKey(apiKey.trim());
      setValidationMessage('API key saved successfully!');
      setValidationStatus('success');
      
      setTimeout(() => {
        onKeySaved();
        onClose();
      }, 1000);
    } catch (error) {
      setValidationMessage('Failed to save API key: ' + error.message);
      setValidationStatus('error');
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setValidationMessage('Please enter an API key first');
      setValidationStatus('error');
      return;
    }

    setIsValidating(true);
    setValidationMessage('Testing API key...');
    setValidationStatus('');

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`
        }
      });

      if (response.ok) {
        setValidationMessage('✓ API key is valid!');
        setValidationStatus('success');
      } else if (response.status === 401) {
        setValidationMessage('✗ Invalid API key. Please check and try again.');
        setValidationStatus('error');
      } else {
        setValidationMessage(`✗ Error: ${response.status} - ${response.statusText}`);
        setValidationStatus('error');
      }
    } catch (error) {
      setValidationMessage('✗ Network error. Please check your connection.');
      setValidationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to remove your API key?')) {
      try {
        await removeOpenAIKey();
        setApiKey('');
        setValidationMessage('API key removed');
        setValidationStatus('success');
        setTimeout(() => {
          setValidationMessage('');
          setValidationStatus('');
        }, 2000);
      } catch (error) {
        setValidationMessage('Failed to remove API key: ' + error.message);
        setValidationStatus('error');
      }
    }
  };

  const hasExistingKey = apiKey && apiKey.trim().length > 0;

  return (
    <div className="api-key-settings-overlay" onClick={onClose}>
      <div className="api-key-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="api-key-settings-header">
          <h2>🔑 OpenAI API Configuration</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="api-key-settings-content">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <div className="info-box">
                <p><strong>Your API key is stored securely per user account.</strong></p>
                <p>Don't have an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get one here</a></p>
              </div>

          <div className="input-group">
            <label htmlFor="api-key-input">OpenAI API Key</label>
            <div className="input-with-toggle">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="api-key-input"
              />
              <button 
                className="toggle-visibility-btn"
                onClick={() => setShowKey(!showKey)}
                type="button"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {validationMessage && (
            <div className={`validation-message ${validationStatus}`}>
              {validationMessage}
            </div>
          )}

          <div className="button-group">
            <button 
              className="test-btn"
              onClick={handleTest}
              disabled={isValidating || !apiKey.trim()}
            >
              {isValidating ? 'Testing...' : 'Test Connection'}
            </button>
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={!apiKey.trim()}
            >
              Save Key
            </button>
            {hasExistingKey && (
              <button 
                className="clear-btn"
                onClick={handleClear}
              >
                Remove Key
              </button>
            )}
          </div>

          <div className="help-section">
            <h3>How to get an API key:</h3>
            <ol>
              <li>Go to <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a></li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to API Keys section</li>
              <li>Click "Create new secret key"</li>
              <li>Copy and paste the key here</li>
            </ol>
            <p className="note"><strong>Note:</strong> API usage is billed separately from ChatGPT subscriptions. Check OpenAI's pricing page for current rates.</p>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default APIKeySettings;
