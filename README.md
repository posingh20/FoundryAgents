# Agent CLI

A command-line interface for running AI agents using Azure Foundry and OpenAI Agents SDK

## Overview

Agent CLI is a TypeScript-based tool that provides multiple specialized AI agents:

- **Weather Agent**: Get real-time weather information for any city
- **Triage Agent**: Intelligent task routing that can handle both code generation and documentation tasks
  - Routes to specialized coding agent for programming tasks  
  - Routes to documentation agent for writing guides, tutorials, and docs

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

### Architecture

The CLI uses the `@openai/agents` framework with Azure OpenAI models. Key components:

- **Agent Runner**: Core engine that executes agents with specified configurations
- **Tools**: Specialized functions for weather data and task routing
- **Handoff System**: Intelligent routing between specialized agents
- **Interactive Interface**: User-friendly CLI with colored output and prompts

## API Integration

### Weather Data

Weather information is provided by the OpenWeatherMap Current Weather API (free tier), which includes:

- Current temperature and "feels like" temperature
- Weather conditions and descriptions
- Humidity, pressure, and visibility
- Wind speed and direction
- Sunrise and sunset times
