import { AzureOpenAI } from 'openai';
import { AgentConfig } from '../agent';
import { OpenAIChatCompletionsModel } from '@openai/agents';
import { codingTool } from '../triageTools';

// Function to create a default coding agent configuration
export function createCodingAgentConfig(): AgentConfig {
  // Check if environment variables are set
  if (!process.env.AZURE_BASE_URL || !process.env.AZURE_API_KEY || !process.env.AZURE_MODEL_NAME_O4_MINI) {
    throw new Error(`Azure environment variables not configured. Please set:
    - AZURE_BASE_URL
    - AZURE_API_KEY  
    - AZURE_MODEL_NAME_O4_MINI`);
  }

  // Create Azure client for the coding agent
  const azureClient = new AzureOpenAI({
    endpoint: process.env.AZURE_BASE_URL,
    apiKey: process.env.AZURE_API_KEY,
    apiVersion: process.env.AZURE_API_VERSION || '2024-02-01',
    deployment: process.env.AZURE_MODEL_NAME_O4_MINI,
  });

  return {
    name: 'Coding-Agent',
    model: new OpenAIChatCompletionsModel(azureClient, process.env.AZURE_MODEL_NAME_O4_MINI!),
    instructions: `You are an expert software development agent specializing in code generation and programming assistance.
    You can help with:
    - Writing functions, classes, modules, and scripts
    - Supporting multiple programming languages (TypeScript, Python, JavaScript, Java, C#, etc.)
    - Following best practices and coding conventions
    - Generating unit tests when requested
    - Using various frameworks and libraries
    
    You have access to a code generation tool that can create high-quality, production-ready code.
    When users request code, use the write_code tool to generate clean, efficient, and well-documented solutions.
    
    Always clarify requirements when needed, such as:
    - What programming language should be used?
    - What style of code is preferred (function, class, module, etc.)?
    - Are there specific frameworks or libraries to use?
    - Should unit tests be included?
    - What level of commenting is desired?`,
    tools: [codingTool]
  };
}