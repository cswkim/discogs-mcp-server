#!/usr/bin/env node
import { FastMCP } from 'fastmcp';
import { config, validateConfig } from './config.js';
import { registerTools } from './tools/index.js';
import { log } from './utils.js';
import { VERSION } from './version.js';

type ServerTransportType = 'stdio' | 'stream';

function assertTransportType(transportType: string): transportType is ServerTransportType {
  return transportType === 'stdio' || transportType === 'stream';
}

try {
  validateConfig();

  // Grab the transport type from the command line
  const transportType = process.argv[2] ?? 'stdio';

  // Make sure the transport type is allowed
  if (!assertTransportType(transportType)) {
    throw Error(
      `Invalid transport type: "${transportType}". Allowed: 'stdio' (default) or 'stream'.`,
    );
  }

  const server = new FastMCP({
    name: config.server.name,
    version: VERSION,
  });

  registerTools(server, { readOnly: config.server.readOnly });

  if (transportType === 'stdio') {
    server.start({ transportType });
  } else if (transportType === 'stream') {
    server.start({
      transportType: 'httpStream',
      httpStream: {
        port: config.server.port,
        host: config.server.host,
      },
    });
  }

  if (config.server.readOnly) {
    log.info('Read-only mode enabled: mutating tools are disabled');
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
