import { FastMCP } from 'fastmcp';
import { describe, expect, it } from 'vitest';
import { registerTools } from '../../src/tools/index.js';
import { runWithTestServer } from '../utils/testServer.js';

describe('Tool annotations', () => {
  it('should declare readOnlyHint and openWorldHint on every registered tool', async () => {
    await runWithTestServer({
      server: async () => {
        const server = new FastMCP({
          name: 'Test',
          version: '1.0.0',
        });

        registerTools(server);
        return server;
      },
      run: async ({ client }) => {
        const { tools } = await client.listTools();
        expect(tools.length).toBeGreaterThan(0);

        for (const tool of tools) {
          expect(typeof tool.annotations?.readOnlyHint, tool.name).toBe('boolean');
          expect(typeof tool.annotations?.openWorldHint, tool.name).toBe('boolean');

          if (tool.annotations?.readOnlyHint === false) {
            expect(typeof tool.annotations?.destructiveHint, tool.name).toBe('boolean');
            expect(typeof tool.annotations?.idempotentHint, tool.name).toBe('boolean');
          }
        }
      },
    });
  });
});
