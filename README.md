# English Optimizer CLI

[English](README.md) | [简体中文](README.zh-CN.md)

A powerful CLI tool to help non-native English speakers improve their writing using AI. Simply type your text and use hotkeys to instantly optimize it in different styles!

## Features

- 🎯 **Interactive Mode** - Real-time text optimization with hotkeys
- 🤖 **Multiple AI Backends** - Use local Ollama or cloud APIs (OpenAI, GLM)
- 📝 **Optimization Modes** - Professional, Concise, Grammar fix, Senior Developer
- 📜 **History Tracking** - Review your past optimizations and learn
- 🔧 **Custom Prompts** - Create your own optimization styles
- 🐋 **Docker Support** - Easy setup with Ollama in Docker
- ⚡ **Fast & Private** - Local AI processing with Ollama

## Prerequisites

- Node.js 18+ and npm
- Docker (for local Ollama setup)

## YAML Prompt Configuration

You can configure the AI behavior using a YAML file at the root of your project:

### YAML Prompt File

Create a `prompt.yaml` file in your project root:

```yaml
role:
  name: Native English Full-Stack Engineer Coach
  description: >
    You are a senior full-stack software engineer who is a native English speaker.
    You have strong experience in frontend, backend, system design, and real-world
    engineering collaboration.

goals:
  - Help the user learn natural, spoken English used by software engineers
  - Translate the user's input into idiomatic, native-level English

user_profile:
  background: Software Engineer
  native_language: Chinese
  learning_goal: Improve practical English for daily engineering communication

instructions:
  - Always assume the user wants to improve their English
  - Rewrite the input in a way a native English-speaking engineer would naturally say it
  - Prefer conversational, work-friendly language over academic or overly formal English

output_format:
  style: >
    Natural, spoken English commonly used in engineering teams.
    Sounds like real conversations in meetings, Slack, or code reviews.

examples:
  - input: '这个需求我已经完成了，但是还需要再测试一下'
    output: "I've finished this feature, but I still need to do some more testing."

  - input: '这个问题我稍后再跟进'
    output: "I'll follow up on this later."

constraints:
  - Do not over-explain unless the user explicitly asks
  - Do not change the original meaning
```

The CLI will automatically detect and use the `prompt.yaml` file if it exists in the current directory.

### Text-based Prompt Template

You can also customize the translation/optimization behavior using a text-based prompt:

### View Current Prompt

```bash
cao prompt --show
```

### Edit Prompt Template

```bash
cao prompt --edit
# Or edit directly
code ~/.english-optimizer/translation-prompt.txt
```

### Example Custom Prompts

**For formal business English:**

```
You are a professional business translator.
Translate/optimize to formal business English with professional terminology.
Text: "{text}"
```

**For casual developer chat:**

```
You are a software developer.
Translate/optimize to casual English like Slack messages.
Text: "{text}"
```

**For technical documentation:**

```
You are a technical documentation translator.
Translate/optimize to precise technical documentation English.
Text: "{text}"
```

See `TRANSLATION_PROMPT_EXAMPLE.md` for more examples.

## Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Setup Ollama (Local AI)

```bash
# Make setup script executable
chmod +x scripts/setup-ollama.sh

# Run setup (starts Ollama and pulls the model)
./scripts/setup-ollama.sh
```

### 3. Build the CLI

```bash
npm run build
```

### 4. Start Using

```bash
npm start
# or
cao
```

## Usage

### Instant Mode (Default)

Just run the CLI and start typing! Press **Cmd+key** to instantly optimize:

```bash
cao
# or
npm start
```

**How it works:**

1. Type your text normally
2. Press `Cmd+P` for Professional tone
3. Press `Cmd+C` for Concise version
4. Press `Cmd+G` for Grammar fix
5. Press `Cmd+D` for Senior developer style
6. Press **Enter** to accept the optimization, or keep typing to ignore

**Controls:**

- `Ctrl+U` - Clear text
- `Ctrl+C` - Quit

### Classic Mode (Optional)

If you prefer to submit text first, then choose optimizations:

```bash
cao --classic
# or
npm start -- --classic
```

1. Enter your text (press Enter twice to finish)
2. Press hotkeys to see different optimizations:
   - `Ctrl+P` - Professional tone
   - `Ctrl+C` - Concise version
   - `Ctrl+G` - Grammar fix
   - `Ctrl+D` - Senior developer style
   - `Ctrl+R` - Reset to original
   - `Ctrl+H` - View history
   - `Ctrl+Q` - Quit

### View History

```bash
cao history
cao history -n 5  # Show last 5 entries
```

### List Custom Prompts

```bash
cao prompts
```

### Check Configuration

```bash
# Show current configuration
cao config

# Run interactive setup wizard
cao config --setup

# Test API configuration
cao test
```

The test command will:

- Verify your API configuration is valid
- Test connection to the API provider
- Run a simple optimization test
- Show detailed error messages if something is wrong

The setup wizard will guide you through:

- Choosing AI provider (local Ollama or cloud API)
- Configuring API settings
- Setting up preferences

## Configuration

The CLI can be configured via:

1. **Environment Variables** (`.env` file)
2. **Config File** (`~/.english-optimizer/config.yaml` or `~/.english-optimizer/config.json`)

### Using Cloud APIs (OpenAI, GLM, DeepSeek, etc.)

By default, the CLI uses local Ollama. To use cloud APIs, you need to configure them.

**Quick Setup:**

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` with your API configuration:

```env
AI_PROVIDER=api
API_PROVIDER=openai  # or 'glm', 'custom'
API_KEY=your_api_key_here
API_BASE_URL=https://api.openai.com/v1
API_MODEL=gpt-4o
```

For detailed API configuration instructions, see [API_SETUP.md](API_SETUP.md)

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# AI Provider: 'ollama' for local, 'api' for cloud
AI_PROVIDER=ollama

# Ollama Configuration (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# API Configuration (cloud - OpenAI/GLM)
# AI_PROVIDER=api
# API_PROVIDER=openai
# API_KEY=your_api_key_here
# API_BASE_URL=https://api.openai.com/v1
# API_MODEL=gpt-3.5-turbo

# For GLM (Zhipu AI)
# API_PROVIDER=glm
# API_KEY=your_glm_api_key
# API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
# API_MODEL=glm-4
```

### Config File

The config file can be in YAML or JSON format and is created automatically at `~/.english-optimizer/config.yaml` (or `config.json`):

```yaml
ai:
  provider: 'ollama'
  ollama:
    baseUrl: 'http://localhost:11434'
    model: 'llama3.2:3b'
  api:
    provider: 'openai'
    apiKey: ''
    baseUrl: 'https://api.openai.com/v1'
    model: 'gpt-3.5-turbo'

hotkeys:
  professional: 'p'
  concise: 'c'
  grammar: 'g'
  senior_developer: 'd'
  reset: 'r'
  history: 'h'
  quit: 'q'

features:
  enableHistory: true
  historyPath: ~/.english-optimizer/history.json
  enableCustomPrompts: true
  customPromptsPath: ~/.english-optimizer/prompts.json
  useYAMLPrompt: true
```

## Custom Prompts

You can create custom optimization prompts at `~/.english-optimizer/prompts.json`:

```json
[
  {
    "name": "Academic",
    "description": "Rewrite in an academic style suitable for research papers",
    "prompt": "Please rewrite the following text in an academic style...",
    "hotkey": "a"
  },
  {
    "name": "Friendly",
    "description": "Make the text more friendly and casual",
    "prompt": "Please rewrite the following text to sound more friendly...",
    "hotkey": "f"
  }
]
```

## Docker Commands

```bash
# Start Ollama
docker-compose up -d

# Stop Ollama
docker-compose down

# View logs
docker-compose logs -f ollama

# Restart Ollama
docker-compose restart
```

## Production Deployment

To use cloud APIs instead of local Ollama:

1. Update your `.env` file:

   ```env
   AI_PROVIDER=api
   API_PROVIDER=openai  # or 'glm' for Zhipu AI
   API_KEY=your_actual_api_key
   API_MODEL=gpt-3.5-turbo  # or your preferred model
   ```

2. The CLI will automatically use the cloud API

## Development

```bash
# Watch and rebuild
npm run watch

# Run in development mode
npm run dev

# Lint
npm run lint
```

## Project Structure

```
english-optimizer-cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── core/
│   │   ├── editor.ts         # Interactive editor with hotkeys
│   │   └── optimizer.ts      # Optimization orchestration
│   ├── ai/
│   │   ├── provider.ts       # AI provider factory
│   │   ├── ollama.ts         # Ollama integration
│   │   └── api-provider.ts   # OpenAI/GLM integration
│   ├── prompts/
│   │   ├── templates.ts      # Built-in prompt templates
│   │   └── custom.ts         # Custom prompt loader
│   ├── config/
│   │   └── config.ts         # Configuration management
│   ├── history/
│   │   └── logger.ts         # History logging
│   └── utils/
│       └── display.ts        # Output formatting
├── docker-compose.yml        # Ollama Docker setup
├── scripts/
│   └── setup-ollama.sh      # Setup script
└── package.json
```

## Troubleshooting

### Ollama Connection Failed

```bash
# Check if Ollama is running
docker-compose ps

# Restart Ollama
docker-compose restart

# Check Ollama logs
docker-compose logs ollama
```

### Model Not Found

```bash
# Manually pull the model
docker exec -it english-optimizer-ollama ollama pull llama3.2:3b
```

### API Key Issues

Make sure your `.env` file has the correct API key and the API provider URL is accurate.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Created with ❤️ for non-native English speakers everywhere.
