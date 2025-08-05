import { Agent, OpenAIChatCompletionsModel, Runner } from '@openai/agents';
import * as dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config();

// Agent configuration interface
export interface AgentConfig {
  name: string;
  model: OpenAIChatCompletionsModel;
  instructions: string;
  tools: any[];
  handoffs?: any[]; // Add optional handoffs property
}

export async function runAgent(agentConfig: AgentConfig, userTask?: string): Promise<string> {
  try {

    // Create agent using the provided configuration
    const agent = new Agent({
      name: agentConfig.name,
      model: agentConfig.model,
      instructions: agentConfig.instructions,
      tools: agentConfig.tools,
      ...(agentConfig.handoffs && { handoffs: agentConfig.handoffs }) // Include handoffs if provided
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