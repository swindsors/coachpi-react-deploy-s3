import React, { useState } from 'react';
import './ProcessMap.css';

function ProcessMap({ onComplete, existingMap, sipocDiagrams }) {
  const [processName, setProcessName] = useState(existingMap?.processName || '');
  const [steps, setSteps] = useState(existingMap?.steps || []);
  const [newStep, setNewStep] = useState({ name: '', type: 'Process', description: '' });
  const [isStarted, setIsStarted] = useState(!!existingMap);
  const [showSipocImport, setShowSipocImport] = useState(false);

  const handleImportFromSipoc = (sipoc) => {
    if (!processName) {
      setProcessName(sipoc.processName);
    }
    
    // Start with a Start step
    const importedSteps = [{ id: Date.now(), name: 'Start', type: 'Start', description: '' }];
    
    // Add all SIPOC process steps as Process type steps
    sipoc.processSteps.forEach((stepName, index) => {
      importedSteps.push({
        id: Date.now() + index + 1,
        name: stepName,
        type: 'Process',
        description: ''
      });
    });
    
    setSteps(importedSteps);
    setIsStarted(true);
    setShowSipocImport(false);
  };

  const stepTypes = [
    { value: 'Start', label: 'Start/End', icon: '⬭' },
    { value: 'Process', label: 'Process Step', icon: '▭' },
    { value: 'Decision', label: 'Decision Point', icon: '◇' },
    { value: 'Document', label: 'Document', icon: '📄' },
    { value: 'Data', label: 'Data/Input', icon: '⬟' }
  ];

  const handleStart = () => {
    if (processName.trim()) {
      setIsStarted(true);
      // Add start step automatically
      setSteps([{ id: Date.now(), name: 'Start', type: 'Start', description: '' }]);
    }
  };

  const addStep = () => {
    if (newStep.name.trim()) {
      setSteps([...steps, { ...newStep, id: Date.now() }]);
      setNewStep({ name: '', type: 'Process', description: '' });
    }
  };

  const removeStep = (id) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const moveStep = (index, direction) => {
    if (index === 0 && direction === -1) return; // Can't move start step up
    if (index === steps.length - 1 && direction === 1) return; // Can't move last step down
    
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + direction];
    newSteps[index + direction] = temp;
    setSteps(newSteps);
  };

  const handleComplete = () => {
    // Add end step
    const completedSteps = [...steps, { id: Date.now(), name: 'End', type: 'Start', description: '' }];
    const processMapData = {
      processName,
      steps: completedSteps
    };
    if (onComplete) {
      onComplete(processMapData);
    }
  };

  const handleReset = () => {
    setProcessName('');
    setSteps([]);
    setNewStep({ name: '', type: 'Process', description: '' });
    setIsStarted(false);
  };

  const getStepIcon = (type) => {
    const stepType = stepTypes.find(st => st.value === type);
    return stepType ? stepType.icon : '▭';
  };

  if (!isStarted) {
    return (
      <div className="process-map-container">
        <div className="process-map-header">
          <h3>🗺️ Process Map Builder</h3>
          <p className="process-map-description">
            Create a visual map of your process showing the sequence of steps, decision points, and flow. 
            This helps identify bottlenecks, redundancies, and improvement opportunities.
          </p>
        </div>

        <div className="process-name-section">
          <label htmlFor="processName">Process Name:</label>
          <input
            type="text"
            id="processName"
            className="form-control"
            placeholder="Enter the name of the process to map (e.g., 'Customer Order Processing')"
            value={processName}
            onChange={(e) => setProcessName(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              className="btn btn-primary-process-map" 
              onClick={handleStart}
              disabled={!processName.trim()}
            >
              Start Building Process Map
            </button>
            {sipocDiagrams && sipocDiagrams.length > 0 && (
              <button 
                className="btn btn-secondary-process-map" 
                onClick={() => setShowSipocImport(!showSipocImport)}
              >
                📋 Import from SIPOC
              </button>
            )}
          </div>
        </div>

        {showSipocImport && sipocDiagrams && sipocDiagrams.length > 0 && (
          <div className="sipoc-import-section">
            <h4>Select a SIPOC Diagram to Import:</h4>
            <p className="helper-text">The process steps from your SIPOC diagram will be imported as a starting point.</p>
            <div className="sipoc-list">
              {sipocDiagrams.map((sipoc, index) => (
                <div key={index} className="sipoc-import-card">
                  <div className="sipoc-import-header">
                    <strong>{sipoc.processName}</strong>
                    <span className="step-count-badge">{sipoc.processSteps?.length || 0} steps</span>
                  </div>
                  <div className="sipoc-steps-preview">
                    {sipoc.processSteps?.slice(0, 3).map((step, idx) => (
                      <div key={idx} className="step-preview-item">
                        {idx + 1}. {step}
                      </div>
                    ))}
                    {sipoc.processSteps?.length > 3 && (
                      <div className="step-preview-item" style={{ fontStyle: 'italic', color: '#666' }}>
                        ...and {sipoc.processSteps.length - 3} more
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn-import" 
                    onClick={() => handleImportFromSipoc(sipoc)}
                  >
                    ✓ Import This Process
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="process-map-info">
          <h4>Process Map Symbols:</h4>
          <div className="symbols-grid">
            {stepTypes.map(type => (
              <div key={type.value} className="symbol-item">
                <span className="symbol-icon">{type.icon}</span>
                <strong>{type.label}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="process-map-container">
      <div className="process-map-header">
        <div>
          <h3>🗺️ Process Map: {processName}</h3>
          <p className="process-map-description">Add steps to build your process flow</p>
        </div>
        <button className="btn-reset" onClick={handleReset}>🔄 Start Over</button>
      </div>

      <div className="add-step-section">
        <h4>Add Process Step</h4>
        <div className="step-input-grid">
          <input
            type="text"
            className="form-control"
            placeholder="Step Name"
            value={newStep.name}
            onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
          />
          <select
            className="form-control"
            value={newStep.type}
            onChange={(e) => setNewStep({ ...newStep, type: e.target.value })}
          >
            {stepTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control"
            placeholder="Description (optional)"
            value={newStep.description}
            onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
          />
          <button className="btn-add" onClick={addStep}>+ Add Step</button>
        </div>
      </div>

      <div className="process-flow-section">
        <h4>Process Flow ({steps.length} steps)</h4>
        <div className="process-flow">
          {steps.map((step, index) => (
            <div key={step.id} className="flow-item">
              <div className={`process-step-box step-type-${step.type.toLowerCase()}`}>
                <div className="step-header-row">
                  <span className="step-icon">{getStepIcon(step.type)}</span>
                  <span className="step-name">{step.name}</span>
                  {index !== 0 && (
                    <div className="step-controls">
                      <button 
                        className="btn-move" 
                        onClick={() => moveStep(index, -1)}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button 
                        className="btn-move" 
                        onClick={() => moveStep(index, 1)}
                        disabled={index === steps.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button 
                        className="btn-remove-step" 
                        onClick={() => removeStep(step.id)}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                {step.description && (
                  <div className="step-description">{step.description}</div>
                )}
                <div className="step-type-label">{step.type}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="flow-arrow">↓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="process-map-actions">
        <button 
          className="btn btn-complete-process-map" 
          onClick={handleComplete}
          disabled={steps.length < 2}
        >
          ✓ Complete Process Map
        </button>
        <p className="helper-text" style={{ marginTop: '10px', marginBottom: '0' }}>
          Add at least one process step to complete the map
        </p>
      </div>
    </div>
  );
}

export default ProcessMap;
