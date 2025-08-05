# Agent CLI

A command-line interface for running AI agents using Azure Foundry and OpenAI Agents SDK

## Overview

Agent CLI is a TypeScript-based tool that provides multiple specialized AI agents:

- **Weather Agent**: Get real-time weather information for any city
- **Triage Agent**: Intelligent task routing that can handle both code generation and documentation tasks
  - Routes to specialized coding agent for programming tasks  
  - Routes to documentation agent for writing guides, tutorials, and docs
- **Research Agent**: Comprehensive research assistant that performs multi-step web research and generates detailed reports
  - Plans and executes multiple web searches
  - Synthesizes findings into structured reports
  - Provides follow-up research suggestions

## Prerequisites

- Node.js 18+ 
- TypeScript
- Azure OpenAI Service account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FoundryAgents
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with your Azure OpenAI credentials:

```env
AZURE_BASE_URL=https://your-resource.openai.azure.com/
AZURE_API_KEY=your-api-key
AZURE_MODEL_NAME=your-model-deployment-name
AZURE_API_VERSION=2024-02-01
OPENWEATHER_API_KEY=your-openweather-api-key
AZURE_MODEL_NAME_O4_MINI=your-model-deployment-name
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AZURE_BASE_URL` | Your Azure OpenAI endpoint URL |
| `AZURE_API_KEY` | Your Azure OpenAI API key |
| `AZURE_MODEL_NAME` | Your Azure OpenAI model deployment name |
| `AZURE_API_VERSION` | Azure OpenAI API version (default: 2024-02-01) |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key for weather data |
| `AZURE_MODEL_NAME_O4_MINI` | Your Azure O4 Mini deployment name |

## Usage

### Development Mode (Recommended)

Run the CLI directly with TypeScript using ts-node:

```bash
# Interactive mode - shows menu to choose agent
npx ts-node src/index.ts

# Weather agent with interactive prompt
npx ts-node src/index.ts weather

# Weather agent with direct task
npx ts-node src/index.ts weather --task "What's the weather like in Paris?"

# Triage agent with interactive prompt  
npx ts-node src/index.ts triage

# Triage agent with direct task
npx ts-node src/index.ts triage --task "Create a TypeScript function to sort an array"

# Research agent with interactive prompt
npx ts-node src/index.ts research

# Research agent with direct query
npx ts-node src/index.ts research --query "Latest trends in artificial intelligence"
```

### Production Mode

Build and run the compiled version:

```bash
# Build the project
npm run build

# Run the compiled CLI
npm start
# or
node dist/index.js
```

### Command Examples

#### Weather Agent

Get weather information for any city:

```bash
# Interactive weather prompt
npx ts-node src/index.ts weather

# Direct weather queries
npx ts-node src/index.ts weather --task "What's the weather like in Paris?"
npx ts-node src/index.ts weather --task "How's the weather in Tokyo in Fahrenheit?"
npx ts-node src/index.ts weather --task "Give me the current weather for New York City"
npx ts-node src/index.ts weather --task "What's the temperature in London?"
```

#### Triage Agent

Handle code generation and documentation tasks:

```bash
# Interactive triage prompt
npx ts-node src/index.ts triage

# Code generation examples
npx ts-node src/index.ts triage --task "Create a TypeScript function to sort an array"
npx ts-node src/index.ts triage --task "Write a Python class for handling user authentication"
npx ts-node src/index.ts triage --task "Generate a React component for a todo list"

# Documentation examples  
npx ts-node src/index.ts triage --task "Write API documentation for a REST endpoint"
npx ts-node src/index.ts triage --task "Create a tutorial on React hooks"
npx ts-node src/index.ts triage --task "Write a guide for setting up a Node.js project"
```

#### Research Agent

Perform comprehensive research on any topic:

```bash
# Interactive research prompt
npx ts-node src/index.ts research

# Research query examples
npx ts-node src/index.ts research --query "Latest trends in artificial intelligence"
npx ts-node src/index.ts research --query "Climate change impact on agriculture"
npx ts-node src/index.ts research --query "Blockchain technology applications in healthcare"
npx ts-node src/index.ts research --query "Remote work productivity best practices"
npx ts-node src/index.ts research --query "Renewable energy market developments"
npx ts-node src/index.ts research --query "Cybersecurity threats in 2025"
```

The research agent will:
- Plan and execute multiple targeted web searches
- Gather information from various sources
- Synthesize findings into a comprehensive markdown report (5-10 pages, 1000+ words)
- Provide follow-up research questions for further investigation

### Architecture

The CLI uses the `@openai/agents` framework with Azure OpenAI models. Key components:

- **Agent Runner**: Core engine that executes agents with specified configurations
- **Tools**: Specialized functions for weather data, task routing, and web search
- **Handoff System**: Intelligent routing between specialized agents
- **Research Pipeline**: Multi-agent research workflow with planning, searching, and synthesis
- **Interactive Interface**: User-friendly CLI with colored output and prompts

## API Integration

### Weather Data

Weather information is provided by the OpenWeatherMap Current Weather API (free tier), which includes:

- Current temperature and "feels like" temperature
- Weather conditions and descriptions
- Humidity, pressure, and visibility
- Wind speed and direction
- Sunrise and sunset times

### Research Capabilities

The research agent leverages web search capabilities to:

- Perform targeted searches across multiple sources
- Extract and summarize relevant information
- Generate structured, comprehensive reports
- Suggest related topics for further exploration
