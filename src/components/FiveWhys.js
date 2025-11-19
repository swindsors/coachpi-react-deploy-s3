import React, { useState } from 'react';
import './FiveWhys.css';

function FiveWhys({ onComplete }) {
  const [problem, setProblem] = useState('');
  const [whys, setWhys] = useState(['', '', '', '', '']);
  const [currentWhy, setCurrentWhy] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [rootCause, setRootCause] = useState('');

  const handleStart = () => {
    if (problem.trim()) {
      setIsStarted(true);
    }
  };

  const handleWhyChange = (index, value) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    setWhys(newWhys);
  };

  const handleNext = () => {
    if (currentWhy < 4 && whys[currentWhy].trim()) {
      setCurrentWhy(currentWhy + 1);
    }
  };

  const handlePrevious = () => {
    if (currentWhy > 0) {
      setCurrentWhy(currentWhy - 1);
    }
  };

  const handleComplete = () => {
    const result = {
      problem,
      whys: whys.filter(w => w.trim() !== ''),
      rootCause
    };
    if (onComplete) {
      onComplete(result);
    }
  };

  const handleMarkAsRootCause = (index) => {
    const selectedWhy = whys[index];
    setRootCause(selectedWhy);
    setTimeout(() => {
      const result = {
        problem,
        whys: whys.slice(0, index + 1).filter(w => w.trim() !== ''),
        rootCause: selectedWhy
      };
      if (onComplete) {
        onComplete(result);
      }
    }, 100);
  };

  const handleReset = () => {
    setProblem('');
    setWhys(['', '', '', '', '']);
    setCurrentWhy(0);
    setIsStarted(false);
    setRootCause('');
  };

  if (!isStarted) {
    return (
      <div className="five-whys-container">
        <div className="five-whys-header">
          <h3>🔍 5 Whys Analysis</h3>
          <p className="five-whys-description">
            The 5 Whys technique helps uncover the root cause of a problem by repeatedly asking "Why?" 
            Start by stating your problem, then ask "Why did this happen?" up to five times.
          </p>
        </div>
        
        <div className="problem-input-section">
          <label htmlFor="problem">State the Problem:</label>
          <textarea
            id="problem"
            className="form-control"
            placeholder="Describe the problem you want to analyze..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={4}
          />
          <button 
            className="btn btn-primary-five-whys" 
            onClick={handleStart}
            disabled={!problem.trim()}
          >
            Start 5 Whys Analysis
          </button>
        </div>

        <div className="five-whys-example">
          <strong>Example:</strong>
          <div className="example-content">
            <div className="example-item"><strong>Problem:</strong> Customers are waiting too long</div>
            <div className="example-item"><strong>Why 1:</strong> There aren't enough staff during peak hours</div>
            <div className="example-item"><strong>Why 2:</strong> Scheduling doesn't account for peak demand</div>
            <div className="example-item"><strong>Why 3:</strong> No data analysis on customer traffic patterns</div>
            <div className="example-item"><strong>Why 4:</strong> No system in place to track patterns</div>
            <div className="example-item"><strong>Why 5:</strong> Management hasn't prioritized this investment</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="five-whys-container">
      <div className="five-whys-header">
        <h3>🔍 5 Whys Analysis in Progress</h3>
        <button className="btn-reset" onClick={handleReset}>🔄 Start Over</button>
      </div>

      <div className="problem-display">
        <div className="problem-label">Problem Statement:</div>
        <div className="problem-text">{problem}</div>
      </div>

      <div className="whys-progress">
        {[0, 1, 2, 3, 4].map((index) => (
          <div 
            key={index} 
            className={`why-step ${index === currentWhy ? 'active' : ''} ${index < currentWhy ? 'completed' : ''} ${whys[index].trim() ? 'filled' : ''}`}
          >
            {index < currentWhy ? '✓' : index + 1}
          </div>
        ))}
      </div>

      <div className="whys-content">
        {whys.map((why, index) => (
          <div 
            key={index} 
            className={`why-item ${index === currentWhy ? 'active' : ''} ${index > currentWhy ? 'hidden' : ''}`}
          >
            <label className="why-label">Why #{index + 1}: Why did this happen?</label>
            <textarea
              className="form-control"
              placeholder={`Enter the reason for ${index === 0 ? 'the problem' : `Why #${index}`}...`}
              value={why}
              onChange={(e) => handleWhyChange(index, e.target.value)}
              rows={3}
              disabled={index !== currentWhy}
            />
          </div>
        ))}
      </div>

      <div className="whys-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={handlePrevious}
          disabled={currentWhy === 0}
        >
          ← Previous
        </button>
        <div className="progress-indicator">
          Step {currentWhy + 1} of 5
        </div>
        {currentWhy < 4 ? (
          <button 
            className="btn btn-primary-five-whys" 
            onClick={handleNext}
            disabled={!whys[currentWhy].trim()}
          >
            Next →
          </button>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={() => document.getElementById('root-cause-section').scrollIntoView({ behavior: 'smooth' })}
            disabled={!whys[currentWhy].trim()}
          >
            Define Root Cause →
          </button>
        )}
      </div>

      {whys.filter(w => w.trim()).length >= 3 && (
        <div id="root-cause-section" className="root-cause-section">
          <h4>Identify the Root Cause</h4>
          <p>Based on your analysis, what is the fundamental root cause?</p>
          <textarea
            className="form-control"
            placeholder="State the root cause identified through this analysis..."
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            rows={3}
          />
          <button 
            className="btn btn-complete" 
            onClick={handleComplete}
            disabled={!rootCause.trim()}
          >
            ✓ Complete Analysis
          </button>
        </div>
      )}

      <div className="analysis-summary">
        <h4>Your Analysis So Far:</h4>
        <div className="summary-chain">
          <div className="summary-item problem-item">
            <strong>Problem:</strong> {problem}
          </div>
          {whys.map((why, index) => 
            why.trim() && (
              <div key={index} className="summary-item">
                <div className="arrow">↓</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <strong>Why #{index + 1}:</strong> {why}
                  </div>
                  {!rootCause && index <= currentWhy && (
                    <button
                      onClick={() => handleMarkAsRootCause(index)}
                      style={{
                        padding: '6px 12px',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}
                      title="Mark this as the root cause and complete the analysis"
                    >
                      🎯 Mark as Root Cause
                    </button>
                  )}
                </div>
              </div>
            )
          )}
          {rootCause && (
            <div className="summary-item root-cause-item">
              <div className="arrow">↓</div>
              <strong>🎯 Root Cause:</strong> {rootCause}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FiveWhys;
