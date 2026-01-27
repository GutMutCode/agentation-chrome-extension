#!/usr/bin/env node
import { WebSocket } from 'ws';

const ws = new WebSocket('ws://localhost:19989');

ws.on('open', () => {
  console.log('✅ Connected to MCP server WebSocket');
  
  ws.send(JSON.stringify({
    type: 'connect',
    payload: {
      pageUrl: 'http://test.local',
      pageTitle: 'Test Page'
    },
    timestamp: new Date().toISOString()
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('📨 Received:', JSON.stringify(msg, null, 2));
  
  if (msg.type === 'status') {
    console.log('\n🎯 MCP Status:');
    console.log('  - Connected:', msg.payload.connected);
    console.log('  - MCP Connected:', msg.payload.mcpConnected);
    console.log('  - Sampling Supported:', msg.payload.samplingSupported);
    
    console.log('\n✅ WebSocket test passed! Press Ctrl+C to exit.');
  }
});

ws.on('error', (err) => {
  console.error('❌ Connection failed:', err.message);
  console.log('\n💡 Make sure MCP server is running:');
  console.log('   node packages/mcp-server/dist/cli.js');
  process.exit(1);
});

ws.on('close', () => {
  console.log('🔌 Disconnected');
});
