import React, { useState, useEffect } from 'react';
import './StepComponent.css';
import FiveWhys from './FiveWhys';
import Fishbone from './Fishbone';

function Analyze({ data, onUpdate }) {
  const [rootCauses, setRootCauses] = useState(data.rootCauses || '');
  const [dataAnalysis, setDataAnalysis] = useState(data.dataAnalysis || '');
  const [keyFindings, setKeyFindings] = useState(data.keyFindings || '');
  const [fiveWhysResults, setFiveWhysResults] = useState(data.fiveWhysResults || []);
  const [showFiveWhys, setShowFiveWhys] = useState(false);
  const [fishboneResults, setFishboneResults] = useState(data.fishboneResults || []);
  const [showFishbone, setShowFishbone] = useState(false);
  const [processWastes, setProcessWastes] = useState(data.processWastes || {});
  const [newWaste, setNewWaste] = useState({ description: '', severity: 'Medium' });
  const [selectedStep, setSelectedStep] = useState(null);
  const [wasteRootCauses, setWasteRootCauses] = useState(data.wasteRootCauses || {});
  const [editingRootCause, setEditingRootCause] = useState(null);
  
  const processMaps = data.processMaps || [];
  const allProcessSteps = processMaps.flatMap(map => 
    map.steps.map(step => ({
      ...step,
      processName: map.processName,
      mapId: map.processName
    }))
  );

  // Sync local state with incoming data prop (for file loading)
  useEffect(() => {
    setRootCauses(data.rootCauses || '');
    setDataAnalysis(data.dataAnalysis || '');
    setKeyFindings(data.keyFindings || '');
    setFiveWhysResults(data.fiveWhysResults || []);
    setFishboneResults(data.fishboneResults || []);
    setProcessWastes(data.processWastes || {});
    setWasteRootCauses(data.wasteRootCauses || {});
  }, [data]);

  useEffect(() => {
    onUpdate({
      rootCauses,
      dataAnalysis,
      keyFindings,
      fiveWhysResults,
      fishboneResults,
      processWastes,
      wasteRootCauses
    });
  }, [rootCauses, dataAnalysis, keyFindings, fiveWhysResults, fishboneResults, processWastes, wasteRootCauses]);

  const getAllWastes = () => {
    const allWastes = [];
    Object.entries(processWastes).forEach(([stepKey, wastes]) => {
      const [processName, stepId] = stepKey.split('-');
      const step = allProcessSteps.find(s => s.id === parseInt(stepId) && s.processName === processName);
      wastes.forEach(waste => {
        allWastes.push({
          ...waste,
          stepKey,
          stepName: step?.name || 'Unknown Step',
          processName: step?.processName || 'Unknown Process'
        });
      });
    });
    return allWastes.sort((a, b) => {
      const severityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  const handleRootCauseUpdate = (wasteId, rootCause) => {
    setWasteRootCauses({
      ...wasteRootCauses,
      [wasteId]: rootCause
    });
    setEditingRootCause(null);
  };

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

  const handleFishboneComplete = (result) => {
    setFishboneResults([...fishboneResults, result]);
    setShowFishbone(false);
    
    // Auto-populate root causes field if empty or append to it
    if (!rootCauses) {
      const categoriesText = Object.entries(result.categories)
        .filter(([_, cat]) => cat.causes.length > 0)
        .map(([key, cat]) => `${cat.name}:\n${cat.causes.map(c => `  - ${c}`).join('\n')}`)
        .join('\n\n');
      setRootCauses(`Problem: ${result.problem}\n\n${categoriesText}\n\nRoot Cause: ${result.rootCause || '(To be determined)'}`);
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

        <button 
          className="btn-add" 
          onClick={() => setShowFishbone(!showFishbone)}
          style={{ marginBottom: '20px' }}
        >
          {showFishbone ? '✕ Close Fishbone Tool' : '🐟 Launch Fishbone Diagram Tool'}
        </button>

        {showFishbone && (
          <Fishbone onComplete={handleFishboneComplete} />
        )}

        {fishboneResults.length > 0 && (
          <div className="info-card" style={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', borderLeft: '4px solid #9c27b0', marginBottom: '20px' }}>
            <h4 style={{ color: '#6a1b9a' }}>✓ Completed Fishbone Analyses: {fishboneResults.length}</h4>
            {fishboneResults.map((result, idx) => (
              <div key={idx} style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '8px' }}>
                <strong>Analysis {idx + 1}:</strong> {result.problem}
                <br />
                <strong style={{ color: '#6a1b9a' }}>Root Cause:</strong> {result.rootCause || '(To be determined)'}
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

        {getAllWastes().length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3>Waste Root Cause Identification</h3>
            <div className="helper-text" style={{ marginBottom: '20px' }}>
              For each identified waste, determine the underlying root cause. Ask "Why does this waste occur?" 
              to identify the fundamental reason that must be addressed.
            </div>

            <div style={{ marginBottom: '30px' }}>
              {getAllWastes().map((waste) => (
                <div key={waste.id} style={{
                  marginBottom: '20px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  borderLeft: `6px solid ${waste.severity === 'High' ? '#d32f2f' : waste.severity === 'Medium' ? '#f57c00' : '#388e3c'}`
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                          {waste.description}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          📍 {waste.stepName} • {waste.processName}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: waste.severity === 'High' ? '#ffebee' : waste.severity === 'Medium' ? '#fff3e0' : '#e8f5e9',
                        color: waste.severity === 'High' ? '#d32f2f' : waste.severity === 'Medium' ? '#f57c00' : '#388e3c'
                      }}>
                        {waste.severity}
                      </div>
                    </div>
                  </div>

                  {editingRootCause === waste.id ? (
                    <div>
                      <textarea
                        className="form-control"
                        placeholder="What is the root cause of this waste? (Why does it occur?)"
                        value={wasteRootCauses[waste.id] || ''}
                        onChange={(e) => setWasteRootCauses({ ...wasteRootCauses, [waste.id]: e.target.value })}
                        rows={3}
                        style={{ marginBottom: '10px' }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleRootCauseUpdate(waste.id, wasteRootCauses[waste.id])}
                          style={{
                            padding: '8px 16px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                          }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingRootCause(null)}
                          style={{
                            padding: '8px 16px',
                            background: '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {wasteRootCauses[waste.id] ? (
                        <div style={{
                          padding: '15px',
                          background: '#f0f7ff',
                          borderRadius: '8px',
                          border: '1px solid #b3d9ff',
                          marginBottom: '10px'
                        }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1976d2', marginBottom: '6px' }}>
                            🎯 Root Cause:
                          </div>
                          <div style={{ color: '#333', lineHeight: '1.6' }}>
                            {wasteRootCauses[waste.id]}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          padding: '12px',
                          background: '#fff3e0',
                          borderRadius: '8px',
                          border: '1px solid #ffe0b2',
                          marginBottom: '10px',
                          fontSize: '0.9rem',
                          color: '#e65100'
                        }}>
                          ⚠️ Root cause not yet identified
                        </div>
                      )}
                      <button
                        onClick={() => setEditingRootCause(waste.id)}
                        style={{
                          padding: '8px 16px',
                          background: wasteRootCauses[waste.id] ? '#667eea' : '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}
                      >
                        {wasteRootCauses[waste.id] ? '✏️ Edit Root Cause' : '🎯 Identify Root Cause'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="info-card" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderLeft: '4px solid #2196f3' }}>
              <h4 style={{ color: '#1565c0' }}>💡 Root Cause Analysis Tips</h4>
              <ul style={{ marginBottom: '0' }}>
                <li>Go beyond symptoms to find the underlying cause</li>
                <li>Ask "Why?" multiple times to dig deeper</li>
                <li>Look for systemic issues, not just individual errors</li>
                <li>Consider people, processes, equipment, materials, environment, and management</li>
                <li>Focus on actionable causes that can be addressed</li>
              </ul>
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
            <span 
              className="tool-tag" 
              onClick={() => setShowFiveWhys(true)} 
              style={{ cursor: 'pointer' }}
              title="Click to launch 5 Whys Analysis Tool"
            >
              5 Whys
            </span>
            <span 
              className="tool-tag"
              onClick={() => setShowFishbone(true)}
              style={{ cursor: 'pointer' }}
              title="Click to launch Fishbone Diagram Tool"
            >
              Fishbone Diagram
            </span>
            <span className="tool-tag">Pareto Analysis</span>
            <span className="tool-tag">Regression Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analyze;
