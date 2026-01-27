# OpenCode Sampling Implementation Guide

This guide describes how to add MCP sampling support to OpenCode.

## Overview

MCP Sampling allows MCP servers to request LLM completions from clients. This enables the Agentation MCP server to send user feedback directly to the AI via OpenCode.

## Files to Modify

Based on OpenCode's architecture (from DeepWiki analysis):

| File | Purpose |
|------|---------|
| `packages/opencode/src/mcp/client.ts` | MCP client - add sampling capability |
| `packages/opencode/src/config/config.ts` | Add sampling configuration schema |
| `packages/opencode/src/session/llm.ts` | LLM interaction for sampling |
| `packages/opencode/src/cli/cmd/tui/component/dialog-sampling.tsx` | TUI approval dialog |

## Step 1: Add Sampling Capability

In the MCP client initialization, declare sampling support:

```typescript
// packages/opencode/src/mcp/client.ts

import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client(
  { name: 'opencode', version: '1.0.0' },
  {
    capabilities: {
      sampling: {},  // Add this
      // ... existing capabilities
    },
  }
);
```

## Step 2: Add Configuration Schema

```typescript
// packages/opencode/src/config/config.ts

// Add to the config schema
const SamplingTrustLevel = z.object({
  mode: z.enum(['auto', 'prompt', 'deny']).default('prompt'),
  maxTokens: z.number().optional(),
  dailyLimit: z.number().optional(),
});

const SamplingConfig = z.object({
  trustLevels: z.record(z.string(), SamplingTrustLevel).default({}),
  defaultTrustLevel: SamplingTrustLevel.default({ mode: 'prompt' }),
  globalDailyLimit: z.number().optional(),
});

// Add to main config
const Config = z.object({
  // ... existing fields
  sampling: SamplingConfig.optional(),
});
```

Example configuration:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "sampling": {
    "trustLevels": {
      "agentation": {
        "mode": "auto",
        "maxTokens": 4096,
        "dailyLimit": 100
      }
    },
    "defaultTrustLevel": {
      "mode": "prompt"
    }
  }
}
```

## Step 3: Implement Sampling Handler

```typescript
// packages/opencode/src/mcp/sampling-handler.ts

import { CreateMessageRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Session } from '../session/index.js';
import type { SamplingConfig } from '../config/config.js';

interface SamplingRequest {
  serverId: string;
  serverName: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: { type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string };
  }>;
  systemPrompt?: string;
  maxTokens?: number;
  modelPreferences?: {
    hints?: Array<{ name: string }>;
    costPriority?: number;
    speedPriority?: number;
    intelligencePriority?: number;
  };
}

export class SamplingHandler {
  private dailyUsage: Map<string, number> = new Map();
  
  constructor(
    private config: SamplingConfig,
    private session: Session,
    private approvalCallback: (request: SamplingRequest) => Promise<boolean>
  ) {}

  async handleRequest(serverId: string, serverName: string, params: unknown): Promise<{
    role: 'assistant';
    content: { type: 'text'; text: string };
    model: string;
    stopReason?: string;
  }> {
    const request = CreateMessageRequestSchema.parse(params);
    
    const trustLevel = this.config.trustLevels[serverId] 
      || this.config.trustLevels[serverName]
      || this.config.defaultTrustLevel;

    // Check if denied
    if (trustLevel.mode === 'deny') {
      throw new Error(`Sampling denied for server: ${serverName}`);
    }

    // Check daily limit
    const today = new Date().toDateString();
    const usageKey = `${serverId}:${today}`;
    const currentUsage = this.dailyUsage.get(usageKey) || 0;
    
    if (trustLevel.dailyLimit && currentUsage >= trustLevel.dailyLimit) {
      throw new Error(`Daily sampling limit exceeded for server: ${serverName}`);
    }

    // Check if approval needed
    if (trustLevel.mode === 'prompt') {
      const approved = await this.approvalCallback({
        serverId,
        serverName,
        messages: request.messages,
        systemPrompt: request.systemPrompt,
        maxTokens: request.maxTokens,
        modelPreferences: request.modelPreferences,
      });

      if (!approved) {
        throw new Error('Sampling request denied by user');
      }
    }

    // Enforce max tokens
    const maxTokens = trustLevel.maxTokens 
      ? Math.min(request.maxTokens || 4096, trustLevel.maxTokens)
      : request.maxTokens || 4096;

    // Call LLM
    const response = await this.session.llm.complete({
      messages: request.messages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content.text,
      })),
      systemPrompt: request.systemPrompt,
      maxTokens,
    });

    // Update usage
    this.dailyUsage.set(usageKey, currentUsage + 1);

    return {
      role: 'assistant',
      content: { type: 'text', text: response.text },
      model: response.model,
      stopReason: response.stopReason,
    };
  }
}
```

## Step 4: TUI Approval Dialog

```tsx
// packages/opencode/src/cli/cmd/tui/component/dialog-sampling.tsx

import React from 'react';
import { Box, Text } from 'ink';
import { DialogSelect } from '../ui/dialog-select.js';

interface SamplingApprovalDialogProps {
  serverName: string;
  systemPrompt?: string;
  messages: Array<{ role: string; content: { type: string; text?: string } }>;
  onApprove: () => void;
  onDeny: () => void;
  onEdit?: (editedPrompt: string) => void;
}

export function SamplingApprovalDialog({
  serverName,
  systemPrompt,
  messages,
  onApprove,
  onDeny,
}: SamplingApprovalDialogProps) {
  const lastMessage = messages[messages.length - 1];
  const prompt = lastMessage?.content?.text || '';
  const previewLength = 500;
  const truncatedPrompt = prompt.length > previewLength 
    ? prompt.slice(0, previewLength) + '...' 
    : prompt;

  return (
    <DialogSelect
      title={`Sampling Request from ${serverName}`}
      description={
        <Box flexDirection="column">
          <Text dimColor>System: {systemPrompt?.slice(0, 100) || '(none)'}</Text>
          <Text> </Text>
          <Text>Prompt:</Text>
          <Text>{truncatedPrompt}</Text>
        </Box>
      }
      options={[
        { label: 'Allow', value: 'allow' },
        { label: 'Deny', value: 'deny' },
      ]}
      onSelect={(value) => {
        if (value === 'allow') onApprove();
        else onDeny();
      }}
    />
  );
}
```

## Step 5: Wire It All Together

```typescript
// packages/opencode/src/mcp/client.ts (continued)

// After client initialization, set up the sampling handler
client.setRequestHandler('sampling/createMessage', async (request) => {
  const handler = new SamplingHandler(
    config.sampling,
    currentSession,
    async (samplingRequest) => {
      // Show TUI dialog and wait for user response
      return new Promise((resolve) => {
        showSamplingDialog(samplingRequest, resolve);
      });
    }
  );

  return handler.handleRequest(
    request.params._meta?.serverId,
    serverName,
    request.params
  );
});
```

## Testing

1. Start the Agentation MCP server
2. Configure OpenCode with the agentation MCP server
3. Open a webpage in Chrome with the extension
4. Add annotations and click "AI에게 지시하기"
5. OpenCode should receive the sampling request

## Security Considerations

- Always validate incoming sampling requests
- Enforce token limits to prevent abuse
- Log all sampling requests for audit
- Never auto-approve for unknown servers
- Consider rate limiting per server

## Rollback Plan

If sampling causes issues:

1. Set `defaultTrustLevel.mode` to `"deny"`
2. Or remove `sampling` from capabilities declaration
