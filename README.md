# CursorLearn2API

OpenAI-compatible API service for Cursor AI models using Playwright automation. Educational project for learning API integration patterns.

<img width="829" height="390" alt="image" src="https://github.com/user-attachments/assets/1e3a64fb-81e9-4818-817e-4f441fdcea02" />

## Features

- OpenAI API compatibility implementation
- Web automation with Playwright
- Streaming and non-streaming responses
- Making LLM APIs accessible to everyone

## Limitations

- File and image uploads not supported
- Tool calling (function calling) not supported (TODO)

## Requirements

- Node.js >= 16.0.0
- npm or yarn
- Chrome/Chromium browser

## Installation

Clone and install:
```bash
git clone https://github.com/gmh5225/cursorlearn2api.git
cd cursorlearn2api
npm install
npx playwright install chromium
```

## Usage

Start the server:
```bash
npm start
```

Server runs on port 30011 by default. Set `PORT` environment variable to change.

## API Endpoints

**Chat Completions**
```bash
POST /v1/chat/completions
```

Example:
```bash
curl -X POST http://localhost:30011/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-4-sonnet",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'
```

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
