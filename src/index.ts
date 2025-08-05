#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { runAgent } from './agent';
import { createWeatherAgentConfig } from './config/weatherAgent';
import { createTriageAgentConfig } from './config/triageAgent';
import { ResearchManager } from './config/researchAgentManager';

const program = new Command();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function showMainMenu(): Promise<void> {
  console.clear();
  console.log(chalk.blue.bold('\n🤖 Agent CLI\n'));
  console.log(chalk.cyan('Choose an option:'));
  console.log(chalk.white('1. ') + chalk.green('Run weather agent'));
  console.log(chalk.white('2. ') + chalk.yellow('Run triage agent'));
  console.log(chalk.white('3. ') + chalk.magenta('Run research agent'));
  console.log(chalk.white('4. ') + chalk.gray('Exit\n'));

  const choice = await askQuestion(chalk.blue('Enter your choice (1-4): '));

  switch (choice) {
    case '1':
      await handleWeatherAgent();
      break;
    case '2':
      await handleTriageAgent();
      break;
    case '3':
      await handleResearchAgent();
      break;
    case '4':
      console.log(chalk.green('\n👋 Goodbye!'));
      rl.close();
      process.exit(0);
      break;
    default:
      console.log(chalk.red('\n❌ Invalid choice. Please enter 1-4.'));
      await askQuestion(chalk.gray('Press Enter to continue...'));
      await showMainMenu();
  }
}

async function handleWeatherAgent(): Promise<void> {
  console.log(chalk.blue('\n🌤️  Weather Agent\n'));
  console.log(chalk.cyan('Examples of what you can ask:'));
  console.log(chalk.gray('• "What\'s the weather like in Paris?"'));
  console.log(chalk.gray('• "How\'s the weather in Tokyo in Fahrenheit?"'));
  console.log(chalk.gray('• "Give me the current weather for New York City"'));
  console.log(chalk.gray('• "What\'s the temperature in London?"\n'));
  
  const userTask = await askQuestion(chalk.blue('What would you like to know about the weather? '));
  
  if (!userTask) {
    console.log(chalk.yellow('\n⚠️  No task provided, using default example.'));
  }
  
  console.log(chalk.yellow('\n⏳ Please wait, agent is working...'));
  
  try {
    // Create the weather agent configuration
    const agentConfig = createWeatherAgentConfig();
    const result = await runAgent(agentConfig, userTask || undefined);
    console.log(chalk.green('\n✅ Agent completed:'));
    console.log(chalk.white(result));
  } catch (error) {
    console.log(chalk.red('\n❌ Agent failed:'));
    console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
  }
  
  await askQuestion(chalk.gray('\nPress Enter to return to main menu...'));
  await showMainMenu();
}

async function handleTriageAgent(): Promise<void> {
  console.log(chalk.yellow('\n🎯 Triage Agent\n'));
  console.log(chalk.cyan('This agent can help with both code generation and documentation tasks:'));
  console.log(chalk.gray('• Code generation: "Create a TypeScript function to sort an array"'));
  console.log(chalk.gray('• Documentation: "Write API documentation for a REST endpoint"'));
  console.log(chalk.gray('• Tutorials: "Create a tutorial on React hooks"'));
  console.log(chalk.gray('• Guides: "Write a guide for setting up a Node.js project"\n'));
  
  const userTask = await askQuestion(chalk.blue('What would you like help with? '));
  
  if (!userTask) {
    console.log(chalk.yellow('\n⚠️  No task provided, returning to main menu.'));
    await askQuestion(chalk.gray('Press Enter to continue...'));
    await showMainMenu();
    return;
  }
  
  console.log(chalk.yellow('\n⏳ Please wait, agent is working...'));
  
  try {
    // Create the triage agent configuration
    const agentConfig = createTriageAgentConfig();
    const result = await runAgent(agentConfig, userTask);
    console.log(chalk.green('\n✅ Agent completed:'));
    console.log(chalk.white(result));
  } catch (error) {
    console.log(chalk.red('\n❌ Agent failed:'));
    console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
  }
  
  await askQuestion(chalk.gray('\nPress Enter to return to main menu...'));
  await showMainMenu();
}

async function handleResearchAgent(): Promise<void> {
  console.log(chalk.magenta('\n🔍 Research Agent\n'));
  console.log(chalk.cyan('This agent performs comprehensive research on any topic:'));
  console.log(chalk.gray('• "Research the latest trends in artificial intelligence"'));
  console.log(chalk.gray('• "What are the current developments in renewable energy?"'));
  console.log(chalk.gray('• "Analyze the impact of remote work on productivity"'));
  console.log(chalk.gray('• "Research best practices for cloud security"\n'));
  
  const userQuery = await askQuestion(chalk.blue('What would you like me to research? '));
  
  if (!userQuery) {
    console.log(chalk.yellow('\n⚠️  No research query provided, returning to main menu.'));
    await askQuestion(chalk.gray('Press Enter to continue...'));
    await showMainMenu();
    return;
  }
  
  console.log(chalk.yellow('\n⏳ Please wait, research agent is working...'));
  console.log(chalk.cyan('This may take a few minutes as the agent performs web searches and analysis.\n'));
  
  try {
    // Create and run the research manager
    const researchManager = new ResearchManager();
    await researchManager.run(userQuery);
    console.log(chalk.green('\n✅ Research completed successfully!'));
  } catch (error) {
    console.log(chalk.red('\n❌ Research failed:'));
    console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
  }
  
  await askQuestion(chalk.gray('\nPress Enter to return to main menu...'));
  await showMainMenu();
}

// Renamed the original function for clarity
async function handleRunAgent(): Promise<void> {
  await handleWeatherAgent();
}

program
  .name('agent-cli')
  .description('Multi-Agent CLI - Weather, Triage, and Research Agents')
  .version('1.0.0');

// If no arguments provided, show interactive menu
if (process.argv.length === 2) {
  showMainMenu();
} else {
  // Command line interface
  program
    .command('weather')
    .description('Run the weather agent')
    .option('-t, --task <task>', 'Task to give to the agent')
    .action(async (options) => {
      try {
        let task = options.task;
        if (!task) {
          console.log(chalk.blue('🌤️  Weather Agent'));
          console.log(chalk.cyan('\nExamples: "What\'s the weather in Paris?" or "How\'s the weather in Tokyo?"'));
          task = await askQuestion(chalk.blue('\nWhat would you like to know about the weather? '));
        }
        
        console.log(chalk.yellow('⏳ Please wait, agent is working...'));
        // Create the weather agent configuration
        const agentConfig = createWeatherAgentConfig();
        const result = await runAgent(agentConfig, task || undefined);
        console.log(chalk.green('\n✅ Agent completed:'));
        console.log(chalk.white(result));
      } catch (error) {
        console.log(chalk.red('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
      rl.close();
    });

  program
    .command('triage')
    .description('Run the triage agent for code and documentation tasks')
    .option('-t, --task <task>', 'Task to give to the agent')
    .action(async (options) => {
      try {
        let task = options.task;
        if (!task) {
          console.log(chalk.yellow('🎯 Triage Agent'));
          console.log(chalk.cyan('\nThis agent can help with code generation and documentation.'));
          console.log(chalk.gray('Examples: "Create a Python function" or "Write API documentation"'));
          task = await askQuestion(chalk.blue('\nWhat would you like help with? '));
        }
        
        if (!task) {
          console.log(chalk.yellow('No task provided. Exiting.'));
          rl.close();
          return;
        }
        
        console.log(chalk.yellow('⏳ Please wait, agent is working...'));
        // Create the triage agent configuration
        const agentConfig = createTriageAgentConfig();
        const result = await runAgent(agentConfig, task);
        console.log(chalk.green('\n✅ Agent completed:'));
        console.log(chalk.white(result));
      } catch (error) {
        console.log(chalk.red('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
      rl.close();
    });

  program
    .command('research')
    .description('Run the research agent for comprehensive topic research')
    .option('-q, --query <query>', 'Research query to investigate')
    .action(async (options) => {
      try {
        let query = options.query;
        if (!query) {
          console.log(chalk.magenta('🔍 Research Agent'));
          console.log(chalk.cyan('\nThis agent performs comprehensive research on any topic.'));
          console.log(chalk.gray('Examples: "AI trends" or "renewable energy developments"'));
          query = await askQuestion(chalk.blue('\nWhat would you like me to research? '));
        }
        
        if (!query) {
          console.log(chalk.yellow('No research query provided. Exiting.'));
          rl.close();
          return;
        }
        
        console.log(chalk.yellow('⏳ Please wait, research agent is working...'));
        console.log(chalk.cyan('This may take a few minutes as the agent performs web searches and analysis.\n'));
        
        // Create and run the research manager
        const researchManager = new ResearchManager();
        await researchManager.run(query);
        console.log(chalk.green('\n✅ Research completed successfully!'));
      } catch (error) {
        console.log(chalk.red('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
      rl.close();
    });

  // Keep the original 'run' command for backward compatibility
  program
    .command('run')
    .description('Run the weather agent (legacy command)')
    .option('-t, --task <task>', 'Task to give to the agent')
    .action(async (options) => {
      try {
        let task = options.task;
        if (!task) {
          console.log(chalk.blue('🌤️  Weather Agent'));
          console.log(chalk.cyan('\nExamples: "What\'s the weather in Paris?" or "How\'s the weather in Tokyo?"'));
          task = await askQuestion(chalk.blue('\nWhat would you like to know about the weather? '));
        }
        
        console.log(chalk.yellow('⏳ Please wait, agent is working...'));
        // Create the weather agent configuration
        const agentConfig = createWeatherAgentConfig();
        const result = await runAgent(agentConfig, task || undefined);
        console.log(chalk.green('\n✅ Agent completed:'));
        console.log(chalk.white(result));
      } catch (error) {
        console.log(chalk.red('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
      rl.close();
    });

  program.parse();
}