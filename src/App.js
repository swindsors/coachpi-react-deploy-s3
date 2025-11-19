import React, { useState } from 'react';
import './App.css';
import ProblemStatement from './components/ProblemStatement';
import Measure from './components/Measure';
import Analyze from './components/Analyze';
import Improve from './components/Improve';
import Control from './components/Control';
import AIAssistant from './components/AIAssistant/AIAssistant';
import { downloadReport } from './utils/reportGenerator';
import { demoData } from './utils/demoData';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [projectData, setProjectData] = useState({
    problemStatement: '',
    metrics: [],
    analysis: '',
    improvements: [],
    controls: []
  });

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
          problemStatement: '',
          metrics: [],
          analysis: '',
          improvements: [],
          controls: []
        });
        setIsDemoMode(false);
      }
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="App">
      <header className="app-header">
        <div>
          <h1>Coach PI - Six Sigma Process Improvement</h1>
          <p className="subtitle">Guide your project through the DMAIC methodology</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
