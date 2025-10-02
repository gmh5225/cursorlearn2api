# CursorLearn2API

OpenAI-compatible API service for Cursor AI models using Playwright automation. Educational project for learning API integration patterns.

<img width="829" height="390" alt="image" src="https://github.com/user-attachments/assets/1e3a64fb-81e9-4818-817e-4f441fdcea02" />

## Features

- OpenAI API compatibility implementation
- Web automation with Playwright
- Streaming and non-streaming responses
- Making LLM APIs accessible to everyone

## Limitations

- Image recognition not supported
- Tool calling (function calling) not supported (TODO)

## Requirements

- Node.js >= 16.0.0
- npm or yarn
- Chrome/Chromium browser

## Quick Start

### Option 1: Run with npx (Recommended)

No installation needed! Just run:
```bash
npx cursorlearn2api
```

First run will automatically install dependencies and Playwright browser.

### Option 2: Global Installation

```bash
npm install -g cursorlearn2api
cursorlearn2api
```

### Option 3: Manual Installation

Clone and install:
```bash
git clone https://github.com/gmh5225/cursorlearn2api.git
cd cursorlearn2api
npm install
npx playwright install chromium
npm start
```

Server runs on port `30011` by default. Set `PORT` environment variable to change.

**Optional: Enable API Key Authentication**
```bash
export API_KEY="your-secret-key"
npm start
```
Then add header: `Authorization: Bearer your-secret-key`

## API Endpoints

**Chat Completions**
```bash
POST /v1/chat/completions
```

Example:
```bash
curl -X POST http://localhost:30011/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY"\
  -d '{
    "model": "anthropic/claude-4.5-sonnet",
    "messages": [{"role": "user", "content": "Who are you"}],
    "stream": false
  }'
```

## Available Models

- `anthropic/claude-4-sonnet`
- `anthropic/claude-4.1-opus`
- `anthropic/claude-4.5-sonnet`
- `openai/gpt-5`
- `google/gemini-2.5-pro`
- `google/gemini-2.5-flash`
- `xai/grok-4`
- `xai/grok-code-fast-1`
- `moonshotai/kimi-k2-0905`
- `alibaba/qwen3-coder`
- `alibaba/qwen3-coder-plus`
- `alibaba/qwen3-max`
- `zai/glm-4.6`

## Development

**Formatting**
```bash
npm run format
```

**Linting**
```bash
npm run lint
```

## License

MIT License - see LICENSE file.

## Legal Notice

Educational use only. Users responsible for compliance with terms of service.
