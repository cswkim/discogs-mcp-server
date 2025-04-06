#!/usr/bin/env node
import { FastMCP } from 'fastmcp';
import { config, validateConfig } from './config.js';
import { log } from './utils.js';

type ServerTransportType = 'stdio' | 'sse';

function assertTransportType(transportType: string): transportType is ServerTransportType {
  return transportType === 'stdio' || transportType === 'sse';
}

try {
  validateConfig();

  // Grab the transport type from the command line
  const transportType = process.argv[2] ?? 'stdio';

  // Make sure the transport type is allowed
  if (!assertTransportType(transportType)) {
    throw Error(`Invalid transport type: "${transportType}". Allowed: 'stdio' (default) or 'sse'.`);
  }

  const server = new FastMCP({
    name: config.server.name,
    version: '0.1.0',
  });

  if (transportType === 'stdio') {
    server.start({ transportType });
  } else if (transportType === 'sse') {
    server.start({
      transportType,
      sse: {
        port: config.server.port!,
        endpoint: '/sse',
      },
    });
  }

  log.info(`${config.server.name} started with transport type: ${transportType}`);
} catch (error: unknown) {
  log.error(`Failed to run the ${config.server.name}: `, error);
  process.exit(1);
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log.info('Shutting down server...');
  process.exit(0);
});
