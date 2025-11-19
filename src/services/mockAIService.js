// Mock AI Service - Provides intelligent-sounding responses based on project context
// This will be replaced with real AI API calls in the future

const phaseResponses = {
  define: [
    "Your problem statement is well-structured. Consider adding quantifiable metrics to make it more specific. For example, instead of 'reduce delays', try 'reduce processing time by 30%'.",
    "I notice you have {stakeholderCount} stakeholders defined. Make sure you've identified all key decision-makers and those impacted by the project.",
    "The project scope looks clear. Have you considered potential constraints like budget, timeline, or resource availability?",
    "Strong SIPOC diagram! This gives good visibility into your process boundaries. Consider if there are any hidden suppliers or customers.",
    "Your problem statement addresses the 'what' well. Make sure to also include 'where', 'when', and 'how much' for better clarity.",
  ],
  measure: [
    "Great process map with {stepCount} steps! Look for steps that are pure handoffs or waiting - these are often non-value-added activities.",
    "Your baseline metrics show {metricCount} KPIs. Consider if you need both leading indicators (predictive) and lagging indicators (results).",
    "The target represents a {improvement}% improvement from baseline. Verify this is both ambitious enough to matter and achievable with available resources.",
    "I see you're tracking both primary and secondary metrics. Good practice! Secondary metrics help understand factors that influence your primary goal.",
    "Consider validating your measurement system. Are you confident the data collection method is accurate and consistent?",
  ],
  analyze: [
    "You've identified {wasteCount} process wastes. Have you validated which ones have the biggest impact using data analysis?",
    "Strong 5 Whys analysis! The root cause points to a {causeType} issue. This will help guide your solution approach.",
    "With {highPriorityCount} high-priority wastes, focus your analysis there first. Use Pareto principle - 80% of problems come from 20% of causes.",
    "Your root cause identification is thorough. Now validate with data: can you show correlation between the root cause and the problem?",
    "Consider using a fishbone diagram to categorize root causes into People, Process, Equipment, Materials, Environment, and Management.",
  ],
  improve: [
    "Your solution with index score {topScore} shows high impact with low resources - classic quick win! Consider implementing this first.",
    "With {solutionCount} solutions ranked, prioritize those with scores over 75. These balance impact, resources, and feasibility well.",
    "Good solution descriptions! For implementation, consider a pilot test on a small scale before full rollout.",
    "The solution addresses the root cause of '{rootCause}'. Make sure your improvement action directly eliminates or mitigates this cause.",
    "Remember PDCA: Plan-Do-Check-Act. Start small, measure results, and scale what works.",
  ],
  control: [
    "Strong control plan with {controlCount} measures. Schedule these into regular operational reviews to ensure sustainability.",
    "Make sure your control measures include both process controls (preventing issues) and output controls (detecting issues).",
    "Documentation is key for handoff. Consider visual aids like updated process maps to make it easier for others to follow.",
    "Set up alerts or triggers for when metrics drift out of acceptable range. Don't wait for monthly reviews to catch problems.",
    "Consider a lessons learned session with your team. What worked? What would you do differently next time?",
  ],
};

const genericResponses = [
  "That's great progress! Keep moving forward with your DMAIC project.",
  "Consider documenting your decisions and rationale - it helps with stakeholder communication.",
  "Remember to involve your team throughout the process. Their insights are valuable.",
  "Data-driven decisions are key in Six Sigma. Make sure you have evidence to support your conclusions.",
  "Good work! Following the DMAIC framework systematically leads to sustainable improvements.",
];

const quickActionResponses = {
  review: "Looking at your current work in the {phase} phase: {phaseSpecific}",
  explain: "In the {phase} phase, the goal is to {phaseGoal}. {phaseTip}",
  suggest: "Based on your {phase} phase progress, here's a suggestion: {suggestion}",
  analyze: "Analyzing your data: {analysis}",
};

const phaseGoals = {
  define: "clearly articulate the problem, identify stakeholders, and set project boundaries using tools like SIPOC diagrams",
  measure: "quantify the problem with baseline metrics and map current processes to understand what's happening",
  analyze: "determine root causes of the problem using data analysis and tools like 5 Whys or fishbone diagrams",
  improve: "develop, test, and implement solutions that address the root causes identified in the Analyze phase",
  control: "ensure improvements are sustained through monitoring, documentation, and process controls",
};

const phaseTips = {
  define: "Pro tip: A good problem statement is specific, measurable, and ties to business impact.",
  measure: "Pro tip: Focus on accurate, reliable data collection. Bad data leads to wrong conclusions.",
  analyze: "Pro tip: Go beyond symptoms to find true root causes. Ask 'Why?' at least 5 times.",
  improve: "Pro tip: Pilot solutions on a small scale first to validate effectiveness before full implementation.",
  control: "Pro tip: Make controls easy to follow. Complex procedures aren't sustained.",
};

export const getMockAIResponse = async (message, projectContext) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  const currentPhase = projectContext.currentPhase || 'define';
  const messageL = message.toLowerCase();

  // Check for quick actions
  if (messageL.includes('review') || messageL.includes('look at') || messageL.includes('check')) {
    return generateReviewResponse(projectContext);
  }

  if (messageL.includes('explain') || messageL.includes('what is') || messageL.includes('how do')) {
    return generateExplainResponse(currentPhase);
  }

  if (messageL.includes('suggest') || messageL.includes('recommend') || messageL.includes('advice')) {
    return generateSuggestionResponse(projectContext);
  }

  if (messageL.includes('help') || messageL.includes('stuck') || messageL.includes('not sure')) {
    return generateHelpResponse(currentPhase, projectContext);
  }

  // Phase-specific responses
  return generatePhaseResponse(projectContext);
};

function generateReviewResponse(context) {
  const phase = context.currentPhase || 'define';
  const responses = phaseResponses[phase] || genericResponses;
  let response = responses[Math.floor(Math.random() * responses.length)];

  // Add context-specific details
  response = response
    .replace('{stakeholderCount}', (context.stakeholders?.length || 0))
    .replace('{stepCount}', getTotalSteps(context))
    .replace('{metricCount}', (context.metrics?.length || 0))
    .replace('{wasteCount}', getTotalWastes(context))
    .replace('{highPriorityCount}', getHighPriorityWastes(context))
    .replace('{solutionCount}', Object.keys(context.rootCauseSolutions || {}).length)
    .replace('{controlCount}', (context.controls?.length || 0))
    .replace('{improvement}', calculateImprovement(context))
    .replace('{topScore}', getTopSolutionScore(context))
    .replace('{rootCause}', getFirstRootCause(context))
    .replace('{causeType}', Math.random() > 0.5 ? 'process' : 'system');

  return response;
}

function generateExplainResponse(phase) {
  const goal = phaseGoals[phase] || "work through your Six Sigma project systematically";
  const tip = phaseTips[phase] || "Stay focused on data-driven decisions.";
  
  return `In the ${phase.charAt(0).toUpperCase() + phase.slice(1)} phase, the goal is to ${goal}. ${tip}`;
}

function generateSuggestionResponse(context) {
  const phase = context.currentPhase || 'define';
  const suggestions = {
    define: "Start by creating a SIPOC diagram if you haven't already - it helps visualize process boundaries.",
    measure: "Build a detailed process map to identify all steps. Then set baseline metrics for each key output.",
    analyze: "Use the 5 Whys tool to dig deep into root causes. Don't stop at the first answer!",
    improve: "Rank your solutions using the prioritization tool. Focus on high-impact, low-resource options first.",
    control: "Document your improved process and set up regular monitoring. Assign clear ownership for each control measure.",
  };

  return suggestions[phase] || "Continue working through the DMAIC phases systematically.";
}

function generateHelpResponse(phase, context) {
  const help = {
    define: "Start with the problem statement - what's wrong, where, when, and how much? Then identify who's involved (stakeholders).",
    measure: "Map your current process and identify key metrics. What numbers will show if you're improving?",
    analyze: "Look at your data to find patterns. Then use root cause tools like 5 Whys to understand *why* problems occur.",
    improve: "Brainstorm solutions for each root cause. Then rank them on resources, impact, and ease of implementation.",
    control: "Plan how to sustain improvements: monitoring frequency, responsible parties, and documentation.",
  };

  return `I understand the ${phase.charAt(0).toUpperCase() + phase.slice(1)} phase can be challenging. ${help[phase]} Need help with a specific tool or section? Just ask!`;
}

function generatePhaseResponse(context) {
  const phase = context.currentPhase || 'define';
  const responses = phaseResponses[phase] || genericResponses;
  let response = responses[Math.floor(Math.random() * responses.length)];

  // Add context
  response = response
    .replace('{stakeholderCount}', (context.stakeholders?.length || 0))
    .replace('{stepCount}', getTotalSteps(context))
    .replace('{metricCount}', (context.metrics?.length || 0))
    .replace('{wasteCount}', getTotalWastes(context))
    .replace('{highPriorityCount}', getHighPriorityWastes(context))
    .replace('{solutionCount}', Object.keys(context.rootCauseSolutions || {}).length)
    .replace('{controlCount}', (context.controls?.length || 0))
    .replace('{improvement}', calculateImprovement(context))
    .replace('{topScore}', getTopSolutionScore(context))
    .replace('{rootCause}', getFirstRootCause(context))
    .replace('{causeType}', Math.random() > 0.5 ? 'process' : 'system');

  return response;
}

// Helper functions
function getTotalSteps(context) {
  const maps = context.processMaps || [];
  return maps.reduce((total, map) => total + (map.steps?.length || 0), 0);
}

function getTotalWastes(context) {
  const wastes = context.processWastes || {};
  return Object.values(wastes).reduce((total, arr) => total + arr.length, 0);
}

function getHighPriorityWastes(context) {
  const wastes = context.processWastes || {};
  let count = 0;
  Object.values(wastes).forEach(arr => {
    count += arr.filter(w => w.severity === 'High').length;
  });
  return count;
}

function calculateImprovement(context) {
  const metrics = context.metrics || [];
  if (metrics.length === 0) return '0';
  
  const metric = metrics[0];
  const baseline = parseFloat(metric.baseline) || 0;
  const target = parseFloat(metric.target) || 0;
  
  if (baseline === 0) return '0';
  
  const improvement = Math.abs(((target - baseline) / baseline) * 100).toFixed(0);
  return improvement;
}

function getTopSolutionScore(context) {
  const solutions = context.rootCauseSolutions || {};
  let topScore = 0;
  
  Object.values(solutions).forEach(solution => {
    if (solution.resources && solution.impact && solution.ease) {
      const score = Number(solution.resources) * Number(solution.impact) * Number(solution.ease);
      if (score > topScore) topScore = score;
    }
  });
  
  return topScore || 'N/A';
}

function getFirstRootCause(context) {
  const rootCauses = context.wasteRootCauses || {};
  const causes = Object.values(rootCauses);
  return causes[0] || 'the identified issue';
}
