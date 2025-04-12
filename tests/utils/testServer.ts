import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { FastMCP } from 'fastmcp';
import { getRandomPort } from 'get-port-please';

export const runWithTestServer = async ({
  run,
  server: createServer,
}: {
  server?: () => Promise<FastMCP>;
  run: ({
    client,
    server,
    session,
  }: {
    client: Client;
    server: FastMCP;
    session: any;
  }) => Promise<void>;
}) => {
  const port = await getRandomPort();

  const server = createServer
    ? await createServer()
    : new FastMCP({
        name: 'Test',
        version: '1.0.0',
      });

  await server.start({
    transportType: 'sse',
    sse: {
      endpoint: '/sse',
      port,
    },
  });

  try {
    const client = new Client(
      {
        name: 'example-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      },
    );

    const transport = new SSEClientTransport(new URL(`http://localhost:${port}/sse`));

    const session = await new Promise<any>((resolve) => {
      server.on('connect', (event) => {
        resolve(event.session);
      });

      client.connect(transport);
    });

    await run({ client, server, session });
  } finally {
    await server.stop();
  }

  return port;
};
