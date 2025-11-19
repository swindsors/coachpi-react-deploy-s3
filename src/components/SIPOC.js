import React, { useState } from 'react';
import './SIPOC.css';

function SIPOC({ onComplete }) {
  const [processName, setProcessName] = useState('');
  const [suppliers, setSuppliers] = useState(['']);
  const [inputs, setInputs] = useState(['']);
  const [processSteps, setProcessSteps] = useState(['']);
  const [outputs, setOutputs] = useState(['']);
  const [customers, setCustomers] = useState(['']);
  const [isStarted, setIsStarted] = useState(false);

  const addItem = (array, setArray) => {
    setArray([...array, '']);
  };

  const removeItem = (array, setArray, index) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setArray(newArray);
    }
  };

  const updateItem = (array, setArray, index, value) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const handleStart = () => {
    if (processName.trim()) {
      setIsStarted(true);
    }
  };

  const handleComplete = () => {
    const sipocData = {
      processName,
      suppliers: suppliers.filter(s => s.trim()),
      inputs: inputs.filter(i => i.trim()),
      processSteps: processSteps.filter(p => p.trim()),
      outputs: outputs.filter(o => o.trim()),
      customers: customers.filter(c => c.trim())
    };
    
    if (onComplete) {
      onComplete(sipocData);
    }
  };

  const handleReset = () => {
    setProcessName('');
    setSuppliers(['']);
    setInputs(['']);
    setProcessSteps(['']);
    setOutputs(['']);
    setCustomers(['']);
    setIsStarted(false);
  };

  const isComplete = () => {
    return suppliers.some(s => s.trim()) &&
           inputs.some(i => i.trim()) &&
           processSteps.some(p => p.trim()) &&
           outputs.some(o => o.trim()) &&
           customers.some(c => c.trim());
  };

  if (!isStarted) {
    return (
      <div className="sipoc-container">
        <div className="sipoc-header">
          <h3>📊 SIPOC Diagram Builder</h3>
          <p className="sipoc-description">
            SIPOC (Suppliers, Inputs, Process, Outputs, Customers) is a high-level process mapping tool 
            used to define the scope of a process improvement project. It provides a structured way to 
            identify all relevant elements of a process.
          </p>
        </div>

        <div className="process-name-section">
          <label htmlFor="processName">Process Name:</label>
          <input
            type="text"
            id="processName"
            className="form-control"
            placeholder="Enter the name of the process you want to map (e.g., 'Order Fulfillment Process')"
            value={processName}
            onChange={(e) => setProcessName(e.target.value)}
          />
          <button 
            className="btn btn-primary-sipoc" 
            onClick={handleStart}
            disabled={!processName.trim()}
          >
            Start Building SIPOC
          </button>
        </div>

        <div className="sipoc-example">
          <strong>What is SIPOC?</strong>
          <div className="sipoc-definitions">
            <div className="def-item">
              <span className="def-icon">🏭</span>
              <div>
                <strong>Suppliers:</strong> Who provides inputs to the process?
                <div className="example-text">Example: Vendors, departments, systems</div>
              </div>
            </div>
            <div className="def-item">
              <span className="def-icon">📥</span>
              <div>
                <strong>Inputs:</strong> What materials, information, or resources are needed?
                <div className="example-text">Example: Purchase orders, raw materials, data</div>
              </div>
            </div>
            <div className="def-item">
              <span className="def-icon">⚙️</span>
              <div>
                <strong>Process:</strong> What are the high-level steps? (3-7 steps)
                <div className="example-text">Example: Receive → Review → Approve → Execute</div>
              </div>
            </div>
            <div className="def-item">
              <span className="def-icon">📤</span>
              <div>
                <strong>Outputs:</strong> What does the process produce?
                <div className="example-text">Example: Completed orders, reports, products</div>
              </div>
            </div>
            <div className="def-item">
              <span className="def-icon">👥</span>
              <div>
                <strong>Customers:</strong> Who receives the outputs?
                <div className="example-text">Example: End users, next department, clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sipoc-container">
      <div className="sipoc-header">
        <div>
          <h3>📊 SIPOC Diagram: {processName}</h3>
          <p className="sipoc-description">Complete each section to build your SIPOC diagram</p>
        </div>
        <button className="btn-reset" onClick={handleReset}>🔄 Start Over</button>
      </div>

      <div className="sipoc-grid">
        {/* Suppliers */}
        <div className="sipoc-column">
          <div className="column-header suppliers-header">
            <span className="column-icon">🏭</span>
            <h4>Suppliers</h4>
          </div>
          <p className="column-description">Who provides inputs?</p>
          {suppliers.map((supplier, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                className="form-control"
                placeholder="Enter supplier..."
                value={supplier}
                onChange={(e) => updateItem(suppliers, setSuppliers, index, e.target.value)}
              />
              {suppliers.length > 1 && (
                <button 
                  className="btn-remove-small"
                  onClick={() => removeItem(suppliers, setSuppliers, index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="btn-add-small" onClick={() => addItem(suppliers, setSuppliers)}>
            + Add Supplier
          </button>
        </div>

        {/* Inputs */}
        <div className="sipoc-column">
          <div className="column-header inputs-header">
            <span className="column-icon">📥</span>
            <h4>Inputs</h4>
          </div>
          <p className="column-description">What is needed?</p>
          {inputs.map((input, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                className="form-control"
                placeholder="Enter input..."
                value={input}
                onChange={(e) => updateItem(inputs, setInputs, index, e.target.value)}
              />
              {inputs.length > 1 && (
                <button 
                  className="btn-remove-small"
                  onClick={() => removeItem(inputs, setInputs, index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="btn-add-small" onClick={() => addItem(inputs, setInputs)}>
            + Add Input
          </button>
        </div>

        {/* Process */}
        <div className="sipoc-column process-column">
          <div className="column-header process-header">
            <span className="column-icon">⚙️</span>
            <h4>Process</h4>
          </div>
          <p className="column-description">High-level steps (3-7)</p>
          {processSteps.map((step, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                className="form-control"
                placeholder={`Step ${index + 1}...`}
                value={step}
                onChange={(e) => updateItem(processSteps, setProcessSteps, index, e.target.value)}
              />
              {processSteps.length > 1 && (
                <button 
                  className="btn-remove-small"
                  onClick={() => removeItem(processSteps, setProcessSteps, index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="btn-add-small" onClick={() => addItem(processSteps, setProcessSteps)}>
            + Add Step
          </button>
        </div>

        {/* Outputs */}
        <div className="sipoc-column">
          <div className="column-header outputs-header">
            <span className="column-icon">📤</span>
            <h4>Outputs</h4>
          </div>
          <p className="column-description">What is produced?</p>
          {outputs.map((output, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                className="form-control"
                placeholder="Enter output..."
                value={output}
                onChange={(e) => updateItem(outputs, setOutputs, index, e.target.value)}
              />
              {outputs.length > 1 && (
                <button 
                  className="btn-remove-small"
                  onClick={() => removeItem(outputs, setOutputs, index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="btn-add-small" onClick={() => addItem(outputs, setOutputs)}>
            + Add Output
          </button>
        </div>

        {/* Customers */}
        <div className="sipoc-column">
          <div className="column-header customers-header">
            <span className="column-icon">👥</span>
            <h4>Customers</h4>
          </div>
          <p className="column-description">Who receives outputs?</p>
          {customers.map((customer, index) => (
            <div key={index} className="input-row">
              <input
                type="text"
                className="form-control"
                placeholder="Enter customer..."
                value={customer}
                onChange={(e) => updateItem(customers, setCustomers, index, e.target.value)}
              />
              {customers.length > 1 && (
                <button 
                  className="btn-remove-small"
                  onClick={() => removeItem(customers, setCustomers, index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="btn-add-small" onClick={() => addItem(customers, setCustomers)}>
            + Add Customer
          </button>
        </div>
      </div>

      <div className="sipoc-actions">
        <button 
          className="btn btn-complete-sipoc" 
          onClick={handleComplete}
          disabled={!isComplete()}
        >
          ✓ Complete SIPOC Diagram
        </button>
      </div>
    </div>
  );
}

export default SIPOC;
