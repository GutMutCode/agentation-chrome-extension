#!/usr/bin/env node
/**
 * Agentation MCP Server CLI
 * Starts the MCP server with WebSocket support for Chrome extension communication
 */

import { AgentationMCPServer } from './mcp-server.js';
import { DEFAULT_MCP_SERVER_PORT } from '@agentation/shared';

const PORT = parseInt(process.env.AGENTATION_PORT || String(DEFAULT_MCP_SERVER_PORT), 10);

async function main() {
  const server = new AgentationMCPServer(PORT);

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[CLI] Received ${signal}, shutting down...`);
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await server.start();
  } catch (error) {
    console.error('[CLI] Failed to start server:', error);
    process.exit(1);
  }
}

main();
