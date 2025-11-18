import React, { useState, useEffect } from 'react';
import './StepComponent.css';

function Analyze({ data, onUpdate }) {
  const [rootCauses, setRootCauses] = useState(data.rootCauses || '');
  const [dataAnalysis, setDataAnalysis] = useState(data.dataAnalysis || '');
  const [keyFindings, setKeyFindings] = useState(data.keyFindings || '');

  useEffect(() => {
    onUpdate({
      rootCauses,
      dataAnalysis,
      keyFindings
    });
  }, [rootCauses, dataAnalysis, keyFindings]);

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
