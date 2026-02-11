# AGENTS.md — Agentation

> AI-powered UI feedback system. Chrome Extension annotates webpage elements, sends feedback to OpenCode sessions via MCP sampling.

## Repository Structure

```
agentation/                     # pnpm monorepo (Turborepo)
├── packages/
│   ├── mcp-server/             # TypeScript — MCP server + WebSocket bridge
│   ├── shared/                 # TypeScript — Shared types & constants
│   └── extension/              # Vanilla JS — Chrome Extension (no build step)
├── external/opencode/          # Git submodule — OpenCode fork (DO NOT EDIT)
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # Workspace: packages/*
└── package.json                # Root scripts, pnpm@9.15.0
```

**Key boundaries:**

- `external/opencode/` is a git submodule. Never modify files there.
- `packages/extension/` is vanilla JS (CommonJS, no TypeScript, no build).
- `packages/mcp-server/` and `packages/shared/` are TypeScript (ESM, strict mode).

## Build / Dev / Test Commands

```bash
# Install
pnpm install

# Build all packages (respects dependency order via turbo)
pnpm build

# Build a single package
pnpm build --filter @agentation/mcp-server
pnpm build --filter @agentation/shared

# Dev mode (watch)
pnpm dev

# Type check
pnpm typecheck
pnpm typecheck --filter @agentation/mcp-server

# Format
pnpm format                     # prettier --write

# Clean
pnpm clean
```

**No test runner is configured.** There are no test files or test framework dependencies.
If adding tests, use vitest (consistent with the Node/TS ecosystem here).

**Extension has no build step.** Load `packages/extension/` directly in Chrome as an unpacked extension.

## TypeScript Configuration

Both `mcp-server` and `shared` use identical tsconfig:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true, // All strict checks enabled
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
  },
}
```

**Critical:** `module: "NodeNext"` requires `.js` extensions on relative imports:

```typescript
// CORRECT
import { AgentationMCPServer } from "./mcp-server.js";
// WRONG — will fail at runtime
import { AgentationMCPServer } from "./mcp-server";
```

## Code Style Guidelines

### Imports

- **TypeScript packages:** ESM (`import`/`export`). Use `type` keyword for type-only imports.
- **Extension (vanilla JS):** IIFE pattern `(function() { "use strict"; ... })()` or bare scripts.
- Cross-package imports use `@agentation/shared` (workspace protocol).
- External deps: `@modelcontextprotocol/sdk`, `ws`, `zod`.

```typescript
// Type-only import
import type { Annotation, SubmitFeedbackPayload } from "@agentation/shared";
// Value import
import { DEFAULT_MCP_SERVER_PORT } from "@agentation/shared";
```

### Naming Conventions

| Element                 | Convention              | Example                                            |
| ----------------------- | ----------------------- | -------------------------------------------------- |
| Files                   | `kebab-case.ts`         | `mcp-server.ts`, `websocket-server.ts`             |
| Classes                 | `PascalCase`            | `AgentationMCPServer`, `AgentationWebSocketServer` |
| Interfaces/Types        | `PascalCase`            | `ExtensionClient`, `FeedbackSubmission`            |
| Functions/methods       | `camelCase`             | `handleSubmitFeedback`, `sendToClient`             |
| Constants               | `UPPER_SNAKE_CASE`      | `DEFAULT_MCP_SERVER_PORT`, `ERROR_CODES`           |
| Private methods         | `camelCase` (no prefix) | `private handleConnection()`                       |
| WebSocket message types | `kebab-case` strings    | `'submit-feedback'`, `'feedback-result'`           |
| CSS classes (extension) | `agentation-` prefix    | `agentation-toolbar`, `agentation-marker`          |

### Types & Error Handling

- Use `zod` for runtime validation of external input (MCP tool schemas).
- Use TypeScript interfaces for internal type contracts.
- Discriminated unions for message types (`WebSocketMessage` with `type` field).
- Error handling pattern: `error instanceof Error ? error.message : String(error)`.
- Log with prefixed tags: `[MCP]`, `[WS]`, `[CLI]`, `[Agentation]`.

```typescript
// Discriminated union pattern
export type WebSocketMessageType =
  | "connect"
  | "disconnect"
  | "submit-feedback"
  | "feedback-result"
  | "status"
  | "error";

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  id?: string;
  payload?: T;
  timestamp: string;
}
```

### Formatting

- **Prettier** with defaults (no `.prettierrc` found — uses Prettier defaults).
- Double quotes in TypeScript files.
- Semicolons: yes.
- Trailing commas in multi-line structures.
- 2-space indentation.

### Class Structure Pattern

TypeScript classes follow this layout:

1. Private fields
2. Constructor
3. Public methods (`start`, `stop`, `getX`)
4. Private handler methods (`handleX`, `buildX`)

### Extension (Vanilla JS) Patterns

- All content scripts wrapped in IIFE with `"use strict"`.
- DOM manipulation via `document.createElement` / `element.innerHTML`.
- State stored in closure variables (module-scoped `let`).
- Chrome API: `chrome.runtime.sendMessage`, `chrome.storage.local`.
- Global exports via `window.PropertyName` for cross-script communication.
- Internationalization via `window.agentationI18n.t(key, params)`.

## Architecture Notes

```
Chrome Extension ←→ WebSocket (port 19989) ←→ MCP Server ←→ OpenCode (stdio)
```

- **MCP Server** (`AgentationMCPServer`): Exposes MCP tools (`get-pending-feedback`, `get-connection-status`) via stdio transport, and uses MCP sampling (`server.createMessage`) to relay feedback to the LLM.
- **WebSocket Server** (`AgentationWebSocketServer`): Bridges the Chrome extension. Manages client connections, routes feedback submissions, sends results back.
- **Shared** (`@agentation/shared`): Type definitions and constants only. No runtime logic.
- **Extension**: Vanilla JS Chrome extension. Injects content scripts for element annotation, popover UI, design term selection, and WebSocket client.

## Dependencies

| Package      | Key Dependencies                                               |
| ------------ | -------------------------------------------------------------- |
| `mcp-server` | `@modelcontextprotocol/sdk`, `ws`, `zod`, `@agentation/shared` |
| `shared`     | None (types only)                                              |
| `extension`  | `playwright` (devDep, for screenshots only)                    |

## Things to Avoid

- **Never** use `as any` or `@ts-ignore` — the codebase uses `strict: true`.
- **Never** modify `external/opencode/` — it's a git submodule.
- **Never** add a build step to the extension — it loads directly as unpacked.
- **Never** forget `.js` extensions on relative TypeScript imports.
- **Never** use `require()` in TypeScript packages — they are ESM (`"type": "module"`).
