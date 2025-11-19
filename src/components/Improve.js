import React, { useState, useEffect } from 'react';
import './StepComponent.css';

function Improve({ data, onUpdate }) {
  const [improvements, setImprovements] = useState(data.improvements || []);
  const [newImprovement, setNewImprovement] = useState({ action: '', owner: '', timeline: '', status: 'planned' });
  const [rootCauseSolutions, setRootCauseSolutions] = useState(data.rootCauseSolutions || {});
  const [editingSolution, setEditingSolution] = useState(null);

  const wasteRootCauses = data.wasteRootCauses || {};
  const processWastes = data.processWastes || {};
  const processMaps = data.processMaps || [];

  // Get all wastes with their root causes
  // Sync local state with incoming data prop (for file loading)
  useEffect(() => {
    setImprovements(data.improvements || []);
    setRootCauseSolutions(data.rootCauseSolutions || {});
  }, [data]);

  const getWastesWithRootCauses = () => {
    const wastesWithRC = [];
    Object.entries(processWastes).forEach(([stepKey, wastes]) => {
      wastes.forEach(waste => {
        if (wasteRootCauses[waste.id]) {
          const [processName, stepId] = stepKey.split('-');
          const allSteps = processMaps.flatMap(map => 
            map.steps.map(step => ({
              ...step,
              processName: map.processName
            }))
          );
          const step = allSteps.find(s => s.id === parseInt(stepId) && s.processName === processName);
          
          wastesWithRC.push({
            ...waste,
            stepKey,
            stepName: step?.name || 'Unknown Step',
            processName: step?.processName || 'Unknown Process',
            rootCause: wasteRootCauses[waste.id]
          });
        }
      });
    });
    return wastesWithRC.sort((a, b) => {
      const severityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  useEffect(() => {
    onUpdate({ improvements, rootCauseSolutions });
  }, [improvements, rootCauseSolutions]);

  const calculateIndexScore = (resources, impact, ease) => {
    return resources * impact * ease;
  };

  const handleSolutionUpdate = (wasteId, solution) => {
    setRootCauseSolutions({
      ...rootCauseSolutions,
      [wasteId]: solution
    });
    setEditingSolution(null);
  };

  const getScoreColor = (score) => {
    if (score >= 100) return '#4caf50'; // High score - green
    if (score >= 50) return '#ff9800';  // Medium score - orange
    return '#f44336'; // Low score - red
  };

  const addImprovement = () => {
    if (newImprovement.action) {
      setImprovements([...improvements, { ...newImprovement, id: Date.now() }]);
      setNewImprovement({ action: '', owner: '', timeline: '', status: 'planned' });
    }
  };

  const removeImprovement = (id) => {
    setImprovements(improvements.filter(i => i.id !== id));
  };

  const updateStatus = (id, status) => {
    setImprovements(improvements.map(i => i.id === id ? { ...i, status } : i));
  };

  return (
    <div className="step-component">
      <div className="step-header">
        <h2>Improve Phase: Solution Implementation</h2>
        <p className="step-description">
          Develop and implement solutions to address the root causes identified in the Analyze phase.
        </p>
      </div>

      <div className="form-section">
        {getWastesWithRootCauses().length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3>Solution Prioritization for Root Causes</h3>
            <div className="helper-text" style={{ marginBottom: '20px' }}>
              For each root cause, propose a solution and rank it on three criteria (1-5 scale):
              <ul style={{ marginTop: '8px', marginBottom: '0' }}>
                <li><strong>Resources Required</strong> (1=Minimal, 5=Substantial)</li>
                <li><strong>Impact</strong> (1=Low, 5=High)</li>
                <li><strong>Ease of Implementation</strong> (1=Difficult, 5=Easy)</li>
              </ul>
              The <strong>Index Score</strong> is calculated by multiplying these three values (max 125).
            </div>

            {getWastesWithRootCauses().map((waste) => {
              const solution = rootCauseSolutions[waste.id] || {};
              const indexScore = solution.resources && solution.impact && solution.ease 
                ? calculateIndexScore(Number(solution.resources), Number(solution.impact), Number(solution.ease))
                : 0;

              return (
                <div key={waste.id} style={{
                  marginBottom: '25px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  borderLeft: `6px solid ${waste.severity === 'High' ? '#d32f2f' : waste.severity === 'Medium' ? '#f57c00' : '#388e3c'}`
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                          {waste.description}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                          📍 {waste.stepName} • {waste.processName}
                        </div>
                        <div style={{ 
                          padding: '10px', 
                          background: '#f0f7ff', 
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          lineHeight: '1.5'
                        }}>
                          <strong style={{ color: '#1976d2' }}>Root Cause:</strong> {waste.rootCause}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        marginLeft: '15px',
                        background: waste.severity === 'High' ? '#ffebee' : waste.severity === 'Medium' ? '#fff3e0' : '#e8f5e9',
                        color: waste.severity === 'High' ? '#d32f2f' : waste.severity === 'Medium' ? '#f57c00' : '#388e3c'
                      }}>
                        {waste.severity}
                      </div>
                    </div>
                  </div>

                  {editingSolution === waste.id ? (
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <textarea
                        className="form-control"
                        placeholder="Describe the proposed solution..."
                        value={solution.description || ''}
                        onChange={(e) => setRootCauseSolutions({ 
                          ...rootCauseSolutions, 
                          [waste.id]: { ...solution, description: e.target.value }
                        })}
                        rows={3}
                        style={{ marginBottom: '15px' }}
                      />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '0.9rem' }}>
                            Resources (1-5)
                          </label>
                          <select
                            className="form-control"
                            value={solution.resources || '3'}
                            onChange={(e) => setRootCauseSolutions({ 
                              ...rootCauseSolutions, 
                              [waste.id]: { ...solution, resources: e.target.value }
                            })}
                          >
                            <option value="1">1 - Minimal</option>
                            <option value="2">2 - Low</option>
                            <option value="3">3 - Moderate</option>
                            <option value="4">4 - Significant</option>
                            <option value="5">5 - Substantial</option>
                          </select>
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '0.9rem' }}>
                            Impact (1-5)
                          </label>
                          <select
                            className="form-control"
                            value={solution.impact || '3'}
                            onChange={(e) => setRootCauseSolutions({ 
                              ...rootCauseSolutions, 
                              [waste.id]: { ...solution, impact: e.target.value }
                            })}
                          >
                            <option value="1">1 - Low</option>
                            <option value="2">2 - Minor</option>
                            <option value="3">3 - Moderate</option>
                            <option value="4">4 - Major</option>
                            <option value="5">5 - High</option>
                          </select>
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '0.9rem' }}>
                            Ease (1-5)
                          </label>
                          <select
                            className="form-control"
                            value={solution.ease || '3'}
                            onChange={(e) => setRootCauseSolutions({ 
                              ...rootCauseSolutions, 
                              [waste.id]: { ...solution, ease: e.target.value }
                            })}
                          >
                            <option value="1">1 - Very Difficult</option>
                            <option value="2">2 - Difficult</option>
                            <option value="3">3 - Moderate</option>
                            <option value="4">4 - Easy</option>
                            <option value="5">5 - Very Easy</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleSolutionUpdate(waste.id, rootCauseSolutions[waste.id])}
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
                          ✓ Save Solution
                        </button>
                        <button
                          onClick={() => setEditingSolution(null)}
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
                      {solution.description ? (
                        <div>
                          <div style={{
                            padding: '15px',
                            background: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0',
                            marginBottom: '15px'
                          }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#166534', marginBottom: '6px' }}>
                              💡 Proposed Solution:
                            </div>
                            <div style={{ color: '#333', lineHeight: '1.6', marginBottom: '12px' }}>
                              {solution.description}
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                              <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Resources</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>{solution.resources}</div>
                              </div>
                              <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Impact</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>{solution.impact}</div>
                              </div>
                              <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Ease</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>{solution.ease}</div>
                              </div>
                              <div style={{ textAlign: 'center', padding: '12px', background: getScoreColor(indexScore), borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'white', marginBottom: '4px', fontWeight: '600' }}>INDEX SCORE</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{indexScore}</div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingSolution(waste.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}
                          >
                            ✏️ Edit Solution
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{
                            padding: '12px',
                            background: '#fff3e0',
                            borderRadius: '8px',
                            border: '1px solid #ffe0b2',
                            marginBottom: '10px',
                            fontSize: '0.9rem',
                            color: '#e65100'
                          }}>
                            ⚠️ Solution not yet defined
                          </div>
                          <button
                            onClick={() => setEditingSolution(waste.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}
                          >
                            💡 Add Solution & Rankings
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h3>Add Improvement Actions</h3>
        <div className="improvement-input-section">
          <textarea
            className="form-control"
            placeholder="Describe the improvement action..."
            value={newImprovement.action}
            onChange={(e) => setNewImprovement({ ...newImprovement, action: e.target.value })}
            rows={2}
          />
          <div className="improvement-meta">
            <input
              type="text"
              className="form-control"
              placeholder="Owner"
              value={newImprovement.owner}
              onChange={(e) => setNewImprovement({ ...newImprovement, owner: e.target.value })}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Timeline"
              value={newImprovement.timeline}
              onChange={(e) => setNewImprovement({ ...newImprovement, timeline: e.target.value })}
            />
            <button className="btn btn-add" onClick={addImprovement}>+ Add Action</button>
          </div>
        </div>

        {improvements.length > 0 && (
          <div className="improvements-list">
            <h4>Improvement Actions</h4>
            {improvements.map((improvement) => (
              <div key={improvement.id} className="improvement-card">
                <button className="remove-btn" onClick={() => removeImprovement(improvement.id)}>×</button>
                <div className="improvement-content">
                  <div className="improvement-action">{improvement.action}</div>
                  <div className="improvement-meta-info">
                    <span className="meta-item">👤 {improvement.owner || 'Unassigned'}</span>
                    <span className="meta-item">📅 {improvement.timeline || 'No timeline'}</span>
                  </div>
                  <div className="status-selector">
                    <label>Status:</label>
                    <select 
                      value={improvement.status} 
                      onChange={(e) => updateStatus(improvement.id, e.target.value)}
                      className="status-dropdown"
                    >
                      <option value="planned">📋 Planned</option>
                      <option value="in-progress">🔄 In Progress</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-card">
        <h3>🚀 DMAIC Framework - Improve Phase</h3>
        <p>
          In the Improve phase, we develop and test solutions to eliminate root causes. 
          Key activities include:
        </p>
        <ul>
          <li>Generate creative solutions targeting root causes</li>
          <li>Evaluate and prioritize solutions</li>
          <li>Pilot test solutions on a small scale</li>
          <li>Implement full-scale improvements</li>
          <li>Measure results against baseline metrics</li>
        </ul>
      </div>
    </div>
  );
}

export default Improve;
