import { tool } from '@openai/agents';
import { z } from 'zod';
import { AzureOpenAI } from 'openai';
import { AgentConfig, runAgent } from '../agent';
import { OpenAIChatCompletionsModel } from '@openai/agents';

// Doc tool using Agent instead of direct LLM calls
export const docTool = tool({
  name: 'write_documentation',
  description: 'Generate high-quality documentation using GPT-4.1 model via Agent',
  parameters: z.object({
    topic: z.string().describe('The topic or subject to document'),
    type: z.enum(['api', 'tutorial', 'guide', 'readme', 'technical', 'user']).describe('Type of documentation to generate'),
    format: z.enum(['markdown', 'rst', 'html', 'plain']).default('markdown').describe('Output format (default: markdown)'),
    detail_level: z.enum(['brief', 'detailed', 'comprehensive']).default('detailed').describe('Level of detail (default: detailed)')
  }),
  async execute({ topic, type, format = 'markdown', detail_level = 'detailed' }) {
    try {
      console.log("TOOL CALL: Executing doc tool with parameters:", { topic, type, format, detail_level });
      
      // Check if environment variables are set
      if (!process.env.AZURE_BASE_URL || !process.env.AZURE_API_KEY || !process.env.AZURE_MODEL_NAME) {
        return `Error: Azure environment variables not configured
        Missing variables:
        - AZURE_BASE_URL: ${process.env.AZURE_BASE_URL ? 'Set' : 'Missing'}
        - AZURE_API_KEY: ${process.env.AZURE_API_KEY ? 'Set' : 'Missing'}
        - AZURE_MODEL_NAME: ${process.env.AZURE_MODEL_NAME ? 'Set' : 'Missing'}

        Please configure Azure variables in your .env file.`;
      }

      // Create Azure client for the documentation agent
      const azureClient = new AzureOpenAI({
        endpoint: process.env.AZURE_BASE_URL,
        apiKey: process.env.AZURE_API_KEY,
        apiVersion: process.env.AZURE_API_VERSION || '2024-02-01',
        deployment: process.env.AZURE_MODEL_NAME,
      });

      // Create documentation agent configuration
      const docAgentConfig: AgentConfig = {
        name: 'Documentation-Agent',
        model: new OpenAIChatCompletionsModel(azureClient, process.env.AZURE_MODEL_NAME!),
        instructions: `You are an expert technical writer specializing in creating ${detail_level} ${type} documentation. 
        Your task is to generate well-structured, clear, and comprehensive documentation in ${format} format.
        
        Guidelines:
        - Use appropriate headings and structure
        - Include examples where relevant
        - Write for the target audience of ${type} documentation
        - Ensure accuracy and clarity
        - Follow ${format} formatting conventions
        ${format === 'markdown' ? '- Use proper markdown syntax with headers, code blocks, lists, and links' : ''}
        ${type === 'api' ? '- Include request/response examples, parameters, and error codes' : ''}
        ${type === 'tutorial' ? '- Provide step-by-step instructions with clear examples' : ''}
        ${type === 'guide' ? '- Structure content logically with clear sections and subsections' : ''}
        
        Always provide comprehensive documentation that covers all relevant aspects of the requested topic.`,
        tools: []
      };

      const userTask = `Create ${detail_level} ${type} documentation for: ${topic}

      Please generate comprehensive documentation that covers all relevant aspects of this topic.`;

      // Run the documentation agent
      const result = await runAgent(docAgentConfig, userTask);
      
      return `Generated ${type} documentation for "${topic}" (${detail_level} level, ${format} format):

${result}`;

    } catch (error) {
      console.error("Error in doc tool:", error);
      return `Error generating documentation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
});

// Coding tool using Agent instead of direct LLM calls
export const codingTool = tool({
  name: 'write_code',
  description: 'Generate high-quality code using O4-Mini model via Agent',
  parameters: z.object({
    task: z.string().describe('Description of the code to generate'),
    language: z.string().describe('Programming language (e.g., typescript, python, javascript, java, etc.)'),
    style: z.enum(['function', 'class', 'module', 'script', 'snippet']).describe('Code structure/style to generate'),
    framework: z.string().default('').describe('Framework or library to use (leave empty if none)'),
    include_tests: z.boolean().default(false).describe('Whether to include unit tests (default: false)'),
    include_comments: z.boolean().default(true).describe('Whether to include detailed comments (default: true)')
  }),
  async execute({ task, language, style, framework = '', include_tests = false, include_comments = true }) {
    try {
      console.log("TOOL CALL: Executing coding tool with parameters:", { task, language, style, framework, include_tests, include_comments });
      
      // Check if environment variables are set
      if (!process.env.AZURE_BASE_URL || !process.env.AZURE_API_KEY || !process.env.AZURE_MODEL_NAME_O4_MINI) {
        return `Error: Azure environment variables not configured
        Missing variables:
        - AZURE_BASE_URL: ${process.env.AZURE_BASE_URL ? 'Set' : 'Missing'}
        - AZURE_API_KEY: ${process.env.AZURE_API_KEY ? 'Set' : 'Missing'}
        - AZURE_MODEL_NAME_O4_MINI: ${process.env.AZURE_MODEL_NAME_O4_MINI ? 'Set' : 'Missing'}

        Please configure Azure variables in your .env file.`;
      }

      // Create Azure client for the coding agent
      const azureClient = new AzureOpenAI({
        endpoint: process.env.AZURE_BASE_URL,
        apiKey: process.env.AZURE_API_KEY,
        apiVersion: process.env.AZURE_API_VERSION || '2024-02-01',
        deployment: process.env.AZURE_MODEL_NAME_O4_MINI,
      });

      // Create coding agent configuration
      const codingAgentConfig: AgentConfig = {
        name: 'Coding-Agent',
        model: new OpenAIChatCompletionsModel(azureClient, process.env.AZURE_MODEL_NAME_O4_MINI!),
        instructions: `You are an expert software engineer specializing in ${language} development.
        Generate clean, efficient, and well-structured code following best practices.
        
        Requirements:
        - Write ${style} style code
        - Use ${language} syntax and conventions
        ${framework && framework.trim() ? `- Use ${framework} framework/library` : ''}
        ${include_comments ? '- Include clear, helpful comments explaining the code' : '- Minimize comments, focus on clean code'}
        ${include_tests ? '- Include comprehensive unit tests' : '- Do not include tests'}
        - Follow proper naming conventions
        - Handle errors appropriately
        - Write production-ready code
        
        Output format: Provide only the code with minimal explanation.`,
        tools: []
      };

      const userTask = `Task: ${task}

      Generate ${language} code that accomplishes this task. 
      ${include_tests ? 'Include unit tests for the generated code.' : ''}
      ${framework && framework.trim() ? `Use ${framework} framework.` : ''}`;

      // Run the coding agent
      const result = await runAgent(codingAgentConfig, userTask);
      
      return `Generated ${language} code (${style} style) for "${task}":

${result}`;

    } catch (error) {
      console.error("Error in coding tool:", error);
      return `Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
});