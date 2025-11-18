import React, { useState } from 'react';
import './App.css';
import ProblemStatement from './components/ProblemStatement';
import Measure from './components/Measure';
import Analyze from './components/Analyze';
import Improve from './components/Improve';
import Control from './components/Control';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
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

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="App">
      <header className="app-header">
        <h1>Coach PI - Six Sigma Process Improvement</h1>
        <p className="subtitle">Guide your project through the DMAIC methodology</p>
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
    </div>
  );
}

export default App;
