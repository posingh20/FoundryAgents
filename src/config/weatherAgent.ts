import { AzureOpenAI } from 'openai';
import { AgentConfig } from '../agent';
import { OpenAIChatCompletionsModel } from '@openai/agents';
import { weatherTool } from '../tools/weatherTool';

export const weatherPrompt = `You are a helpful weather assistant. Use the get_weather tool to provide weather information for cities when asked. 

      The tool provides current weather conditions including:
      - Temperature and feels-like temperature
      - Weather conditions and description
      - Humidity, wind speed, and pressure
      - Cloud cover and visibility
      - Sunrise and sunset times

      Be friendly and informative in your responses. When users ask about weather, always use the tool to get real-time data.`


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