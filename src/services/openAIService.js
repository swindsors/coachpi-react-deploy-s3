import OpenAI from 'openai';
import { getOpenAIKey, hasOpenAIKey } from './userPreferencesService';

// Check if user has configured an API key
export const hasAPIKey = async () => {
  return await hasOpenAIKey();
};

// Get the OpenAI client instance
const getOpenAIClient = async () => {
  const apiKey = await getOpenAIKey();
  
  if (!apiKey) {
    throw new Error('No API key configured');
  }

  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

// Main function to get AI responses
export const getOpenAIResponse = async (message, projectContext) => {
  try {
    const openai = await getOpenAIClient();
    const currentPhase = projectContext.currentPhase || 'define';
    
    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(currentPhase, projectContext);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific error types
    if (error.status === 401) {
      return "❌ Invalid API key. Please check your API key configuration in Settings.";
    } else if (error.status === 429) {
      return "❌ Rate limit exceeded. Please wait a moment before trying again.";
    } else if (error.status === 500) {
      return "❌ OpenAI service error. Please try again in a moment.";
    } else if (error.message?.includes('No API key')) {
      return "❌ No API key configured. Please add your OpenAI API key in Settings.";
    } else if (error.message?.includes('insufficient_quota')) {
      return "❌ Your OpenAI account has insufficient quota. Please check your billing at platform.openai.com.";
    } else {
      return `❌ Error communicating with OpenAI: ${error.message || 'Unknown error'}`;
    }
  }
};

// Build context-aware system prompt based on current phase
const buildSystemPrompt = (phase, projectContext) => {
  const basePrompt = `You are an expert Six Sigma consultant assistant helping users with their DMAIC (Define, Measure, Analyze, Improve, Control) projects. 
  
Provide practical, actionable advice in a clear and concise manner. Use specific examples when helpful. Keep responses focused and under 150 words unless detailed explanation is requested.`;

  const phaseGuidance = {
    define: `The user is in the DEFINE phase, focusing on:
- Writing clear problem statements
- Identifying stakeholders
- Creating SIPOC diagrams
- Setting project scope and goals`,
    
    measure: `The user is in the MEASURE phase, focusing on:
- Creating process maps
- Establishing baseline metrics
- Setting improvement targets
- Collecting data`,
    
    analyze: `The user is in the ANALYZE phase, focusing on:
- Identifying process wastes
- Performing root cause analysis (5 Whys, Fishbone)
- Data analysis and validation
- Finding patterns and correlations`,
    
    improve: `The user is in the IMPROVE phase, focusing on:
- Developing solutions for root causes
- Prioritizing improvements
- Planning implementation
- Testing solutions`,
    
    control: `The user is in the CONTROL phase, focusing on:
- Creating control plans
- Documentation and handoff
- Monitoring mechanisms
- Sustaining improvements`
  };

  const contextInfo = buildContextInfo(projectContext);
  
  return `${basePrompt}\n\n${phaseGuidance[phase] || phaseGuidance.define}\n\n${contextInfo}`;
};

// Build context information from project data
const buildContextInfo = (context) => {
  const info = [];
  
  if (context.problemStatement) {
    info.push(`Problem: "${context.problemStatement}"`);
  }
  
  if (context.stakeholders && context.stakeholders.length > 0) {
    info.push(`Stakeholders: ${context.stakeholders.length} identified`);
  }
  
  if (context.metrics && context.metrics.length > 0) {
    const metricNames = context.metrics.map(m => m.name).join(', ');
    info.push(`Key metrics: ${metricNames}`);
  }
  
  if (context.processWastes) {
    const wasteCount = Object.values(context.processWastes).reduce((total, arr) => total + arr.length, 0);
    if (wasteCount > 0) {
      info.push(`Process wastes identified: ${wasteCount}`);
    }
  }
  
  if (info.length > 0) {
    return `Current project context:\n${info.join('\n')}`;
  }
  
  return '';
};

// Export for backward compatibility and testing
export { getOpenAIResponse as getAIResponse };
