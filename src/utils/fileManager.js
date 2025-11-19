// File Manager for Coach PI Projects
// Handles saving, loading, and managing .cpi project files

/**
 * Save project data to a .cpi file
 * @param {Object} projectData - The project data to save
 * @param {string} fileName - The filename (without extension)
 * @returns {Promise<string>} - The filename that was saved
 */
export const saveProjectToFile = async (projectData, fileName) => {
  const fileContent = {
    projectName: fileName,
    lastModified: new Date().toISOString(),
    version: "1.0",
    projectData: projectData
  };

  const jsonString = JSON.stringify(fileContent, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.cpi`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return `${fileName}.cpi`;
};

/**
 * Open and parse a .cpi file
 * @returns {Promise<Object>} - Object containing fileName and projectData
 */
export const openProjectFromFile = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cpi,.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        
        // Validate file structure
        if (!parsed.projectData) {
          throw new Error('Invalid project file format');
        }

        const fileName = file.name.replace('.cpi', '').replace('.json', '');
        
        resolve({
          fileName: fileName,
          projectData: parsed.projectData,
          lastModified: parsed.lastModified || new Date().toISOString()
        });
      } catch (error) {
        reject(new Error(`Failed to load project file: ${error.message}`));
      }
    };

    input.click();
  });
};

/**
 * Validate project data structure
 * @param {Object} data - The data to validate
 * @returns {boolean} - True if valid
 */
export const validateProjectData = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for at least some expected fields
  const hasBasicStructure = (
    'problemStatement' in data ||
    'metrics' in data ||
    'improvements' in data ||
    'controls' in data
  );
  
  return hasBasicStructure;
};

/**
 * Create a backup of current data to localStorage
 * @param {Object} projectData - The project data to backup
 * @param {string} fileName - The filename
 */
export const createAutoSaveBackup = (projectData, fileName) => {
  try {
    const backup = {
      fileName: fileName || 'Untitled',
      projectData: projectData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('coachpi_autosave', JSON.stringify(backup));
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
};

/**
 * Retrieve auto-save backup from localStorage
 * @returns {Object|null} - The backup data or null if none exists
 */
export const getAutoSaveBackup = () => {
  try {
    const backup = localStorage.getItem('coachpi_autosave');
    if (backup) {
      return JSON.parse(backup);
    }
  } catch (error) {
    console.error('Failed to retrieve auto-save:', error);
  }
  return null;
};

/**
 * Clear auto-save backup
 */
export const clearAutoSaveBackup = () => {
  try {
    localStorage.removeItem('coachpi_autosave');
  } catch (error) {
    console.error('Failed to clear auto-save:', error);
  }
};

/**
 * Check if there are unsaved changes
 * @param {Object} currentData - Current project data
 * @param {Object} savedData - Last saved project data
 * @returns {boolean} - True if there are unsaved changes
 */
export const hasUnsavedChanges = (currentData, savedData) => {
  if (!savedData) return true;
  return JSON.stringify(currentData) !== JSON.stringify(savedData);
};
