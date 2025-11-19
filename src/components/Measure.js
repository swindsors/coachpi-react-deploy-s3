import React, { useState, useEffect } from 'react';
import './StepComponent.css';
import ProcessMap from './ProcessMap';

function Measure({ data, onUpdate }) {
  const [metrics, setMetrics] = useState(data.metrics || []);
  const [newMetric, setNewMetric] = useState({ name: '', baseline: '', target: '', unit: '', type: 'Primary' });
  const [processMaps, setProcessMaps] = useState(data.processMaps || []);
  const [showProcessMap, setShowProcessMap] = useState(false);
  const [editingMapIndex, setEditingMapIndex] = useState(null);

  // Sync local state with incoming data prop (for file loading)
  useEffect(() => {
    setMetrics(data.metrics || []);
    setProcessMaps(data.processMaps || []);
  }, [data]);

  useEffect(() => {
    onUpdate({ metrics, processMaps });
  }, [metrics, processMaps]);

  const handleProcessMapComplete = (processMapData) => {
    if (editingMapIndex !== null) {
      // Update existing map
      const updatedMaps = [...processMaps];
      updatedMaps[editingMapIndex] = processMapData;
      setProcessMaps(updatedMaps);
      setEditingMapIndex(null);
    } else {
      // Add new map
      setProcessMaps([...processMaps, processMapData]);
    }
    setShowProcessMap(false);
  };

  const handleEditMap = (index) => {
    setEditingMapIndex(index);
    setShowProcessMap(true);
  };

  const handleDeleteMap = (index) => {
    if (window.confirm('Are you sure you want to delete this process map? This action cannot be undone.')) {
      setProcessMaps(processMaps.filter((_, idx) => idx !== index));
    }
  };

  const handleCancelEdit = () => {
    setShowProcessMap(false);
    setEditingMapIndex(null);
  };

  const addMetric = () => {
    if (newMetric.name && newMetric.baseline) {
      setMetrics([...metrics, { ...newMetric, id: Date.now() }]);
      setNewMetric({ name: '', baseline: '', target: '', unit: '', type: 'Primary' });
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
        <button 
          className="btn-add" 
          onClick={() => setShowProcessMap(!showProcessMap)}
          style={{ marginBottom: '20px' }}
        >
          {showProcessMap ? '✕ Close Process Map Tool' : '🗺️ Launch Process Map Builder'}
        </button>

        {showProcessMap && (
          <ProcessMap 
            onComplete={handleProcessMapComplete} 
            existingMap={editingMapIndex !== null ? processMaps[editingMapIndex] : null}
            sipocDiagrams={data.sipocDiagrams || []}
          />
        )}

        {processMaps.length > 0 && (
          <div className="info-card" style={{ background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)', borderLeft: '4px solid #5c6bc0', marginBottom: '20px' }}>
            <h4 style={{ color: '#3f51b5' }}>✓ Completed Process Maps: {processMaps.length}</h4>
            {processMaps.map((map, idx) => (
              <div key={idx} style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '8px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <strong style={{ color: '#3f51b5', fontSize: '1.1rem' }}>{map.processName}</strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditMap(idx)}
                      style={{
                        padding: '6px 12px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteMap(idx)}
                      style={{
                        padding: '6px 12px',
                        background: '#ff5252',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  {map.steps.map((step, stepIdx) => (
                    <div key={stepIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                      <span style={{ fontSize: '1.5rem' }}>{step.type === 'Start' ? '⬭' : step.type === 'Decision' ? '◇' : step.type === 'Document' ? '📄' : step.type === 'Data' ? '⬟' : '▭'}</span>
                      <div>
                        <strong>{step.name}</strong> <span style={{ fontSize: '0.85rem', color: '#666' }}>({step.type})</span>
                        {step.description && <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '2px' }}>{step.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <h3>Add Metrics to Track</h3>
        <div className="helper-text" style={{ marginBottom: '15px' }}>
          <strong>Metric Types:</strong> Primary metrics directly measure your project goal (e.g., defect rate, cycle time). 
          Secondary metrics track related factors that may influence the primary metric (e.g., training hours, supplier quality).
        </div>
        <div className="metric-input-row-extended">
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
          <select
            className="form-control"
            value={newMetric.type}
            onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value })}
          >
            <option value="Primary">Primary</option>
            <option value="Secondary">Secondary</option>
          </select>
          <button className="btn-add" onClick={addMetric}>+ Add</button>
        </div>

        {metrics.length > 0 && (
          <div className="metrics-list">
            <h4>Current Metrics</h4>
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <div key={metric.id} className="metric-card">
                  <button className="remove-btn" onClick={() => removeMetric(metric.id)}>×</button>
                  <div className="metric-header">
                    <div className="metric-name">{metric.name}</div>
                    <span className={`metric-type-badge metric-${metric.type?.toLowerCase() || 'primary'}`}>
                      {metric.type || 'Primary'}
                    </span>
                  </div>
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
