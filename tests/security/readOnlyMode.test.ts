import { FastMCP } from 'fastmcp';
import { describe, expect, it, vi } from 'vitest';
import { registerTools } from '../../src/tools/index.js';

describe('Security: Read-only mode', () => {
  function getRegisteredToolNames(options: { readOnly?: boolean }): string[] {
    const server = new FastMCP({ name: 'Test', version: '1.0.0' });
    const registeredNames: string[] = [];
    const originalAddTool = server.addTool.bind(server);
    server.addTool = vi.fn((tool) => {
      registeredNames.push(tool.name);
      return originalAddTool(tool);
    });
    registerTools(server, options);
    return registeredNames;
  }

  const MUTATING_TOOLS = [
    'create_marketplace_listing',
    'update_marketplace_listing',
    'delete_marketplace_listing',
    'edit_marketplace_order',
    'create_marketplace_order_message',
    'edit_release_rating',
    'delete_release_rating',
    'create_user_collection_folder',
    'edit_user_collection_folder',
    'delete_user_collection_folder',
    'add_release_to_user_collection_folder',
    'rate_release_in_user_collection',
    'move_release_in_user_collection',
    'delete_release_from_user_collection_folder',
    'edit_user_collection_custom_field_value',
    'add_to_wantlist',
    'edit_item_in_wantlist',
    'delete_item_in_wantlist',
    'edit_user_profile',
    'inventory_export',
  ];

  const READ_ONLY_TOOLS = [
    'search',
    'get_release',
    'get_artist',
    'get_label',
    'get_master_release',
    'get_marketplace_listing',
    'get_marketplace_order',
    'get_marketplace_orders',
    'get_user_inventory',
    'get_user_collection_folders',
    'get_user_wantlist',
    'get_user_identity',
    'get_user_profile',
    'get_user_lists',
    'fetch_image',
  ];

  it('registers all tools when readOnly is false', () => {
    const names = getRegisteredToolNames({ readOnly: false });

    for (const tool of MUTATING_TOOLS) {
      expect(names, `Expected mutating tool "${tool}" to be registered`).toContain(tool);
    }
    for (const tool of READ_ONLY_TOOLS) {
      expect(names, `Expected read-only tool "${tool}" to be registered`).toContain(tool);
    }
  });

  it('excludes mutating tools when readOnly is true', () => {
    const names = getRegisteredToolNames({ readOnly: true });

    for (const tool of MUTATING_TOOLS) {
      expect(names, `Expected mutating tool "${tool}" to be excluded`).not.toContain(tool);
    }
  });

  it('includes read-only tools when readOnly is true', () => {
    const names = getRegisteredToolNames({ readOnly: true });

    for (const tool of READ_ONLY_TOOLS) {
      expect(names, `Expected read-only tool "${tool}" to be registered`).toContain(tool);
    }
  });
});
