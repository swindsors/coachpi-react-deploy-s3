import React, { useState, useEffect } from 'react';
import './StepComponent.css';

function Control({ data, onUpdate }) {
  const [controls, setControls] = useState(data.controls || []);
  const [documentation, setDocumentation] = useState(data.documentation || '');
  const [newControl, setNewControl] = useState({ measure: '', frequency: '', responsible: '' });

  useEffect(() => {
    onUpdate({ controls, documentation });
  }, [controls, documentation]);

  const addControl = () => {
    if (newControl.measure) {
      setControls([...controls, { ...newControl, id: Date.now() }]);
      setNewControl({ measure: '', frequency: '', responsible: '' });
    }
  };

  const removeControl = (id) => {
    setControls(controls.filter(c => c.id !== id));
  };

  return (
    <div className="step-component">
      <div className="step-header">
        <h2>Control Phase: Sustaining Improvements</h2>
        <p className="step-description">
          Establish controls to sustain the gains and ensure the improvements become part of 
          standard operations.
        </p>
      </div>

      <div className="form-section">
        <h3>Add Control Measures</h3>
        <div className="control-input-section">
          <input
            type="text"
            className="form-control"
            placeholder="Control measure or monitoring method..."
            value={newControl.measure}
            onChange={(e) => setNewControl({ ...newControl, measure: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Frequency (e.g., daily, weekly)"
            value={newControl.frequency}
            onChange={(e) => setNewControl({ ...newControl, frequency: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Responsible person"
            value={newControl.responsible}
            onChange={(e) => setNewControl({ ...newControl, responsible: e.target.value })}
          />
          <button className="btn btn-add" onClick={addControl}>+ Add Control</button>
        </div>

        {controls.length > 0 && (
          <div className="controls-list">
            <h4>Active Control Measures</h4>
            <div className="controls-grid">
              {controls.map((control) => (
                <div key={control.id} className="control-card">
                  <button className="remove-btn" onClick={() => removeControl(control.id)}>×</button>
                  <div className="control-measure">{control.measure}</div>
                  <div className="control-details">
                    <div className="control-item">
                      <span className="icon">🔄</span>
                      <span>{control.frequency}</span>
                    </div>
                    <div className="control-item">
                      <span className="icon">👤</span>
                      <span>{control.responsible}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="documentation">Process Documentation</label>
          <textarea
            id="documentation"
            className="form-control textarea-large"
            placeholder="Document the new standard operating procedures, training materials, and handoff plans..."
            value={documentation}
            onChange={(e) => setDocumentation(e.target.value)}
            rows={6}
          />
          <div className="helper-text">
            Include: Updated SOPs, training plans, monitoring dashboards, escalation procedures
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>🎯 DMAIC Framework - Control Phase</h3>
        <p>
          In the Control phase, we ensure improvements are sustained over time. 
          Key activities include:
        </p>
        <ul>
          <li>Develop control plans and monitoring systems</li>
          <li>Document new processes and standards</li>
          <li>Train team members on new procedures</li>
          <li>Establish response plans for variations</li>
          <li>Hand off to process owners for ongoing management</li>
        </ul>
      </div>

      <div className="success-card">
        <h3>🎉 Project Summary</h3>
        <p>
          You've completed all phases of the DMAIC methodology! Your process improvement project 
          has a solid foundation for success. Remember to:
        </p>
        <ul>
          <li>Continue monitoring your control measures</li>
          <li>Celebrate wins with your team</li>
          <li>Share lessons learned</li>
          <li>Look for opportunities for continuous improvement</li>
        </ul>
      </div>
    </div>
  );
}

export default Control;
