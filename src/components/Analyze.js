import React, { useState, useEffect } from 'react';
import './StepComponent.css';
import FiveWhys from './FiveWhys';

function Analyze({ data, onUpdate }) {
  const [rootCauses, setRootCauses] = useState(data.rootCauses || '');
  const [dataAnalysis, setDataAnalysis] = useState(data.dataAnalysis || '');
  const [keyFindings, setKeyFindings] = useState(data.keyFindings || '');
  const [fiveWhysResults, setFiveWhysResults] = useState(data.fiveWhysResults || []);
  const [showFiveWhys, setShowFiveWhys] = useState(false);
  const [processWastes, setProcessWastes] = useState(data.processWastes || {});
  const [newWaste, setNewWaste] = useState({ description: '', severity: 'Medium' });
  const [selectedStep, setSelectedStep] = useState(null);
  
  const processMaps = data.processMaps || [];
  const allProcessSteps = processMaps.flatMap(map => 
    map.steps.map(step => ({
      ...step,
      processName: map.processName,
      mapId: map.processName
    }))
  );

  useEffect(() => {
    onUpdate({
      rootCauses,
      dataAnalysis,
      keyFindings,
      fiveWhysResults,
      processWastes
    });
  }, [rootCauses, dataAnalysis, keyFindings, fiveWhysResults, processWastes]);

  const addWaste = () => {
    if (selectedStep && newWaste.description.trim()) {
      const stepKey = `${selectedStep.processName}-${selectedStep.id}`;
      const existingWastes = processWastes[stepKey] || [];
      setProcessWastes({
        ...processWastes,
        [stepKey]: [...existingWastes, { ...newWaste, id: Date.now() }]
      });
      setNewWaste({ description: '', severity: 'Medium' });
    }
  };

  const removeWaste = (stepKey, wasteId) => {
    setProcessWastes({
      ...processWastes,
      [stepKey]: processWastes[stepKey].filter(w => w.id !== wasteId)
    });
  };

  const getTotalWastesForStep = (step) => {
    const stepKey = `${step.processName}-${step.id}`;
    return processWastes[stepKey]?.length || 0;
  };

  const getWasteSeverityCounts = () => {
    let high = 0, medium = 0, low = 0;
    Object.values(processWastes).forEach(wastes => {
      wastes.forEach(waste => {
        if (waste.severity === 'High') high++;
        else if (waste.severity === 'Medium') medium++;
        else low++;
      });
    });
    return { high, medium, low };
  };

  const handleFiveWhysComplete = (result) => {
    setFiveWhysResults([...fiveWhysResults, result]);
    setShowFiveWhys(false);
    
    // Auto-populate root causes field if empty
    if (!rootCauses) {
      const whysText = result.whys.map((why, idx) => `Why ${idx + 1}: ${why}`).join('\n');
      setRootCauses(`Problem: ${result.problem}\n\n${whysText}\n\nRoot Cause: ${result.rootCause}`);
    }
  };

  return (
    <div className="step-component">
      <div className="step-header">
        <h2>Analyze Phase: Root Cause Analysis</h2>
        <p className="step-description">
          Identify and validate the root causes of the problem using data analysis, 
          process mapping, and analytical tools.
        </p>
      </div>

      <div className="form-section">
        <button 
          className="btn-add" 
          onClick={() => setShowFiveWhys(!showFiveWhys)}
          style={{ marginBottom: '20px' }}
        >
          {showFiveWhys ? '✕ Close 5 Whys Tool' : '🔍 Launch 5 Whys Analysis Tool'}
        </button>

        {showFiveWhys && (
          <FiveWhys onComplete={handleFiveWhysComplete} />
        )}

        {fiveWhysResults.length > 0 && (
          <div className="info-card" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', borderLeft: '4px solid #4caf50', marginBottom: '20px' }}>
            <h4 style={{ color: '#2e7d32' }}>✓ Completed 5 Whys Analyses: {fiveWhysResults.length}</h4>
            {fiveWhysResults.map((result, idx) => (
              <div key={idx} style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '8px' }}>
                <strong>Analysis {idx + 1}:</strong> {result.problem}
                <br />
                <strong style={{ color: '#2e7d32' }}>Root Cause:</strong> {result.rootCause}
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="dataAnalysis">Data Analysis Summary</label>
          <textarea
            id="dataAnalysis"
            className="form-control textarea-large"
            placeholder="Summarize the data you've collected and any patterns or trends observed..."
            value={dataAnalysis}
            onChange={(e) => setDataAnalysis(e.target.value)}
            rows={5}
          />
          <div className="helper-text">
            Consider using tools like: Pareto charts, histograms, scatter plots, process maps
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rootCauses">Root Causes Identified</label>
          <textarea
            id="rootCauses"
            className="form-control textarea-large"
            placeholder="List the root causes identified through your analysis. Use tools like 5 Whys, Fishbone Diagram, or Failure Mode Analysis..."
            value={rootCauses}
            onChange={(e) => setRootCauses(e.target.value)}
            rows={6}
          />
          <div className="helper-text">
            <strong>Tip:</strong> Distinguish between symptoms and root causes. Root causes are the 
            fundamental reasons why the problem exists.
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="keyFindings">Key Findings & Insights</label>
          <textarea
            id="keyFindings"
            className="form-control"
            placeholder="Summarize the most important discoveries from your analysis..."
            value={keyFindings}
            onChange={(e) => setKeyFindings(e.target.value)}
            rows={4}
          />
        </div>

        {allProcessSteps.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3>Process Waste Analysis</h3>
            <div className="helper-text" style={{ marginBottom: '20px' }}>
              <strong>8 Types of Waste (DOWNTIME):</strong> Defects, Overproduction, Waiting, Non-utilized talent, 
              Transportation, Inventory, Motion, Extra-processing. Identify and rank wastes for each process step.
            </div>

            {getWasteSeverityCounts().high + getWasteSeverityCounts().medium + getWasteSeverityCounts().low > 0 && (
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d32f2f' }}>{getWasteSeverityCounts().high}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>High Priority</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>{getWasteSeverityCounts().medium}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Medium Priority</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>{getWasteSeverityCounts().low}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Low Priority</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '30px' }}>
              {allProcessSteps.map((step, index) => {
                const stepKey = `${step.processName}-${step.id}`;
                const stepWastes = processWastes[stepKey] || [];
                
                return (
                  <div key={index} style={{ 
                    marginBottom: '25px', 
                    padding: '20px', 
                    background: 'white', 
                    borderRadius: '12px',
                    border: '2px solid #e0e0e0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>{step.name}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                          {step.processName} - {step.type}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '6px 12px', 
                        background: stepWastes.length > 0 ? '#fff3cd' : '#e8f5e9',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {stepWastes.length} waste{stepWastes.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {selectedStep?.id === step.id ? (
                      <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Describe the waste..."
                            value={newWaste.description}
                            onChange={(e) => setNewWaste({ ...newWaste, description: e.target.value })}
                          />
                          <select
                            className="form-control"
                            value={newWaste.severity}
                            onChange={(e) => setNewWaste({ ...newWaste, severity: e.target.value })}
                          >
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                          </select>
                          <button className="btn-add" onClick={addWaste}>+ Add</button>
                        </div>
                        <button 
                          style={{ 
                            padding: '6px 12px', 
                            background: '#666', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                          onClick={() => setSelectedStep(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        style={{
                          padding: '8px 16px',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          marginTop: '10px'
                        }}
                        onClick={() => setSelectedStep(step)}
                      >
                        + Add Waste
                      </button>
                    )}

                    {stepWastes.length > 0 && (
                      <div style={{ marginTop: '15px' }}>
                        {stepWastes.map((waste) => (
                          <div key={waste.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px', 
                            marginBottom: '8px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${waste.severity === 'High' ? '#d32f2f' : waste.severity === 'Medium' ? '#f57c00' : '#388e3c'}`
                          }}>
                            <div style={{ flex: 1 }}>
                              <div>{waste.description}</div>
                            </div>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              marginLeft: '10px',
                              background: waste.severity === 'High' ? '#ffebee' : waste.severity === 'Medium' ? '#fff3e0' : '#e8f5e9',
                              color: waste.severity === 'High' ? '#d32f2f' : waste.severity === 'Medium' ? '#f57c00' : '#388e3c'
                            }}>
                              {waste.severity}
                            </span>
                            <button 
                              onClick={() => removeWaste(stepKey, waste.id)}
                              style={{
                                marginLeft: '10px',
                                background: '#ff5252',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="info-card">
        <h3>🔍 DMAIC Framework - Analyze Phase</h3>
        <p>
          In the Analyze phase, we dig deep to understand why the problem occurs. 
          Key activities include:
        </p>
        <ul>
          <li>Analyze data to identify patterns and trends</li>
          <li>Develop hypotheses about root causes</li>
          <li>Use statistical tools to validate hypotheses</li>
          <li>Identify the vital few factors that drive the problem</li>
        </ul>
        <div className="tools-section">
          <strong>Common Analysis Tools:</strong>
          <div className="tools-list">
            <span className="tool-tag">5 Whys</span>
            <span className="tool-tag">Fishbone Diagram</span>
            <span className="tool-tag">Pareto Analysis</span>
            <span className="tool-tag">Regression Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analyze;
