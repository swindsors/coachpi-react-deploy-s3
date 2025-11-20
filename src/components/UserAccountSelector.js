import React, { useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser } from '../services/userPreferencesService';
import './UserAccountSelector.css';

function UserAccountSelector({ onUserChange }) {
  const [currentUser, setCurrentUserState] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [savedUsers, setSavedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showNewUserInput, setShowNewUserInput] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadSavedUsers();
  }, []);

  const loadCurrentUser = () => {
    const user = getCurrentUser();
    setCurrentUserState(user || 'anonymous');
  };

  const loadSavedUsers = () => {
    // Get all user preference keys from localStorage
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_prefs_') && key !== 'user_prefs_anonymous') {
        const email = key.replace('user_prefs_', '');
        users.push(email);
      }
    }
    setSavedUsers(users);
  };

  const handleSwitchUser = (email) => {
    setCurrentUser(email);
    setCurrentUserState(email);
    setShowSelector(false);
    if (onUserChange) {
      onUserChange(email);
    }
    // Reload the page to refresh all components with new user data
    window.location.reload();
  };

  const handleAddNewUser = () => {
    if (!newUserEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    handleSwitchUser(newUserEmail.trim().toLowerCase());
    setNewUserEmail('');
    setShowNewUserInput(false);
  };

  const handleSignOut = () => {
    if (window.confirm('Sign out? You can sign back in anytime.')) {
      setCurrentUser('anonymous');
      setCurrentUserState('anonymous');
      setShowSelector(false);
      if (onUserChange) {
        onUserChange('anonymous');
      }
      window.location.reload();
    }
  };

  return (
    <div className="user-account-selector">
      <button 
        className="user-account-btn"
        onClick={() => setShowSelector(!showSelector)}
        title="Switch user account"
      >
        <span className="user-icon">👤</span>
        <span className="user-email">
          {currentUser === 'anonymous' ? 'Guest' : currentUser}
        </span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {showSelector && (
        <div className="user-account-dropdown">
          <div className="dropdown-header">
            <strong>Switch Account</strong>
          </div>
          
          <div className="current-user-section">
            <div className="current-user-label">Current:</div>
            <div className="current-user-email">
              {currentUser === 'anonymous' ? '👤 Guest (No account)' : `👤 ${currentUser}`}
            </div>
          </div>

          {savedUsers.length > 0 && (
            <>
              <div className="dropdown-divider"></div>
              <div className="saved-users-section">
                <div className="section-label">Saved Accounts:</div>
                {savedUsers.map(user => (
                  <button
                    key={user}
                    className={`user-item ${user === currentUser ? 'active' : ''}`}
                    onClick={() => handleSwitchUser(user)}
                  >
                    <span className="user-item-icon">👤</span>
                    <span className="user-item-email">{user}</span>
                    {user === currentUser && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="dropdown-divider"></div>

          {showNewUserInput ? (
            <div className="new-user-input-section">
              <input
                type="email"
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNewUser()}
                className="new-user-input"
                autoFocus
              />
              <div className="new-user-buttons">
                <button onClick={handleAddNewUser} className="btn-add">
                  Add
                </button>
                <button onClick={() => {
                  setShowNewUserInput(false);
                  setNewUserEmail('');
                }} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="add-user-btn"
              onClick={() => setShowNewUserInput(true)}
            >
              <span>➕</span> Add Account
            </button>
          )}

          {currentUser !== 'anonymous' && (
            <>
              <div className="dropdown-divider"></div>
              <button
                className="sign-out-btn"
                onClick={handleSignOut}
              >
                <span>🚪</span> Sign Out
              </button>
            </>
          )}

          <div className="dropdown-footer">
            <small>🔐 Temporary multi-user system. Full authentication coming with AWS Cognito.</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAccountSelector;
