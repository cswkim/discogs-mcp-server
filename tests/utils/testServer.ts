import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { FastMCP } from 'fastmcp';
import { getRandomPort } from 'get-port-please';

export const runWithTestServer = async ({
  run,
  server: createServer,
}: {
  server?: () => Promise<FastMCP>;
  run: ({ client, server }: { client: Client; server: FastMCP }) => Promise<void>;
}) => {
  const port = await getRandomPort();

  const server = createServer
    ? await createServer()
    : new FastMCP({
        name: 'Test',
        version: '1.0.0',
      });

  await server.start({
    transportType: 'httpStream',
    httpStream: {
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

    const transport = new StreamableHTTPClientTransport(new URL(`http://localhost:${port}/mcp`));

    await client.connect(transport);

    // Wait a bit to ensure connection is established
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await run({ client, server });

    // Clean up connection
    await transport.terminateSession();
    await client.close();
  } finally {
    await server.stop();
  }

  return port;
};
