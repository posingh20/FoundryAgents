import { AzureOpenAI } from 'openai';
import { AgentConfig } from '../agent';
import { webSearchTool, OpenAIChatCompletionsModel } from '@openai/agents';
import { z } from 'zod';

// ---- Planner Agent ----

const plannerPrompt = `You are a helpful research assistant.
Given a query, come up with a set of web searches to perform to best answer the query.
Output between 5 and 20 terms to query for.`;

export const webSearchItem = z.object({
  reason: z
    .string()
    .describe('Your reasoning for why this search is important to the query.'),
  query: z.string().describe('The search term to use for the web search.'),
});

export type WebSearchItem = z.infer<typeof webSearchItem>;

export const webSearchPlan = z.object({
  searches: z
    .array(webSearchItem)
    .describe('A list of web searches to perform to best answer the query.'),
});

export type WebSearchPlan = z.infer<typeof webSearchPlan>;

export function createPlannerAgentConfig(): AgentConfig {
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

  return {
    name: 'PlannerAgent',
    instructions: plannerPrompt,
    model: new OpenAIChatCompletionsModel(azureClient, modelName),
    tools: [],
    outputType: webSearchPlan,
  };
}

// ---- Search Agent ----

const searchAgentInstructions = `You are a research assistant.
Given a search term, you search the web for that term and produce a concise summary of the results.
The summary must be 2-3 paragraphs and less than 300 words. Capture the main points.
Write succinctly, no need to have complete sentences or good grammar.
This will be consumed by someone synthesizing a report, so its vital you capture the essence and ignore any fluff.
Do not include any additional commentary other than the summary itself.`;

export function createSearchAgentConfig(): AgentConfig {
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

  return {
    name: 'Search agent',
    instructions: searchAgentInstructions,
    tools: [webSearchTool()],
    model: new OpenAIChatCompletionsModel(azureClient, modelName),
    modelSettings: { toolChoice: 'required' },
  };
}

// ---- Writer Agent ----
const writerPrompt = `You are a senior researcher tasked with writing a cohesive report for a research query.
You will be provided with the original query, and some initial research done by a research assistant.
You should first come up with an outline for the report that describes the structure and flow of the report.
Then, generate the report and return that as your final output.
The final output should be in markdown format, and it should be lengthy and detailed. Aim for 5-10 pages of content, at least 1000 words.`;

export const reportData = z.object({
  shortSummary: z
    .string()
    .describe('A short 2-3 sentence summary of the findings.'),
  markdownReport: z.string().describe('The final report'),
  followUpQuestions: z
    .array(z.string())
    .describe('Suggested topics to research further'),
});

export type ReportData = z.infer<typeof reportData>;

export function createWriterAgentConfig(): AgentConfig {
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

  return {
    name: 'WriterAgent',
    instructions: writerPrompt,
    model: new OpenAIChatCompletionsModel(azureClient, modelName),
    tools: [],
    outputType: reportData,
  };
}