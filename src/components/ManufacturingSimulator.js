import React, { useState, useRef, useEffect } from 'react';
import './ManufacturingSimulator.css';

const ManufacturingSimulator = () => {
  const [stations, setStations] = useState({
    station1: [], // Kitting
    station2: [], // Sub Assembly
    station3: [], // Final Assembly
    station4: [], // Test
    station5: [], // Inspection
    station6: []  // Output
  });

  const [boxCounter, setBoxCounter] = useState(0); // Track total boxes created (starts at 0)
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isSimulationStopped, setIsSimulationStopped] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [jobDialogData, setJobDialogData] = useState({ jobNumber: '', dueDate: '' });
  const [stationWaitTimes, setStationWaitTimes] = useState({
    station1: { totalWaitTime: 0, becameEmptyAt: Date.now() }, // Kitting
    station2: { totalWaitTime: 0, becameEmptyAt: Date.now() }, // Sub Assembly
    station3: { totalWaitTime: 0, becameEmptyAt: Date.now() }, // Final Assembly
    station4: { totalWaitTime: 0, becameEmptyAt: Date.now() }, // Test
    station5: { totalWaitTime: 0, becameEmptyAt: Date.now() }, // Inspection
    station6: { totalWaitTime: 0, becameEmptyAt: Date.now() }  // Output
  });

  // Update current time every second for live timer updates (only if not stopped)
  useEffect(() => {
    if (isSimulationStopped) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulationStopped]);

  // Update wait times when stations change
  useEffect(() => {
    setStationWaitTimes((prev) => {
      const updated = { ...prev };
      Object.keys(stations).forEach((stationKey) => {
        const stationIsEmpty = stations[stationKey].length === 0;
        const wasTrackingEmpty = prev[stationKey].becameEmptyAt !== null;

        if (stationIsEmpty && !wasTrackingEmpty) {
          // Station just became empty, start tracking
          updated[stationKey] = {
            ...prev[stationKey],
            becameEmptyAt: Date.now()
          };
        } else if (!stationIsEmpty && wasTrackingEmpty) {
          // Station is now occupied, stop tracking and add to total
          const waitTime = Date.now() - prev[stationKey].becameEmptyAt;
          updated[stationKey] = {
            totalWaitTime: prev[stationKey].totalWaitTime + waitTime,
            becameEmptyAt: null
          };
        }
      });
      return updated;
    });
  }, [stations]);
  
  const handleDragStart = (e, box, fromStation) => {
    console.log('Drag started:', box.name, 'from', fromStation);
    const data = { box, fromStation };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toStation) => {
    e.preventDefault();
    console.log('Drop event triggered on', toStation);
    
    // Retrieve data from dataTransfer
    const data = e.dataTransfer.getData('text/plain');
    console.log('Retrieved data:', data);
    
    if (!data || data.trim() === '') {
      console.log('No data found or empty data');
      return;
    }
    
    let box, fromStation;
    try {
      const parsed = JSON.parse(data);
      box = parsed.box;
      fromStation = parsed.fromStation;
    } catch (error) {
      console.error('Error parsing drag data:', error);
      return;
    }
    console.log('Moving box:', box.name, 'from', fromStation, 'to', toStation);
    
    // Don't drop on the same station
    if (fromStation === toStation) {
      console.log('Same station, canceling drop');
      return;
    }

    setStations((prev) => {
      const boxToMove = prev[fromStation].find(b => b.id === box.id);
      if (!boxToMove) {
        console.log('Box not found');
        return prev;
      }

      // Calculate time spent in current station
      const now = Date.now();
      const timeInStation = now - boxToMove.enteredStationAt;
      
      // Calculate work time in current station
      let workTimeInStation = 0;
      if (boxToMove.isWorking && boxToMove.workStartedAt) {
        workTimeInStation = now - boxToMove.workStartedAt;
      }
      
      // Calculate wait time in current station (time in station minus work time)
      const waitTimeInStation = timeInStation - workTimeInStation;
      
      // Accumulate total work and wait times
      const finalWorkTime = (boxToMove.totalWorkTime || 0) + workTimeInStation;
      const finalWaitTime = (boxToMove.totalWaitTime || 0) + waitTimeInStation;
      
      // Check if moving to station 6 (final output station)
      const isCompleting = toStation === 'station6';
      
      // Update box with time tracking - reset work status when moving
      const updatedBox = {
        ...boxToMove,
        enteredStationAt: isCompleting ? boxToMove.enteredStationAt : now,
        completedAt: isCompleting ? now : undefined,
        stationTimes: {
          ...boxToMove.stationTimes,
          [fromStation]: (boxToMove.stationTimes[fromStation] || 0) + timeInStation,
          [toStation]: 0
        },
        isWorking: false, // Stop work when moving to new station
        workStartedAt: null,
        totalWorkTime: finalWorkTime, // Save accumulated work time
        totalWaitTime: finalWaitTime  // Save accumulated wait time
      };

      console.log('Successfully moving box');
      return {
        ...prev,
        [fromStation]: prev[fromStation].filter(b => b.id !== box.id),
        [toStation]: [...prev[toStation], updatedBox]
      };
    });
  };

  const addBox = () => {
    if (isSimulationStopped) return;
    setJobDialogData({ jobNumber: '', dueDate: '' });
    setShowJobDialog(true);
  };

  const handleJobDialogSubmit = () => {
    if (!jobDialogData.jobNumber) {
      alert('Please enter a job number');
      return;
    }
    
    const newId = `box-${Date.now()}`;
    const newBoxNumber = boxCounter + 1;
    const now = Date.now();
    setBoxCounter(newBoxNumber);
    setStations((prev) => ({
      ...prev,
      station1: [...prev.station1, { 
        id: newId, 
        name: `Job ${jobDialogData.jobNumber || newBoxNumber}`,
        createdAt: now,
        enteredStationAt: now,
        stationTimes: { station1: 0 },
        isWorking: false,
        workStartedAt: null,
        totalWorkTime: 0,
        totalWaitTime: 0,
        jobNumber: jobDialogData.jobNumber || '',
        dueDate: jobDialogData.dueDate || '',
        status: 'green',
        statusReason: '',
        defectCount: 0,
        defects: [], // Array to store defect details
        andonPulls: 0, // Track number of times Andon was pulled
        percentComplete: 0 // User-editable completion percentage
      }]
    }));
    setShowJobDialog(false);
  };

  const handleJobDialogCancel = () => {
    setShowJobDialog(false);
    setJobDialogData({ jobNumber: '', dueDate: '' });
  };

  // Start work on a box
  const handleStartWork = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId && !box.isWorking) {
          return {
            ...box,
            isWorking: true,
            workStartedAt: Date.now()
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Stop work on a box
  const handleStopWork = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId && box.isWorking) {
          const workDuration = Date.now() - box.workStartedAt;
          return {
            ...box,
            isWorking: false,
            workStartedAt: null,
            totalWorkTime: (box.totalWorkTime || 0) + workDuration
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Change status
  const handleChangeStatus = (boxId, stationKey, newStatus) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId) {
          return {
            ...box,
            status: newStatus
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Pull Andon Cord
  const handlePullAndon = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId) {
          return {
            ...box,
            andonActive: true,
            andonPulls: (box.andonPulls || 0) + 1 // Increment counter
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Reset Andon
  const handleResetAndon = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId) {
          return {
            ...box,
            andonActive: false
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Increment defect count
  const incrementDefects = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    // Prompt for defect type
    const defectTypes = [
      '1. Missing part',
      '2. Damaged part', 
      '3. Incorrect connection',
      '4. Other'
    ];
    
    const defectTypeInput = prompt(
      `Select defect type:\n${defectTypes.join('\n')}\n\nEnter number (1-4):`
    );
    
    if (defectTypeInput === null) return; // User cancelled
    
    const defectTypeMap = {
      '1': 'Missing part',
      '2': 'Damaged part',
      '3': 'Incorrect connection',
      '4': 'Other'
    };
    
    const selectedDefectType = defectTypeMap[defectTypeInput] || 'Other';
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId) {
          const newDefect = {
            type: selectedDefectType,
            timestamp: Date.now()
          };
          
          return {
            ...box,
            defectCount: (box.defectCount || 0) + 1,
            defects: [...(box.defects || []), newDefect]
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Decrement defect count
  const decrementDefects = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId && (box.defectCount || 0) > 0) {
          // Remove the last defect from the array
          const updatedDefects = [...(box.defects || [])];
          updatedDefects.pop(); // Remove last defect
          
          return {
            ...box,
            defectCount: box.defectCount - 1,
            defects: updatedDefects
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Increment percent complete by 10
  const incrementPercentComplete = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId) {
          const newPercent = Math.min(100, (box.percentComplete || 0) + 10);
          return {
            ...box,
            percentComplete: newPercent
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  // Decrement percent complete by 10
  const decrementPercentComplete = (boxId, stationKey) => {
    if (isSimulationStopped) return;
    
    setStations((prev) => {
      const updatedStation = prev[stationKey].map(box => {
        if (box.id === boxId) {
          const newPercent = Math.max(0, (box.percentComplete || 0) - 10);
          return {
            ...box,
            percentComplete: newPercent
          };
        }
        return box;
      });
      
      return {
        ...prev,
        [stationKey]: updatedStation
      };
    });
  };

  const showMetrics = () => {
    setIsSimulationStopped(true);
  };

  const hideMetrics = () => {
    setIsSimulationStopped(false);
    setCurrentTime(Date.now());
  };

  const resetFactory = () => {
    if (window.confirm('Are you sure you want to reset the factory? This will clear all sections and data.')) {
      setStations({
        station1: [],
        station2: [],
        station3: [],
        station4: [],
        station5: [],
        station6: []
      });
      setBoxCounter(0);
      setIsSimulationStopped(false);
      setStationWaitTimes({
        station1: { totalWaitTime: 0, becameEmptyAt: Date.now() },
        station2: { totalWaitTime: 0, becameEmptyAt: Date.now() },
        station3: { totalWaitTime: 0, becameEmptyAt: Date.now() },
        station4: { totalWaitTime: 0, becameEmptyAt: Date.now() },
        station5: { totalWaitTime: 0, becameEmptyAt: Date.now() },
        station6: { totalWaitTime: 0, becameEmptyAt: Date.now() }
      });
      setCurrentTime(Date.now());
    }
  };

  // Calculate comprehensive summary
  const calculateSummary = () => {
    const allBoxes = Object.values(stations).flat();
    const totalStationWaitTime = Object.values(stationWaitTimes).reduce((sum, station) => {
      let wait = station.totalWaitTime;
      if (station.becameEmptyAt !== null) {
        wait += (currentTime - station.becameEmptyAt);
      }
      return sum + wait;
    }, 0);

    // Calculate defect statistics
    const totalDefects = allBoxes.reduce((sum, box) => sum + (box.defectCount || 0), 0);
    const totalUnits = allBoxes.length;
    const defectsPerUnit = totalUnits > 0 ? (totalDefects / totalUnits).toFixed(2) : 0;
    
    // Calculate Andon pulls
    const totalAndonPulls = allBoxes.reduce((sum, box) => sum + (box.andonPulls || 0), 0);
    
    // Collect all defects with section info
    const allDefects = [];
    allBoxes.forEach(box => {
      if (box.defects && box.defects.length > 0) {
        box.defects.forEach(defect => {
          allDefects.push({
            section: box.name,
            jobNumber: box.jobNumber,
            type: defect.type,
            timestamp: defect.timestamp
          });
        });
      }
    });
    
    // Sort defects by timestamp (newest first)
    allDefects.sort((a, b) => b.timestamp - a.timestamp);

    const boxSummaries = allBoxes.map(box => {
      const times = getBoxTimes(box, null);
      const currentStationTime = currentTime - box.enteredStationAt;
      
      // Calculate work and wait times
      let workTime = box.totalWorkTime || 0;
      if (box.isWorking && box.workStartedAt) {
        workTime += (currentTime - box.workStartedAt);
      }
      
      const totalTime = Object.values(box.stationTimes || {}).reduce((sum, time) => sum + time, 0) + currentStationTime;
      const waitTime = totalTime - workTime;
      
      return {
        name: box.name,
        station1: box.stationTimes?.station1 || 0,
        station2: box.stationTimes?.station2 || 0,
        station3: box.stationTimes?.station3 || 0,
        workTime: workTime,
        waitTime: waitTime,
        total: totalTime
      };
    });

    return { 
      totalStationWaitTime, 
      boxSummaries, 
      totalDefects, 
      totalUnits, 
      defectsPerUnit,
      allDefects,
      totalAndonPulls
    };
  };

  // Helper function to format time in seconds
  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate current time in station, work time, and wait time
  const getBoxTimes = (box, currentStationKey) => {
    const now = currentTime;
    
    // Calculate total work time (accumulated + current if working)
    let totalWorkTime = box.totalWorkTime || 0;
    if (box.isWorking && box.workStartedAt) {
      totalWorkTime += (now - box.workStartedAt);
    }
    
    // Calculate time in current station
    const timeInStation = now - box.enteredStationAt;
    
    // Total time across all stations
    const totalTime = Object.values(box.stationTimes || {}).reduce((sum, time) => sum + time, 0) + timeInStation;
    
    // Wait time is simply total time minus work time
    const totalWaitTime = totalTime - totalWorkTime;
    
    return {
      workTime: formatTime(totalWorkTime),
      waitTime: formatTime(totalWaitTime),
      stationTime: formatTime(timeInStation),
      total: formatTime(totalTime)
    };
  };

  // Calculate wait time for a station
  const getStationWaitTime = (stationKey) => {
    const waitData = stationWaitTimes[stationKey];
    let totalWait = waitData.totalWaitTime;
    
    // If currently empty, add current empty time
    if (waitData.becameEmptyAt !== null) {
      totalWait += (currentTime - waitData.becameEmptyAt);
    }
    
    return formatTime(totalWait);
  };

  const Station = ({ title, stationKey }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = () => {
      dragCounter.current++;
      setIsDragOver(true);
    };

    const handleDragLeave = () => {
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragOver(false);
      }
    };

    const waitTime = getStationWaitTime(stationKey);
    const isEmpty = stations[stationKey].length === 0;

    return (
      <div
        className="station-card"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          dragCounter.current = 0;
          setIsDragOver(false);
          handleDrop(e, stationKey);
        }}
      >
        <h3>{title}</h3>
        <div className={`boxes-container ${isDragOver ? 'drag-over' : ''}`}>
          {stations[stationKey].map((box) => {
            const isCompleted = stationKey === 'station6' && box.completedAt;
            
            if (isCompleted) {
              // Show summary for completed boxes
              const totalTime = Object.values(box.stationTimes || {}).reduce((sum, time) => sum + time, 0);
              return (
                <div
                  key={box.id}
                  className="box completed"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, box, stationKey)}
                >
                  <div className="box-name">✓ {box.name} - COMPLETED</div>
                  <div className="box-summary">
                    <div className="summary-title">Time Summary:</div>
                    <div className="summary-row">Station 1: {formatTime(box.stationTimes.station1 || 0)}</div>
                    <div className="summary-row">Station 2: {formatTime(box.stationTimes.station2 || 0)}</div>
                    <div className="summary-row">Station 3: {formatTime(box.stationTimes.station3 || 0)}</div>
                    <div className="summary-total">Total Time: {formatTime(totalTime)}</div>
                  </div>
                </div>
              );
            } else {
              // Show live timers for in-progress boxes
              const times = getBoxTimes(box, stationKey);
              return (
                <div
                  key={box.id}
                  className={`box ${box.isWorking ? 'working' : 'waiting'} status-${box.status} ${box.andonActive ? 'andon-active' : ''}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, box, stationKey)}
                >
                  <div className="box-name">
                    <strong>Job {box.jobNumber || 'N/A'}</strong>
                    <span className={`status-badge ${box.isWorking ? 'working' : 'waiting'}`}>
                      {box.isWorking ? '🔨 WORKING' : '⏸️ WAITING'}
                    </span>
                  </div>
                  
                  {/* Section Details - Display Only */}
                  {box.dueDate && (
                    <div className="section-details">
                      <div className="detail-display">
                        <strong>Due:</strong> {box.dueDate}
                      </div>
                    </div>
                  )}
                  
                  <div className="box-timer">
                    <div className="timer-row">💼 Work: {times.workTime}</div>
                    <div className="timer-row">⏳ Wait: {times.waitTime}</div>
                    <div className="timer-row">🕐 Total: {times.total}</div>
                  </div>
                  <div className="work-controls">
                    {!box.isWorking ? (
                      <button 
                        className="btn-start-work" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartWork(box.id, stationKey);
                        }}
                        disabled={isSimulationStopped}
                      >
                        ▶️ Start Work
                      </button>
                    ) : (
                      <button 
                        className="btn-stop-work" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopWork(box.id, stationKey);
                        }}
                        disabled={isSimulationStopped}
                      >
                        ⏸️ Stop Work
                      </button>
                    )}
                  </div>
                  <div className="status-controls">
                    <button
                      className={`btn-status ${box.status === 'green' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(box.id, stationKey, 'green');
                      }}
                      disabled={isSimulationStopped}
                    >
                      🟢
                    </button>
                    <button
                      className={`btn-status ${box.status === 'yellow' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(box.id, stationKey, 'yellow');
                      }}
                      disabled={isSimulationStopped}
                    >
                      🟡
                    </button>
                    <button
                      className={`btn-status ${box.status === 'red' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(box.id, stationKey, 'red');
                      }}
                      disabled={isSimulationStopped}
                    >
                      🔴
                    </button>
                  </div>
                  <div className="andon-controls">
                    {!box.andonActive ? (
                      <button
                        className="btn-andon-pull"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePullAndon(box.id, stationKey);
                        }}
                        disabled={isSimulationStopped}
                      >
                        🚨 Pull Andon Cord
                      </button>
                    ) : (
                      <button
                        className="btn-andon-reset"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetAndon(box.id, stationKey);
                        }}
                        disabled={isSimulationStopped}
                      >
                        ✅ Reset Andon
                      </button>
                    )}
                  </div>
                  
                  {/* Defect Counter */}
                  <div className="defect-counter">
                    <button
                      className="btn-defect-decrement"
                      onClick={(e) => {
                        e.stopPropagation();
                        decrementDefects(box.id, stationKey);
                      }}
                      disabled={isSimulationStopped || (box.defectCount || 0) === 0}
                    >
                      −
                    </button>
                    <div className="defect-display">
                      <span className="defect-label">Defects:</span>
                      <span className="defect-count">{box.defectCount || 0}</span>
                    </div>
                    <button
                      className="btn-defect-increment"
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementDefects(box.id, stationKey);
                      }}
                      disabled={isSimulationStopped}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Percent Complete Indicator */}
                  <div className="percent-complete-container">
                    <button
                      className="btn-percent-decrement"
                      onClick={(e) => {
                        e.stopPropagation();
                        decrementPercentComplete(box.id, stationKey);
                      }}
                      disabled={isSimulationStopped || (box.percentComplete || 0) === 0}
                    >
                      −
                    </button>
                    <div className="percent-display">
                      <span className="percent-label">% Complete:</span>
                      <span className="percent-value">{box.percentComplete || 0}%</span>
                    </div>
                    <button
                      className="btn-percent-increment"
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementPercentComplete(box.id, stationKey);
                      }}
                      disabled={isSimulationStopped || (box.percentComplete || 0) >= 100}
                    >
                      +
                    </button>
                    <div className="percent-complete-bar">
                      <div 
                        className="percent-complete-fill"
                        style={{ width: `${box.percentComplete || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div className="station-count">{stations[stationKey].length} item(s)</div>
        <div className={`wait-time ${isEmpty ? 'waiting' : ''}`}>
          ⏳ Wait Time: {waitTime}
        </div>
      </div>
    );
  };

  const summary = isSimulationStopped ? calculateSummary() : null;

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h2>Visual Factory</h2>
        <p className="simulator-description">Drag and drop sections between stations to visualize your manufacturing process</p>
      </div>

      <div className="control-buttons">
        <button className="add-box-btn" onClick={addBox} disabled={isSimulationStopped}>
          ➕ Add Section to Kitting
        </button>
        {!isSimulationStopped ? (
          <button className="metrics-btn" onClick={showMetrics}>
            📊 Report Metrics
          </button>
        ) : (
          <button className="resume-btn" onClick={hideMetrics}>
            ▶️ Hide Metrics
          </button>
        )}
        <button className="reset-btn" onClick={resetFactory}>
          🔄 Reset Factory
        </button>
      </div>

      {isSimulationStopped && summary && (
        <div className="simulation-summary">
          <h3>📊 Simulation Summary</h3>
          
          {/* Defect Statistics */}
          <div className="summary-section">
            <h4>Quality Metrics:</h4>
            <div className="quality-metrics">
              <div className="quality-metric">
                <span className="metric-label">Total Defects:</span>
                <span className="metric-value">{summary.totalDefects}</span>
              </div>
              <div className="quality-metric">
                <span className="metric-label">Total Units:</span>
                <span className="metric-value">{summary.totalUnits}</span>
              </div>
              <div className="quality-metric highlight">
                <span className="metric-label">Defects Per Unit:</span>
                <span className="metric-value">{summary.defectsPerUnit}</span>
              </div>
              <div className="quality-metric andon-metric">
                <span className="metric-label">Andon Cord Pulls:</span>
                <span className="metric-value">{summary.totalAndonPulls}</span>
              </div>
            </div>
          </div>
          
          {/* Defect List */}
          {summary.allDefects.length > 0 && (
            <div className="summary-section">
              <h4>Defect Log:</h4>
              <div className="defects-table">
                <div className="table-header">
                  <span>Section</span>
                  <span>Job #</span>
                  <span>Defect Type</span>
                  <span>Time Logged</span>
                </div>
                {summary.allDefects.map((defect, idx) => (
                  <div key={idx} className="table-row">
                    <span>{defect.section}</span>
                    <span>{defect.jobNumber || 'N/A'}</span>
                    <span className="defect-type">{defect.type}</span>
                    <span>{new Date(defect.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="summary-section">
            <h4>Station Wait Times (Empty Time):</h4>
            <div className="wait-times-grid">
              <div className="wait-item">Kitting: {getStationWaitTime('station1')}</div>
              <div className="wait-item">Sub Assembly: {getStationWaitTime('station2')}</div>
              <div className="wait-item">Final Assembly: {getStationWaitTime('station3')}</div>
              <div className="wait-item">Test: {getStationWaitTime('station4')}</div>
              <div className="wait-item">Inspection: {getStationWaitTime('station5')}</div>
              <div className="wait-item">Output: {getStationWaitTime('station6')}</div>
              <div className="wait-item total">Total Wait Time: {formatTime(summary.totalStationWaitTime)}</div>
            </div>
          </div>
          <div className="summary-section">
            <h4>Box Time Analysis:</h4>
            <div className="boxes-summary-table">
              <div className="table-header">
                <span>Box</span>
                <span>Work Time</span>
                <span>Wait Time</span>
                <span>Total Time</span>
              </div>
              {summary.boxSummaries.map((box, idx) => (
                <div key={idx} className="table-row">
                  <span>{box.name}</span>
                  <span className="work-col">💼 {formatTime(box.workTime)}</span>
                  <span className="wait-col">⏳ {formatTime(box.waitTime)}</span>
                  <span className="total-col">🕐 {formatTime(box.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="manufacturing-line">
        <Station title="Kitting" stationKey="station1" />
        <div className="station-arrow">→</div>
        <Station title="Sub Assembly" stationKey="station2" />
        <div className="station-arrow">→</div>
        <Station title="Final Assembly" stationKey="station3" />
        <div className="station-arrow">→</div>
        <Station title="Test" stationKey="station4" />
        <div className="station-arrow">→</div>
        <Station title="Inspection" stationKey="station5" />
        <div className="station-arrow">→</div>
        <Station title="Ready to Ship" stationKey="station6" />
      </div>

      <div className="simulator-footer">
        <div className="simulator-stats">
          <div className="stat-item">
            <span className="stat-label">Total Sections:</span>
            <span className="stat-value">
              {Object.values(stations).reduce((sum, s) => sum + s.length, 0)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In Progress:</span>
            <span className="stat-value">
              {stations.station2.length + stations.station3.length + stations.station4.length + stations.station5.length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed:</span>
            <span className="stat-value">{stations.station6.length}</span>
          </div>
        </div>
      </div>

      {/* Job Dialog Modal */}
      {showJobDialog && (
        <div className="modal-overlay" onClick={handleJobDialogCancel}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Job</h3>
            <div className="dialog-form">
              <div className="form-group">
                <label>Job Number:</label>
                <input
                  type="text"
                  value={jobDialogData.jobNumber}
                  onChange={(e) => setJobDialogData({ ...jobDialogData, jobNumber: e.target.value })}
                  placeholder="Enter job number"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Due Date:</label>
                <input
                  type="date"
                  value={jobDialogData.dueDate}
                  onChange={(e) => setJobDialogData({ ...jobDialogData, dueDate: e.target.value })}
                />
              </div>
              <div className="dialog-buttons">
                <button className="btn-cancel" onClick={handleJobDialogCancel}>Cancel</button>
                <button className="btn-submit" onClick={handleJobDialogSubmit}>Add Job</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturingSimulator;