import React, { useState, useEffect } from 'react';
import './StepComponent.css';

function Measure({ data, onUpdate }) {
  const [metrics, setMetrics] = useState(data.metrics || []);
  const [newMetric, setNewMetric] = useState({ name: '', baseline: '', target: '', unit: '' });

  useEffect(() => {
    onUpdate({ metrics });
  }, [metrics]);

  const addMetric = () => {
    if (newMetric.name && newMetric.baseline) {
      setMetrics([...metrics, { ...newMetric, id: Date.now() }]);
      setNewMetric({ name: '', baseline: '', target: '', unit: '' });
    }
  };

  const removeMetric = (id) => {
    setMetrics(metrics.filter(m => m.id !== id));
  };

  return (
    <div className="step-component">
      <div className="step-header">
        <h2>Measure Phase: Key Metrics</h2>
        <p className="step-description">
          Identify and measure the key performance indicators (KPIs) that will help you understand 
          the current state and track improvement progress.
        </p>
      </div>

      <div className="form-section">
        <h3>Add Metrics to Track</h3>
        <div className="metric-input-row">
          <input
            type="text"
            className="form-control"
            placeholder="Metric Name"
            value={newMetric.name}
            onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Current Baseline"
            value={newMetric.baseline}
            onChange={(e) => setNewMetric({ ...newMetric, baseline: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Target"
            value={newMetric.target}
            onChange={(e) => setNewMetric({ ...newMetric, target: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Unit"
            value={newMetric.unit}
            onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
          />
          <button className="btn btn-add" onClick={addMetric}>+ Add</button>
        </div>

        {metrics.length > 0 && (
          <div className="metrics-list">
            <h4>Current Metrics</h4>
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <div key={metric.id} className="metric-card">
                  <button className="remove-btn" onClick={() => removeMetric(metric.id)}>×</button>
                  <div className="metric-name">{metric.name}</div>
                  <div className="metric-details">
                    <div className="metric-value">
                      <span className="label">Baseline:</span>
                      <span className="value">{metric.baseline} {metric.unit}</span>
                    </div>
                    <div className="metric-value">
                      <span className="label">Target:</span>
                      <span className="value">{metric.target} {metric.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="info-card">
        <h3>📊 DMAIC Framework - Measure Phase</h3>
        <p>
          In the Measure phase, we quantify the problem and establish baseline performance. 
          Key activities include:
        </p>
        <ul>
          <li>Identify critical-to-quality (CTQ) characteristics</li>
          <li>Establish baseline performance metrics</li>
          <li>Set realistic improvement targets</li>
          <li>Ensure data collection methods are reliable</li>
        </ul>
      </div>
    </div>
  );
}

export default Measure;
