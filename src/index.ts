#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerListSourcesTool } from "./tools/listSources.js";
import { registerCreateSessionTool } from "./tools/createSession.js";
import { registerListSessionsTool } from "./tools/listSessions.js";
import { registerApprovePlanTool } from "./tools/approvePlan.js";

const server = new McpServer({
    name: "jules-mcp-server",
    version: "1.0.0",
});

// Register all tools
registerListSourcesTool(server);
registerCreateSessionTool(server);
registerListSessionsTool(server);
registerApprovePlanTool(server);

async function runStdio() {
    if (!process.env.JULES_API_KEY) {
        console.error("ERROR: JULES_API_KEY environment variable is required to authenticate with the Jules API.");
        process.exit(1);
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Jules MCP server running via stdio");
}

runStdio().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});