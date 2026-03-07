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

function isLocalhostHost(host: string): boolean {
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
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

  // Build server options, adding auth for stream mode when API key is configured
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serverOptions: any = {
    name: config.server.name,
    version: VERSION,
  };

  if (config.server.streamApiKey) {
    serverOptions.authenticate = async (request: { headers: Record<string, unknown> }) => {
      const apiKey = request.headers['x-api-key'];

      if (apiKey !== config.server.streamApiKey) {
        throw new Response(null, { status: 401, statusText: 'Unauthorized' });
      }

      return {};
    };
  }

  const server = new FastMCP(serverOptions);

  registerTools(server, { readOnly: config.server.readOnly });

  if (transportType === 'stdio') {
    server.start({ transportType });
  } else if (transportType === 'stream') {
    // Enforce auth when binding to non-localhost addresses
    if (!config.server.streamApiKey && !isLocalhostHost(config.server.host)) {
      throw new Error(
        'STREAM_API_KEY is required when SERVER_HOST is not localhost. ' +
          'Set STREAM_API_KEY or use SERVER_HOST=127.0.0.1 for local-only access.',
      );
    }

    if (!config.server.streamApiKey && isLocalhostHost(config.server.host)) {
      log.warn(
        'Stream mode started without STREAM_API_KEY on localhost. ' +
          'Set STREAM_API_KEY for authenticated access.',
      );
    }

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
