# Agentation

AI-powered UI feedback system with MCP sampling support.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Architecture                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     WebSocket      ┌─────────────┐     MCP Sampling   │
│  │   Chrome    │ ◄──────────────► │  Agentation  │ ◄────────────────► │
│  │  Extension  │    localhost:19989 │  MCP Server  │                    │
│  └─────────────┘                    └─────────────┘                    │
│        │                                   │                            │
│        │ User annotations                  │ sampling/createMessage     │
│        ▼                                   ▼                            │
│  ┌─────────────┐                    ┌─────────────┐                    │
│  │  Web Page   │                    │  OpenCode   │ ──► LLM            │
│  │  (target)   │                    │   (fork)    │                    │
│  └─────────────┘                    └─────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `@agentation/extension` | Chrome extension for UI annotation |
| `@agentation/mcp-server` | MCP server with WebSocket + sampling |
| `@agentation/shared` | Shared types and constants |

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build packages

```bash
pnpm build
```

### 3. Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension` directory

### 4. Start MCP Server

```bash
# Add to your MCP client config (e.g., opencode.json)
{
  "mcp": {
    "agentation": {
      "type": "local",
      "command": ["node", "/path/to/agentation/packages/mcp-server/dist/cli.js"]
    }
  }
}
```

## Usage

1. Click the Agentation toolbar on any webpage
2. Activate annotation mode (toggle button)
3. Click on elements to add feedback
4. Click "AI에게 지시하기" to send feedback to AI

## Phase 2: OpenCode Sampling Support

To enable full sampling support, OpenCode needs to be forked and modified:

### Required Changes

1. **Add sampling capability** in MCP client initialization:
```typescript
// packages/opencode/src/mcp/client.ts
{
  capabilities: {
    sampling: {}
  }
}
```

2. **Implement sampling handler**:
```typescript
// Handle sampling/createMessage requests from MCP servers
server.setRequestHandler('sampling/createMessage', async (request) => {
  // Check trust level
  // Show approval UI if needed
  // Call LLM with the request
  // Return response
});
```

3. **Add trust level configuration** in config schema:
```typescript
// packages/opencode/src/config/config.ts
sampling: {
  trustLevels: {
    "agentation": { mode: "auto", maxTokens: 4096 },
    "*": { mode: "prompt" }
  }
}
```

4. **Add TUI approval dialog** for sampling requests

See `docs/opencode-sampling-guide.md` for detailed implementation guide.

## Development

```bash
# Watch mode for all packages
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

MIT
