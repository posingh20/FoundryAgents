import { Agent, OpenAIChatCompletionsModel, Runner, setTracingDisabled } from '@openai/agents';
import * as dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config();

// Disable tracing globally
setTracingDisabled(true);

// Agent configuration interface
export interface AgentConfig {
  name: string;
  model: OpenAIChatCompletionsModel;
  instructions: string;
  tools: any[];
  handoffs?: any[]; // Add optional handoffs property
  outputType?: any; // Add optional outputType for structured outputs
  modelSettings?: any; // Add optional modelSettings
}

export async function runAgent(agentConfig: AgentConfig, userTask?: string): Promise<string> {
  try {

    // Create agent using the provided configuration
    const agent = new Agent({
      name: agentConfig.name,
      model: agentConfig.model,
      instructions: agentConfig.instructions,
      tools: agentConfig.tools,
      ...(agentConfig.handoffs && { handoffs: agentConfig.handoffs }), // Include handoffs if provided
      ...(agentConfig.outputType && { outputType: agentConfig.outputType }), // Include outputType if provided
      ...(agentConfig.modelSettings && { modelSettings: agentConfig.modelSettings }) // Include modelSettings if provided
    });

    const runner = new Runner();
    const task = userTask || '';
    
    // Run the agent
    const result = await runner.run(agent, task, { stream: false });
    
    return `Building agent - Agent execution completed!\n\nTask: ${task}\nResponse: ${result.finalOutput}`;
    
  } catch (error) {
    return `Building agent - Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// New function specifically for structured outputs
export async function runAgentWithStructuredOutput(agentConfig: AgentConfig, userTask?: string): Promise<any> {
  try {
    // Create agent using the provided configuration
    const agent = new Agent({
      name: agentConfig.name,
      model: agentConfig.model,
      instructions: agentConfig.instructions,
      tools: agentConfig.tools,
      ...(agentConfig.handoffs && { handoffs: agentConfig.handoffs }),
      ...(agentConfig.outputType && { outputType: agentConfig.outputType }),
      ...(agentConfig.modelSettings && { modelSettings: agentConfig.modelSettings })
    });

    const runner = new Runner();
    const task = userTask || '';
    
    // Run the agent
    const result = await runner.run(agent, task, { stream: false });
    
    return result.finalOutput;
    
  } catch (error) {
    throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}