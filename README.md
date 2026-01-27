# Agentation

AI-powered UI feedback system. Annotate webpage elements and send feedback directly to OpenCode sessions via MCP sampling.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────┐     WebSocket      ┌─────────────┐     MCP Sampling   │
│  │   Chrome    │ ◄──────────────►  │  Agentation  │ ◄────────────────► │
│  │  Extension  │    localhost:19989 │  MCP Server  │                    │
│  └─────────────┘                    └─────────────┘                    │
│        │                                   │                            │
│        │ User annotations                  │ sampling/createMessage     │
│        ▼                                   ▼                            │
│  ┌─────────────┐                    ┌─────────────┐                    │
│  │  Web Page   │                    │  OpenCode   │ ──► LLM Session    │
│  │  (target)   │                    │   (fork)    │                    │
│  └─────────────┘                    └─────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** 20+
- **pnpm** (`npm install -g pnpm`)
- **bun** (`curl -fsSL https://bun.sh/install | bash`)
- **Chrome** browser
- **Anthropic API key** or other LLM provider

## Quick Start

### 1. Clone

```bash
git clone --recursive https://github.com/GutMutCode/agentation.git
cd agentation
```

### 2. Build

```bash
pnpm install
pnpm build
cd external/opencode/packages/opencode && bun run build && cd ../../../..
```

### 3. Configure OpenCode

Create or edit `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "agentation": {
      "type": "local",
      "command": ["node", "AGENTATION_PATH/packages/mcp-server/dist/cli.js"]
    }
  },
  "sampling": {
    "agentation": {
      "mode": "prompt",
      "maxTokens": 4096
    }
  }
}
```

**Replace `AGENTATION_PATH`** with your actual path:
```bash
# Get your path
pwd
# Example: /Users/yourname/agentation
```

**Sampling modes:**
| Mode | Behavior |
|------|----------|
| `prompt` | Ask for approval each time (recommended) |
| `auto` | Auto-approve all requests |
| `deny` | Block all requests |

### 4. Load Chrome Extension

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select `packages/extension` folder

### 5. Start OpenCode

```bash
# From agentation directory
cd external/opencode/packages/opencode

# Run (choose your platform)
./dist/opencode-darwin-arm64/bin/opencode    # Mac M1/M2
./dist/opencode-darwin-x64/bin/opencode      # Mac Intel
./dist/opencode-linux-arm64/bin/opencode     # Linux ARM
./dist/opencode-linux-x64/bin/opencode       # Linux x64
```

First run will prompt for API key configuration.

## Usage

> **Important:** OpenCode must be running before using the extension.

1. **Start OpenCode** (Step 5 above)
2. **Open any webpage** in Chrome
3. **Find Agentation toolbar** (floating button, bottom-right corner)
4. **Enable annotation mode** (click the toggle icon)
5. **Click any element** to add feedback annotation
6. **Enter your feedback** in the popup
7. **Click "AI에게 지시하기"** (Send to AI)
8. **In OpenCode TUI:** Approve the sampling request (Allow/Deny dialog)
9. **Continue conversation** in the OpenCode session

## Troubleshooting

### WebSocket not connected
- Check if OpenCode is running
- Check if agentation MCP server is loaded: Press `Ctrl+M` in OpenCode TUI

### Sampling request not appearing
- Verify `sampling` config in `opencode.json`
- Check mode is not `deny`

### Extension not showing toolbar
- Refresh the webpage
- Check extension is enabled in `chrome://extensions/`

## Packages

| Package | Description |
|---------|-------------|
| `packages/extension` | Chrome extension for UI annotation |
| `packages/mcp-server` | MCP server with WebSocket + sampling |
| `packages/shared` | Shared types |
| `external/opencode` | OpenCode fork (submodule) |

## Development

```bash
pnpm dev        # Watch mode
pnpm typecheck  # Type check
```

## License

MIT
