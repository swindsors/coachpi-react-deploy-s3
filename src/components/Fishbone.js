import React, { useState } from 'react';
import './FiveWhys.css';

function Fishbone({ onComplete }) {
  const [problem, setProblem] = useState('');
  const [categories, setCategories] = useState({
    methods: { name: 'Methods', causes: [''] },
    machines: { name: 'Machines/Equipment', causes: [''] },
    materials: { name: 'Materials', causes: [''] },
    measurements: { name: 'Measurements', causes: [''] },
    people: { name: 'People', causes: [''] },
    environment: { name: 'Environment', causes: [''] }
  });
  const [rootCause, setRootCause] = useState('');

  const addCause = (category) => {
    setCategories({
      ...categories,
      [category]: {
        ...categories[category],
        causes: [...categories[category].causes, '']
      }
    });
  };

  const updateCause = (category, index, value) => {
    const newCauses = [...categories[category].causes];
    newCauses[index] = value;
    setCategories({
      ...categories,
      [category]: {
        ...categories[category],
        causes: newCauses
      }
    });
  };

  const removeCause = (category, index) => {
    const newCauses = categories[category].causes.filter((_, i) => i !== index);
    setCategories({
      ...categories,
      [category]: {
        ...categories[category],
        causes: newCauses.length > 0 ? newCauses : ['']
      }
    });
  };

  const handleComplete = () => {
    if (problem.trim()) {
      const result = {
        problem,
        categories: Object.entries(categories).reduce((acc, [key, value]) => {
          acc[key] = {
            name: value.name,
            causes: value.causes.filter(c => c.trim())
          };
          return acc;
        }, {}),
        rootCause,
        timestamp: new Date().toISOString()
      };
      onComplete(result);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      methods: '⚙️',
      machines: '🔧',
      materials: '📦',
      measurements: '📊',
      people: '👥',
      environment: '🌍'
    };
    return icons[category] || '📌';
  };

  const getCategoryColor = (category) => {
    const colors = {
      methods: '#e3f2fd',
      machines: '#f3e5f5',
      materials: '#fff3e0',
      measurements: '#e8f5e9',
      people: '#fce4ec',
      environment: '#e0f2f1'
    };
    return colors[category] || '#f5f5f5';
  };

  const getCategoryBorder = (category) => {
    const borders = {
      methods: '#2196f3',
      machines: '#9c27b0',
      materials: '#ff9800',
      measurements: '#4caf50',
      people: '#e91e63',
      environment: '#009688'
    };
    return borders[category] || '#666';
  };

  return (
    <div style={{ 
      padding: '30px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '2px solid #9c27b0'
    }}>
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h3 style={{ color: '#9c27b0', marginBottom: '10px', fontSize: '1.5rem' }}>
          🐟 Fishbone (Ishikawa) Diagram
        </h3>
        <p style={{ color: '#666', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Identify potential causes across 6 categories (6M's). This helps systematically explore 
          all possible root causes of a problem.
        </p>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
          Problem Statement (The Effect)
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="What is the problem you're analyzing?"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          style={{ fontSize: '1.05rem', padding: '12px' }}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '25px'
      }}>
        {Object.entries(categories).map(([key, category]) => (
          <div 
            key={key}
            style={{ 
              background: getCategoryColor(key),
              padding: '20px',
              borderRadius: '12px',
              border: `3px solid ${getCategoryBorder(key)}`
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: `2px solid ${getCategoryBorder(key)}`
            }}>
              <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>
                {getCategoryIcon(key)}
              </span>
              <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
                {category.name}
              </h4>
            </div>

            {category.causes.map((cause, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Cause ${index + 1}...`}
                  value={cause}
                  onChange={(e) => updateCause(key, index, e.target.value)}
                  style={{ flex: 1 }}
                />
                {category.causes.length > 1 && (
                  <button
                    onClick={() => removeCause(key, index)}
                    style={{
                      background: '#ff5252',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => addCause(key)}
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: 'white',
                color: getCategoryBorder(key),
                border: `2px solid ${getCategoryBorder(key)}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                width: '100%'
              }}
            >
              + Add Cause
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
          🎯 Root Cause Conclusion
        </label>
        <textarea
          className="form-control"
          placeholder="Based on your analysis, what is the primary root cause?"
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
          rows={3}
          style={{ fontSize: '1rem' }}
        />
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>
          After identifying causes in each category, determine which one(s) are most likely 
          the root cause of the problem.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={handleComplete}
          disabled={!problem.trim()}
          style={{
            padding: '12px 30px',
            background: problem.trim() ? 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: problem.trim() ? 'pointer' : 'not-allowed',
            fontWeight: '700',
            fontSize: '1rem',
            boxShadow: problem.trim() ? '0 4px 15px rgba(156, 39, 176, 0.3)' : 'none'
          }}
        >
          ✓ Complete Fishbone Analysis
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#666'
      }}>
        <strong>💡 Tip:</strong> The 6M categories help ensure you consider all possible causes:
        <ul style={{ marginBottom: '0', marginTop: '8px' }}>
          <li><strong>Methods:</strong> Procedures, processes, policies</li>
          <li><strong>Machines/Equipment:</strong> Technology, tools, machinery</li>
          <li><strong>Materials:</strong> Raw materials, supplies, information</li>
          <li><strong>Measurements:</strong> Data, metrics, inspection processes</li>
          <li><strong>People:</strong> Training, skills, knowledge, staffing</li>
          <li><strong>Environment:</strong> Physical conditions, culture, external factors</li>
        </ul>
      </div>
    </div>
  );
}

export default Fishbone;
