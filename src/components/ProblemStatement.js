import React, { useState, useEffect } from 'react';
import './StepComponent.css';
import SIPOC from './SIPOC';

function ProblemStatement({ data, onUpdate }) {
  const [problemStatement, setProblemStatement] = useState(data.problemStatement || '');
  const [projectName, setProjectName] = useState(data.projectName || '');
  const [stakeholders, setStakeholders] = useState(data.stakeholders || '');
  const [scope, setScope] = useState(data.scope || '');
  const [sipocDiagrams, setSipocDiagrams] = useState(data.sipocDiagrams || []);
  const [showSIPOC, setShowSIPOC] = useState(false);

  useEffect(() => {
    onUpdate({
      problemStatement,
      projectName,
      stakeholders,
      scope,
      sipocDiagrams
    });
  }, [problemStatement, projectName, stakeholders, scope, sipocDiagrams]);

  const handleSIPOCComplete = (sipocData) => {
    setSipocDiagrams([...sipocDiagrams, sipocData]);
    setShowSIPOC(false);
  };

  return (
    <div className="step-component">
      <div className="step-header">
        <h2>Define Phase: Problem Statement</h2>
        <p className="step-description">
          Clearly define the problem you're trying to solve. A good problem statement should be specific, 
          measurable, and focused on the impact to the business or customer.
        </p>
      </div>

      <div className="form-section">
        <button 
          className="btn-add" 
          onClick={() => setShowSIPOC(!showSIPOC)}
          style={{ marginBottom: '20px' }}
        >
          {showSIPOC ? '✕ Close SIPOC Tool' : '📊 Launch SIPOC Diagram Builder'}
        </button>

        {showSIPOC && (
          <SIPOC onComplete={handleSIPOCComplete} />
        )}

        {sipocDiagrams.length > 0 && (
          <div className="info-card" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderLeft: '4px solid #2196f3', marginBottom: '20px' }}>
            <h4 style={{ color: '#1976d2' }}>✓ Completed SIPOC Diagrams: {sipocDiagrams.length}</h4>
            {sipocDiagrams.map((sipoc, idx) => (
              <div key={idx} style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '8px' }}>
                <strong style={{ color: '#1976d2', fontSize: '1.1rem' }}>{sipoc.processName}</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px', fontSize: '0.9rem' }}>
                  <div>
                    <strong>Suppliers:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {sipoc.suppliers.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong>Inputs:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {sipoc.inputs.map((inp, i) => <li key={i}>{inp}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong>Process:</strong>
                    <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {sipoc.processSteps.map((p, i) => <li key={i}>{p}</li>)}
                    </ol>
                  </div>
                  <div>
                    <strong>Outputs:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {sipoc.outputs.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong>Customers:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {sipoc.customers.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            type="text"
            id="projectName"
            className="form-control"
            placeholder="Give your project a descriptive name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="problemStatement">Problem Statement</label>
          <textarea
            id="problemStatement"
            className="form-control textarea-large"
            placeholder="Describe the problem in detail. What is happening? What is the impact? Who is affected?"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            rows={6}
          />
          <div className="helper-text">
            <strong>Tip:</strong> Include the current state, desired state, and the gap between them.
            Example: "Customer wait times have increased by 40% over the past 6 months, resulting in 
            increased complaints and decreased satisfaction scores."
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="stakeholders">Key Stakeholders</label>
          <textarea
            id="stakeholders"
            className="form-control"
            placeholder="List the key stakeholders involved or affected by this problem"
            value={stakeholders}
            onChange={(e) => setStakeholders(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="scope">Project Scope</label>
          <textarea
            id="scope"
            className="form-control"
            placeholder="Define what is in scope and what is out of scope for this project"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="info-card">
        <h3>📋 DMAIC Framework - Define Phase</h3>
        <p>
          In the Define phase, we establish the foundation of the project by clearly identifying 
          the problem and setting boundaries. Focus on:
        </p>
        <ul>
          <li>What specifically is the problem?</li>
          <li>When and where does it occur?</li>
          <li>How does it impact the business or customers?</li>
          <li>Who needs to be involved?</li>
        </ul>
      </div>
    </div>
  );
}

export default ProblemStatement;
