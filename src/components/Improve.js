import React, { useState, useEffect } from 'react';
import './StepComponent.css';

function Improve({ data, onUpdate }) {
  const [improvements, setImprovements] = useState(data.improvements || []);
  const [newImprovement, setNewImprovement] = useState({ action: '', owner: '', timeline: '', status: 'planned' });

  useEffect(() => {
    onUpdate({ improvements });
  }, [improvements]);

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
