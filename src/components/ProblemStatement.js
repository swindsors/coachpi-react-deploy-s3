import React, { useState, useEffect } from 'react';
import './StepComponent.css';

function ProblemStatement({ data, onUpdate }) {
  const [problemStatement, setProblemStatement] = useState(data.problemStatement || '');
  const [projectName, setProjectName] = useState(data.projectName || '');
  const [stakeholders, setStakeholders] = useState(data.stakeholders || '');
  const [scope, setScope] = useState(data.scope || '');

  useEffect(() => {
    onUpdate({
      problemStatement,
      projectName,
      stakeholders,
      scope
    });
  }, [problemStatement, projectName, stakeholders, scope]);

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
