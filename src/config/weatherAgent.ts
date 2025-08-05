import { AzureOpenAI } from 'openai';
import { AgentConfig } from '../agent';
import { OpenAIChatCompletionsModel } from '@openai/agents';
import { weatherPrompt } from '../prompts';
import { weatherTool } from '../weatherTool';


// Function to create a default weather agent configuration
export function createWeatherAgentConfig(): AgentConfig {
  const modelName = process.env.AZURE_MODEL_NAME!;
  const azureClient = new AzureOpenAI({
    endpoint: process.env.AZURE_BASE_URL,
    apiKey: process.env.AZURE_API_KEY,
    apiVersion: process.env.AZURE_API_VERSION,
    deployment: modelName,
  });

  return {
    name: 'Weather-Agent',
    model: new OpenAIChatCompletionsModel(azureClient, modelName),
    instructions: weatherPrompt,
    tools: [weatherTool]
  };
}