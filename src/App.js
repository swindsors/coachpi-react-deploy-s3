import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ProblemStatement from './components/ProblemStatement';
import Measure from './components/Measure';
import Analyze from './components/Analyze';
import Improve from './components/Improve';
import Control from './components/Control';
import AIAssistant from './components/AIAssistant/AIAssistant';
import { downloadReport } from './utils/reportGenerator';
import { demoData } from './utils/demoData';
import { 
  saveProjectToFile, 
  openProjectFromFile, 
  createAutoSaveBackup,
  getAutoSaveBackup,
  clearAutoSaveBackup,
  hasUnsavedChanges as checkUnsavedChanges
} from './utils/fileManager';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [projectData, setProjectData] = useState({
    // Define Phase
    problemStatement: '',
    projectName: '',
    stakeholders: [],
    scope: '',
    sipocDiagrams: [],
    
    // Measure Phase
    metrics: [],
    processMaps: [],
    baselineSummary: '',
    
    // Analyze Phase
    analysis: '',
    rootCauses: '',
    dataAnalysis: '',
    keyFindings: '',
    fiveWhysResults: [],
    fishboneResults: [],
    processWastes: {},
    wasteRootCauses: {},
    
    // Improve Phase
    improvements: [],
    
    // Control Phase
    controls: [],
    monitoringPlan: '',
    processOwner: '',
    documentationPlan: '',
    sustainmentStrategy: ''
  });
  const [currentFileName, setCurrentFileName] = useState('Untitled');
  const [savedProjectData, setSavedProjectData] = useState(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const autoSaveIntervalRef = useRef(null);

  const steps = [
    { id: 0, name: 'Define', component: ProblemStatement },
    { id: 1, name: 'Measure', component: Measure },
    { id: 2, name: 'Analyze', component: Analyze },
    { id: 3, name: 'Improve', component: Improve },
    { id: 4, name: 'Control', component: Control }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataUpdate = (data) => {
    setProjectData({ ...projectData, ...data });
  };

  const handleDownloadReport = async () => {
    try {
      await downloadReport(projectData);
    } catch (error) {
      alert('Error generating report. Please try again.');
    }
  };

  const handleToggleDemoMode = () => {
    if (!isDemoMode) {
      // Turning demo mode ON - load demo data
      if (window.confirm('Load demo data? This will replace any existing data.')) {
        setProjectData(demoData);
        setIsDemoMode(true);
      }
    } else {
      // Turning demo mode OFF - clear data
      if (window.confirm('Turn off demo mode? This will clear all current data.')) {
        setProjectData({
          // Define Phase
          problemStatement: '',
          projectName: '',
          stakeholders: [],
          scope: '',
          sipocDiagrams: [],
          
          // Measure Phase
          metrics: [],
          processMaps: [],
          baselineSummary: '',
          
          // Analyze Phase
          analysis: '',
          rootCauses: '',
          dataAnalysis: '',
          keyFindings: '',
          fiveWhysResults: [],
          fishboneResults: [],
          processWastes: {},
          wasteRootCauses: {},
          
          // Improve Phase
          improvements: [],
          
          // Control Phase
          controls: [],
          monitoringPlan: '',
          processOwner: '',
          documentationPlan: '',
          sustainmentStrategy: ''
        });
        setIsDemoMode(false);
      }
    }
  };

  // File Management Functions
  const handleNewProject = () => {
    if (checkUnsavedChanges(projectData, savedProjectData)) {
      if (!window.confirm('You have unsaved changes. Create new project anyway?')) {
        return;
      }
    }
    setProjectData({
      // Define Phase
      problemStatement: '',
      projectName: '',
      stakeholders: [],
      scope: '',
      sipocDiagrams: [],
      
      // Measure Phase
      metrics: [],
      processMaps: [],
      baselineSummary: '',
      
      // Analyze Phase
      analysis: '',
      rootCauses: '',
      dataAnalysis: '',
      keyFindings: '',
      fiveWhysResults: [],
      fishboneResults: [],
      processWastes: {},
      wasteRootCauses: {},
      
      // Improve Phase
      improvements: [],
      
      // Control Phase
      controls: [],
      monitoringPlan: '',
      processOwner: '',
      documentationPlan: '',
      sustainmentStrategy: ''
    });
    setCurrentFileName('Untitled');
    setSavedProjectData(null);
    setCurrentStep(0);
    setIsDemoMode(false);
    setShowFileMenu(false);
  };

  const handleOpenProject = async () => {
    if (checkUnsavedChanges(projectData, savedProjectData)) {
      if (!window.confirm('You have unsaved changes. Open another project anyway?')) {
        return;
      }
    }

    try {
      const { fileName, projectData: loadedData } = await openProjectFromFile();
      setProjectData(loadedData);
      setCurrentFileName(fileName);
      setSavedProjectData(loadedData);
      setIsDemoMode(false);
      setShowFileMenu(false);
      alert(`Project "${fileName}" loaded successfully!`);
    } catch (error) {
      if (error.message !== 'No file selected') {
        alert(error.message);
      }
    }
  };

  const handleSaveProject = async () => {
    if (currentFileName === 'Untitled') {
      return handleSaveAsProject();
    }

    try {
      await saveProjectToFile(projectData, currentFileName);
      setSavedProjectData(projectData);
      setShowFileMenu(false);
      alert(`Project saved as "${currentFileName}.cpi"`);
    } catch (error) {
      alert('Failed to save project: ' + error.message);
    }
  };

  const handleSaveAsProject = async () => {
    const fileName = prompt('Enter project name:', currentFileName);
    if (!fileName) return;

    const cleanFileName = fileName.replace('.cpi', '').replace(/[^a-z0-9_-]/gi, '_');
    
    try {
      await saveProjectToFile(projectData, cleanFileName);
      setCurrentFileName(cleanFileName);
      setSavedProjectData(projectData);
      setShowFileMenu(false);
      alert(`Project saved as "${cleanFileName}.cpi"`);
    } catch (error) {
      alert('Failed to save project: ' + error.message);
    }
  };

  const toggleAutoSave = () => {
    setIsAutoSaveEnabled(!isAutoSaveEnabled);
    setShowFileMenu(false);
  };

  // Auto-save effect
  useEffect(() => {
    if (isAutoSaveEnabled) {
      autoSaveIntervalRef.current = setInterval(() => {
        createAutoSaveBackup(projectData, currentFileName);
      }, 60000); // Auto-save every 60 seconds
    } else {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isAutoSaveEnabled, projectData, currentFileName]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S for Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      // Ctrl+O or Cmd+O for Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleOpenProject();
      }
      // Ctrl+N or Cmd+N for New
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectData, savedProjectData, currentFileName]);

  // Check for auto-save backup on mount
  useEffect(() => {
    const backup = getAutoSaveBackup();
    if (backup && backup.projectData) {
      const timeSinceBackup = Date.now() - new Date(backup.timestamp).getTime();
      const minutesAgo = Math.floor(timeSinceBackup / 60000);
      
      if (window.confirm(`Auto-save backup found from ${minutesAgo} minutes ago. Restore it?`)) {
        setProjectData(backup.projectData);
        setCurrentFileName(backup.fileName);
      } else {
        clearAutoSaveBackup();
      }
    }
  }, []);

  // Close file menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFileMenu && !e.target.closest('.file-menu-container')) {
        setShowFileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFileMenu]);

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="App">
      <header className="app-header">
        <div>
          <h1>Coach PI - Six Sigma Process Improvement</h1>
          <p className="subtitle">Guide your project through the DMAIC methodology</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* File Menu Dropdown */}
          <div className="file-menu-container">
            <button 
              className="btn-file-menu"
              onClick={() => setShowFileMenu(!showFileMenu)}
              title="File operations"
            >
              📁 File
            </button>
            {showFileMenu && (
              <div className="file-menu-dropdown">
                <button onClick={handleNewProject} className="file-menu-item">
                  <span>🆕</span> New Project <span className="shortcut">Ctrl+N</span>
                </button>
                <button onClick={handleOpenProject} className="file-menu-item">
                  <span>📂</span> Open Project <span className="shortcut">Ctrl+O</span>
                </button>
                <button onClick={handleSaveProject} className="file-menu-item">
                  <span>💾</span> Save <span className="shortcut">Ctrl+S</span>
                </button>
                <button onClick={handleSaveAsProject} className="file-menu-item">
                  <span>💾</span> Save As...
                </button>
                <div className="file-menu-divider"></div>
                <button onClick={toggleAutoSave} className="file-menu-item">
                  <span>{isAutoSaveEnabled ? '✓' : '○'}</span> Auto-Save (60s)
                </button>
                <div className="file-menu-info">
                  <div className="current-file">
                    📄 {currentFileName}.cpi
                  </div>
                  {checkUnsavedChanges(projectData, savedProjectData) && (
                    <div className="unsaved-indicator">● Unsaved changes</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button 
            className={`btn-demo-mode ${isDemoMode ? 'active' : ''}`}
            onClick={handleToggleDemoMode}
            title={isDemoMode ? "Turn off demo mode" : "Load sample data for demonstration"}
          >
            {isDemoMode ? '✓ Demo Mode ON' : '🎭 Demo Mode'}
          </button>
          <button 
            className="btn-download-report" 
            onClick={handleDownloadReport}
            title="Download your complete project report as a Word document"
          >
            📄 Download Report
          </button>
        </div>
      </header>

      <div className="stepper-container">
        {steps.map((step, index) => (
          <div key={step.id} className="step-item">
            <div className={`step-circle ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="step-label">{step.name}</div>
            {index < steps.length - 1 && <div className={`step-line ${index < currentStep ? 'completed' : ''}`}></div>}
          </div>
        ))}
      </div>

      <div className="content-container">
        <CurrentStepComponent 
          data={projectData} 
          onUpdate={handleDataUpdate}
        />
      </div>

      <div className="navigation-buttons">
        <button 
          className="btn btn-secondary" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </button>
      </div>

      {/* AI Assistant Toggle Button */}
      <button 
        className="ai-assistant-toggle"
        onClick={() => setIsAIAssistantOpen(true)}
        title="Open AI Assistant"
      >
        <span className="toggle-icon">🤖</span>
        <span className="toggle-text">AI Assistant</span>
      </button>

      {/* AI Assistant Sidebar */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        projectData={projectData}
        currentPhase={steps[currentStep].name.toLowerCase()}
      />
    </div>
  );
}

export default App;
