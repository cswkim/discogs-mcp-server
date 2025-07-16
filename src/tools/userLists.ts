import type { FastMCP, Tool } from 'fastmcp';
import { formatDiscogsError } from '../errors.js';
import { ListService } from '../services/list.js';
import { UserService } from '../services/user/index.js';
import { ListIdParamSchema } from '../types/list.js';
import { UserListsParamsSchema } from '../types/user/index.js';

type FastMCPSessionAuth = Record<string, unknown> | undefined;

/**
 * MCP tool for fetching a Discogs user's lists
 */
export const getUserListsTool: Tool<FastMCPSessionAuth, typeof UserListsParamsSchema> = {
  name: 'get_user_lists',
  description: `Get a user's lists`,
  parameters: UserListsParamsSchema,
  execute: async (args) => {
    try {
      const userService = new UserService();
      const lists = await userService.lists.get(args);

      return JSON.stringify(lists);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

/**
 * MCP tool for fetching a Discogs list by ID
 */
export const getListTool: Tool<FastMCPSessionAuth, typeof ListIdParamSchema> = {
  name: 'get_list',
  description: `Get a list by ID`,
  parameters: ListIdParamSchema,
  execute: async (args) => {
    try {
      const listService = new ListService();
      const list = await listService.getList(args);

      return JSON.stringify(list);
    } catch (error) {
      throw formatDiscogsError(error);
    }
  },
};

export function registerUserListsTools(server: FastMCP): void {
  server.addTool(getUserListsTool);
  server.addTool(getListTool);
}
