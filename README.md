[![License](https://img.shields.io/github/license/cswkim/discogs-mcp-server)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/cswkim/discogs-mcp-server)](https://github.com/cswkim/discogs-mcp-server/releases)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/cswkim/discogs-mcp-server/.github%2Fworkflows%2Fcheck-pr.yml)](https://github.com/cswkim/discogs-mcp-server/actions/workflows/check-pr.yml)
[![NPM Downloads](https://img.shields.io/npm/d18m/discogs-mcp-server)](https://www.npmjs.com/package/discogs-mcp-server)
[![Sponsor](https://img.shields.io/static/v1?label=sponsor&message=%E2%9D%A4&logo=GitHub&color=ff69b4)](https://github.com/sponsors/cswkim)

# Discogs MCP Server

MCP Server for the Discogs API, enabling music catalog operations, search functionality, and more.

## Quickstart

If you just want to get started immediately using this MCP Server with the [Claude](https://claude.ai) desktop app and don't care about development or running the server yourself, then make sure you have [Node.js](https://nodejs.org/en) installed and your Discogs personal access token ready and skip straight to the [Claude configuration section](#claude-desktop-configuration). Use the `NPX` method from that section.

## Table of Contents

- [Acknowledgements](#acknowledgements)
- [Available Tools](#available-tools)
- [Caveats](#caveats)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Server](#running-the-server-locally)
  - [Option 1: Local Development](#option-1-local-development)
  - [Option 2: Docker](#option-2-docker)
- [Inspection](#inspection)
- [MCP Clients](#mcp-clients)
  - [Claude Desktop Configuration](#claude-desktop-configuration)
    - [NPX](#npx)
    - [Local Node](#local-node)
    - [Docker](#docker)
- [TODO](#todo)
- [License](#license)

## Acknowledgements

This MCP server is built using [FastMCP](https://github.com/punkpeye/fastmcp), a typescript framework for building MCP servers. For more information about MCP and how to use MCP servers, please refer to the [FastMCP documentation](https://github.com/punkpeye/fastmcp/blob/main/README.md) and the [official MCP documentation](https://modelcontextprotocol.io).

## Available Tools

Check out the list of available tools: [TOOLS.md](TOOLS.md)

## Caveats

- The [Discogs API documentation](https://www.discogs.com/developers) is not perfect and some endpoints may not be fully documented or may have inconsistencies.
- Due to the vast number of API endpoints and response types, it's not feasible to verify type safety for every possible response. Please report any type-related issues you encounter.
- This MCP server allows for editing data in your Discogs collection. Please use with caution and verify your actions before executing them.
- The Discogs API `per_page` default is `50`, which can be too much data for some clients to process effectively, so within this project a `discogs.config.defaultPerPage` value has been set to `5`. You can request more data in your prompts, but be aware that some clients may struggle with larger responses.

## Prerequisites

- Node.js (tested with Node.js `20.x.x`, but `18.x.x` should work as well)
  - Check your Node.js version with: `node --version`
- Docker (optional, for running a local docker image without having to deal with Node or dependencies)

## Setup

1. Clone the repository
2. Create a `.env` file in the root directory based on `.env.example`
3. Set the following required environment variables in your `.env`:
   - `DISCOGS_PERSONAL_ACCESS_TOKEN`: Your Discogs personal access token

To get your Discogs personal access token, go to your [Discogs Settings > Developers](https://www.discogs.com/settings/developers) page and find your token or generate a new one. **_DO NOT SHARE YOUR TOKEN_**. OAuth support will be added in a future release.

The other environment variables in `.env.example` are optional and have sensible defaults, so you don't need to set them unless you have specific requirements.

## Running the Server Locally

### Option 1: Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Available commands:
   - `pnpm run dev`: Start the development server with hot reloading
   - `pnpm run dev:stream`: Start the development server with hot reloading in HTTP streaming mode
   - `pnpm run build`: Build the production version
   - `pnpm run start`: Run the production build
   - `pnpm run inspect`: Run the MCP Inspector (see [Inspection](#inspection) section)
   - `pnpm run format`: Check code formatting (prettier)
   - `pnpm run lint`: Run linter (eslint)
   - `pnpm run test`: Run vitest
   - `pnpm run test:coverage`: Run vitest v8 coverage
   - `pnpm run version:check`: Checks that the package.json version and src/version.ts match

### Option 2: Docker

1. Build the Docker image:
   ```bash
   docker build -t discogs-mcp-server:latest .
   ```

2. Run the container:
   ```bash
   docker run --env-file .env discogs-mcp-server:latest
   ```

   For HTTP Streaming transport mode:
   ```bash
   # The port should match what is in your .env file
   docker run --env-file .env -p 3001:3001 discogs-mcp-server:latest stream
   ```

## Inspection

Run the MCP Inspector to test your local MCP server:

```bash
pnpm run inspect
```

This will start the MCP Inspector at `http://127.0.0.1:6274`. Visit this URL in your browser to interact with your local MCP server.

For more information about the MCP Inspector, visit [the official documentation](https://modelcontextprotocol.io/docs/tools/inspector).

## MCP Clients

Currently, this MCP server has only been tested with Claude Desktop. More client examples will be added in the future.

### Claude Desktop Configuration

Find your `claude_desktop_config.json` at `Claude > Settings > Developer > Edit Config` and depending on which option you'd like, add **JUST ONE** of the following:

#### NPX

Running it straight from the npm registry.

```json
{
  "mcpServers": {
    "discogs": {
      "command": "npx",
      "args": [
        "-y",
        "discogs-mcp-server"
      ],
      "env": {
        "DISCOGS_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

#### Local Node

Dependencies should have been installed before you use this method (`pnpm install`).

```json
{
  "mcpServers": {
    "discogs": {
      "command": "npx",
      "args": [
        "tsx",
        "/PATH/TO/YOUR/PROJECT/FOLDER/src/index.ts"
      ],
      "env": {
        "DISCOGS_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

#### Docker

The docker image should have been built before using this method.

```json
{
  "mcpServers": {
    "discogs": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--env-file",
        "/PATH/TO/YOUR/PROJECT/FOLDER/.env",
        "discogs-mcp-server:latest"
      ]
    }
  }
}
```

Any changes to local code will require Claude to be restarted to take effect. Also, Claude requires human-in-the-loop interaction to allow an MCP tool to be run, so everytime a new tool is accessed Claude will ask for permission. You usually only have to do this once per tool per chat. _If using the free version, long chats may result in more frequent errors trying to run tools as Claude limits the amount of context within a single chat._

## TODO

- OAuth support
- Missing tools:
  - Inventory uploading

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
