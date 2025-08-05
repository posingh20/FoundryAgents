import { AzureOpenAI } from 'openai';
import { AgentConfig } from '../agent';
import { 
  Agent, 
  OpenAIChatCompletionsModel, 
  handoff, 
  HandoffInputData 
} from '@openai/agents';
import { removeAllTools } from '@openai/agents-core/extensions';
import { createDocAgentConfig } from './docAgent';
import { createCodingAgentConfig } from './codingAgent';

export const triagePrompt = `You are an intelligent triage agent that can help with both code generation and documentation tasks.`


// Message filter for handoff (removes tool messages)
function handoffMessageFilter(handoffMessageData: HandoffInputData) {
  // Remove all tool-related messages for clean handoff
  return removeAllTools(handoffMessageData);
}

// Function to create a default triage agent configuration
export function createTriageAgentConfig(): AgentConfig {
  // Check if environment variables are set
  if (!process.env.AZURE_BASE_URL || !process.env.AZURE_API_KEY || !process.env.AZURE_MODEL_NAME) {
    throw new Error(`Azure environment variables not configured. Please set:
    - AZURE_BASE_URL
    - AZURE_API_KEY  
    - AZURE_MODEL_NAME`);
  }

  const modelName = process.env.AZURE_MODEL_NAME!;
  const azureClient = new AzureOpenAI({
    endpoint: process.env.AZURE_BASE_URL,
    apiKey: process.env.AZURE_API_KEY,
    apiVersion: process.env.AZURE_API_VERSION || '2024-02-01',
    deployment: modelName,
  });

  // Create the specialized agents for handoff
  const docAgentConfig = createDocAgentConfig();
  const codingAgentConfig = createCodingAgentConfig();

  // Create Agent instances for handoff
  const docAgent = new Agent({
    name: docAgentConfig.name,
    model: docAgentConfig.model,
    instructions: docAgentConfig.instructions,
    tools: docAgentConfig.tools,
    handoffDescription: 'A documentation specialist that can create high-quality technical documentation, API docs, tutorials, guides, and README files.'
  });

  const codingAgent = new Agent({
    name: codingAgentConfig.name,
    model: codingAgentConfig.model,
    instructions: codingAgentConfig.instructions,
    tools: codingAgentConfig.tools,
    handoffDescription: 'A coding specialist that can generate high-quality code in multiple programming languages, create functions, classes, and modules with best practices.'
  });

  return {
    name: 'Triage-Agent',
    model: new OpenAIChatCompletionsModel(azureClient, modelName),
    instructions: `${triagePrompt}

When users need documentation help, handoff to the Documentation Agent.
When users need coding assistance, handoff to the Coding Agent.

Available handoffs:
- Documentation Agent: For creating technical documentation, API docs, tutorials, guides, and README files
- Coding Agent: For generating code, functions, classes, and programming assistance

Determine the user's primary need and handoff to the appropriate specialist agent.`,
    tools: [],
    handoffs: [
      handoff(docAgent, { inputFilter: handoffMessageFilter }),
      handoff(codingAgent, { inputFilter: handoffMessageFilter })
    ]
  };
}