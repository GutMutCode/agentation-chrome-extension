# Agentation

[한국어](README.ko.md)

AI-powered UI feedback system. Annotate webpage elements and send feedback directly to OpenCode sessions via MCP sampling.

> **Inspired by [benjitaylor/agentation](https://github.com/benjitaylor/agentation)** — the original visual feedback tool for AI agents.
> See [my proposal](https://github.com/benjitaylor/agentation/issues/26) for a Chrome Extension version.

## 💡 Quick Start: Extension Only

> **No setup required for basic usage!**
>
> The Chrome Extension works **standalone** — just load it and use **Copy to Clipboard**.
> Paste into ChatGPT, Claude, or any AI chat.
>
> MCP setup is only needed for **Send to AI** (direct OpenCode integration).

| Feature             | Extension Only | With MCP Setup |
| ------------------- | -------------- | -------------- |
| Annotate elements   | ✅             | ✅             |
| Copy to Clipboard   | ✅             | ✅             |
| Send to AI (direct) | ❌             | ✅             |

**Extension-only install:**

```bash
git clone https://github.com/GutMutCode/agentation.git
# Then: chrome://extensions/ → Developer mode → Load unpacked → (root folder)
```

## 💡 Quick Start: With MCP

```bash
git clone https://github.com/GutMutCode/agentation.git
cd agentation
./start
```

Then load Chrome extension: `chrome://extensions/` → Developer mode → Load unpacked → (root folder)

## Why This Fork?

|                 | [Original](https://github.com/benjitaylor/agentation) | This Project                   |
| --------------- | ----------------------------------------------------- | ------------------------------ |
| **Type**        | React component                                       | Chrome Extension               |
| **Usage**       | `npm install` in your app                             | Works on **any website**       |
| **Output**      | Copy to clipboard                                     | Direct to AI via MCP           |
| **Integration** | Manual paste to AI                                    | Auto-sends to OpenCode session |

## Installation

```bash
git clone https://github.com/GutMutCode/agentation.git
cd agentation
# (Optional) xoc integration
# xoc add agentation .
```

1. **Load Extension**: `chrome://extensions/` → Developer mode → Load unpacked → select `agentation` root directory.
2. **Run MCP Server**: Execute `./start` to run with OpenCode.

### xoc Integration (Optional)

If you have [xoc](https://github.com/GutMutCode/xoc) installed:

```bash
xoc add agentation /path/to/agentation
xoc run agentation
```

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
│  │  (target)   │                    │             │                    │
│  └─────────────┘                    └─────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** 20+
- **pnpm** or **npm** (pnpm recommended: `npm install -g pnpm`)
- **Chrome** browser
- **OpenCode** binary (provided via [xoc](https://github.com/GutMutCode/xoc) or `XOPENCODE_BINARY` environment variable)

## Usage

> **Important:** Agentation must be running before using the extension.

1. **Start Agentation**: Run `./start`
2. **Open any webpage** in Chrome
3. **Find Agentation toolbar** (floating button, bottom-right corner)
4. **Enable annotation mode** (click the toggle icon)
5. **Click any element** to add feedback annotation
6. **Enter your feedback** in the popup
7. **Click "AI에게 지시하기"** (Send to AI)
8. **In OpenCode TUI:** Approve the sampling request (Allow/Deny dialog)
9. **Continue conversation** in the OpenCode session

## Design Terms

When annotating elements, you can select **design terms** to communicate your design intent more precisely.

### How to Use

1. Click on an element to open the annotation popup
2. Click **"Choose Design Style"** button
3. Browse categories: Layout, Interaction, Feedback, Visual, Animation, Concept
4. **Hover** over a term to see a **live preview demo**
5. **Click** to select (multiple selections allowed)
6. Selected terms appear as chips below the button
7. Send feedback — design terms are included automatically

### Available Terms (40 total)

| Category        | Examples                                                    |
| --------------- | ----------------------------------------------------------- |
| **Layout**      | GNB, Sticky Header, Hero Section, Card Grid, Masonry        |
| **Interaction** | Hover Effect, Drag & Drop, Infinite Scroll, Pull to Refresh |
| **Feedback**    | Toast, Skeleton Loading, Progress Bar, Empty State          |
| **Visual**      | Glassmorphism, Neumorphism, Gradient, Blur Effect           |
| **Animation**   | Fade, Slide, Bounce, Morph, Parallax                        |
| **Concept**     | Dark Mode, Responsive, Accessibility, Micro-interaction     |

## Troubleshooting

### WebSocket not connected

- Check if OpenCode is running via `./start`
- Check if agentation MCP server is loaded: Press `Ctrl+M` in OpenCode TUI

### Sampling request not appearing

- Verify `sampling` config in `opencode.json`
- Check mode is not `deny`

### Extension not showing toolbar

- Refresh the webpage
- Check extension is enabled in `chrome://extensions/`

## Packages

| Package               | Description                          |
| --------------------- | ------------------------------------ |
| `packages/mcp-server` | MCP server with WebSocket + sampling |
| `packages/shared`     | Shared types                         |

Note: Extension files are located at the root level.

## Recommended: Use with Playwriter

For the best experience, use Agentation together with [Playwriter](https://github.com/remorses/playwriter) — a browser automation MCP that controls your existing Chrome.

| Tool           | Role                                         |
| -------------- | -------------------------------------------- |
| **Agentation** | Annotate UI elements → Send feedback to AI   |
| **Playwriter** | AI controls browser → Test, verify, interact |

### Setup

1. Install [Playwriter Chrome Extension](https://chromewebstore.google.com/detail/playwriter-mcp/jfeammnjpkecdekppnclgkkffahnhfhe)
2. Click extension icon on a tab (turns green when connected)
3. Your `opencode.json` should include both `agentation` and `playwriter` MCP servers.

## Development

```bash
pnpm dev        # Watch mode
pnpm typecheck  # Type check
```

## Acknowledgments

- [benjitaylor/agentation](https://github.com/benjitaylor/agentation) — Original concept and inspiration
- [opencode-ai/opencode](https://github.com/opencode-ai/opencode) — Terminal-based AI coding assistant

## License

MIT — See [LICENSE](LICENSE)

