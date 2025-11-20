// User Preferences Service
// This service manages user-specific settings including OpenAI API keys
// Currently uses localStorage with user email as namespace
// TODO: Replace with AWS DynamoDB + API Gateway when Cognito is implemented

const STORAGE_PREFIX = 'user_prefs_';

/**
 * Get the current user's identifier (email)
 * In the future, this will come from AWS Cognito
 */
const getCurrentUserId = () => {
  // For now, we'll use a simple email-based system
  // This will be replaced with Cognito user ID
  const userEmail = localStorage.getItem('current_user_email');
  return userEmail || 'anonymous';
};

/**
 * Save user preferences to storage
 * @param {Object} preferences - User preferences object
 */
export const saveUserPreferences = async (preferences) => {
  try {
    const userId = getCurrentUserId();
    const storageKey = `${STORAGE_PREFIX}${userId}`;
    
    // In production, this would call an API endpoint
    // For now, we'll use localStorage with user namespace
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw new Error('Failed to save preferences');
  }
};

/**
 * Load user preferences from storage
 * @returns {Object} User preferences
 */
export const loadUserPreferences = async () => {
  try {
    const userId = getCurrentUserId();
    const storageKey = `${STORAGE_PREFIX}${userId}`;
    
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {
        openaiApiKey: '',
        theme: 'light',
        notifications: true
      };
    }
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return {
      openaiApiKey: '',
      theme: 'light',
      notifications: true
    };
  }
};

/**
 * Save OpenAI API key for current user
 * @param {string} apiKey - OpenAI API key
 */
export const saveOpenAIKey = async (apiKey) => {
  try {
    const preferences = await loadUserPreferences();
    preferences.openaiApiKey = apiKey;
    await saveUserPreferences(preferences);
    
    // Also update the old localStorage key for backward compatibility
    localStorage.setItem('openai_api_key', apiKey);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving OpenAI key:', error);
    throw error;
  }
};

/**
 * Get OpenAI API key for current user
 * @returns {string} OpenAI API key
 */
export const getOpenAIKey = async () => {
  try {
    const preferences = await loadUserPreferences();
    
    // If no key in preferences, check old localStorage location
    if (!preferences.openaiApiKey) {
      const oldKey = localStorage.getItem('openai_api_key');
      if (oldKey) {
        // Migrate to new system
        await saveOpenAIKey(oldKey);
        return oldKey;
      }
    }
    
    return preferences.openaiApiKey || '';
  } catch (error) {
    console.error('Error getting OpenAI key:', error);
    return '';
  }
};

/**
 * Remove OpenAI API key for current user
 */
export const removeOpenAIKey = async () => {
  try {
    const preferences = await loadUserPreferences();
    preferences.openaiApiKey = '';
    await saveUserPreferences(preferences);
    
    // Also remove from old localStorage location
    localStorage.removeItem('openai_api_key');
    
    return { success: true };
  } catch (error) {
    console.error('Error removing OpenAI key:', error);
    throw error;
  }
};

/**
 * Set current user (for multi-user support)
 * @param {string} email - User email
 */
export const setCurrentUser = (email) => {
  if (email) {
    localStorage.setItem('current_user_email', email);
  } else {
    localStorage.removeItem('current_user_email');
  }
};

/**
 * Get current user email
 * @returns {string} User email or null
 */
export const getCurrentUser = () => {
  return localStorage.getItem('current_user_email');
};

/**
 * Check if user has an API key configured
 * @returns {boolean}
 */
export const hasOpenAIKey = async () => {
  const key = await getOpenAIKey();
  return !!key;
};

// Export migration helper for moving to AWS backend later
export const migrateToAWSBackend = async (cognitoUserId) => {
  // This function will be implemented when AWS Cognito is added
  // It will migrate local preferences to DynamoDB
  console.log('Migration to AWS backend not yet implemented');
  console.log('User ID:', cognitoUserId);
  
  // TODO: Implement API call to store preferences in DynamoDB
};
