import { AzureOpenAI } from 'openai';
import { AgentConfig } from '../agent';
import { OpenAIChatCompletionsModel } from '@openai/agents';
import { docTool } from '../tools/triageTools';

// Function to create a default documentation agent configuration
export function createDocAgentConfig(): AgentConfig {
  // Check if environment variables are set
  if (!process.env.AZURE_BASE_URL || !process.env.AZURE_API_KEY || !process.env.AZURE_MODEL_NAME) {
    throw new Error(`Azure environment variables not configured. Please set:
    - AZURE_BASE_URL
    - AZURE_API_KEY  
    - AZURE_MODEL_NAME`);
  }

  // Create Azure client for the documentation agent
  const azureClient = new AzureOpenAI({
    endpoint: process.env.AZURE_BASE_URL,
    apiKey: process.env.AZURE_API_KEY,
    apiVersion: process.env.AZURE_API_VERSION || '2024-02-01',
    deployment: process.env.AZURE_MODEL_NAME,
  });

  return {
    name: 'Documentation-Agent',
    model: new OpenAIChatCompletionsModel(azureClient, process.env.AZURE_MODEL_NAME!),
    instructions: `You are an expert technical documentation agent. You can create various types of documentation including:
    - API documentation with examples and parameter details
    - Tutorial documentation with step-by-step instructions
    - Technical guides with clear structure and examples
    - README files for projects
    - User manuals and guides
    
    You have access to a documentation writing tool that can generate high-quality documentation in various formats.
    When users request documentation, use the write_documentation tool to create comprehensive, well-structured content.
    
    Always ask clarifying questions if the documentation requirements are unclear, such as:
    - What type of documentation is needed?
    - What level of detail is required?
    - What format should the output be in?
    - Who is the target audience?`,
    tools: [docTool]
  };
}