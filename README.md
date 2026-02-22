# Jules MCP Server

An MCP server implementation for [Jules API](https://developers.google.com/jules/api), allowing LLMs to interact directly with your automated Jules workflows.

## Prerequisites

1.  **Jules API Key**: Get your API Key from the Jules [Settings page](https://jules.google.com/settings#api).
    *   *Note: Currently, Jules is migrating its authentication methods. If you receive a `401 Unauthorized` indicating "API keys are not supported by this API," you may need to wait for further updates from the Jules platform or supply an OAuth2 Token in place of the API key if supported.*

## Installation & Usage

You can use the server directly via `npx` without installing it globally:

```bash
npx jules-mcp
```

### Environment Variables

The server requires the following environment variables:

-   `JULES_API_KEY`: Your Jules API Key or Authentication Token.

## Configuration for Claude Desktop

To use this server with the Claude Desktop app, you need to add it to your configuration file.

**Config file locations:**
-   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
-   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following to your configuration, replacing `<YOUR_API_KEY>` with your actual Jules API key:

```json
{
  "mcpServers": {
    "jules": {
      "command": "npx",
      "args": [
        "-y",
        "jules-mcp"
      ],
      "env": {
        "JULES_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

## Available Tools

The server implements the following tools:

-   `jules_list_sources`: Find the IDs of sources (e.g., connected GitHub repos) you can interact with.
-   `jules_create_session`: Start a new Jules coding session with a specific prompt and source context.
-   `jules_list_sessions`: Check the status and output links (e.g., Pull Requests) of your sessions.
-   `jules_approve_plan`: Approve a session's execution plan (if it was created with `requirePlanApproval=true`).

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run via MCP Inspector for testing
npm run inspector
```
