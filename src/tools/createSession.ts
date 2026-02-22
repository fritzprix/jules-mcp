import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleApiError, julesApiRequest } from "../services/julesApiClient.js";
import { CreateSessionInputSchema, CreateSessionInput, ResponseFormat } from "../schemas/julesSchemas.js";
import { CHARACTER_LIMIT } from "../constants.js";

/**
 * Registers the jules_create_session tool with the given MCP server.
 */
export function registerCreateSessionTool(server: McpServer) {
    server.registerTool(
        "jules_create_session",
        {
            title: "Create Jules Session",
            description: `Starts a new automated coding session with Jules.

Use this after identifying a target source (e.g. from jules_list_sources). 
This creates a session where Jules will work on the given prompt.

Args:
  - prompt (string): The user's goal or instructions.
  - source (string): The full name of the source (e.g., "sources/github/owner/repo").
  - startingBranch (string): The starting branch for the repository (default: "main").
  - automationMode ("AUTO_CREATE_PR" | "NONE"): Whether to automatically create a PR (default: "NONE").
  - title (string): The title of the session.
  - requirePlanApproval (boolean): If true, implicitly requires an approve_plan call to proceed.
  - response_format ('markdown' | 'json'): Output format (default: 'markdown').

Returns:
  The created session details.`,
            inputSchema: CreateSessionInputSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: false, // Creating a session itself isn't completely destructive
                idempotentHint: false,
                openWorldHint: false,
            },
        },
        async (params: CreateSessionInput) => {
            try {
                const payload = {
                    prompt: params.prompt,
                    sourceContext: {
                        source: params.source,
                        githubRepoContext: {
                            startingBranch: params.startingBranch,
                        },
                    },
                    automationMode: params.automationMode,
                    title: params.title,
                    requirePlanApproval: params.requirePlanApproval,
                };

                const data = await julesApiRequest<any>("/v1alpha/sessions", "POST", payload);

                let textContent: string;
                if (params.response_format === ResponseFormat.MARKDOWN) {
                    const lines = [
                        `# Created Session: ${data.title || "Untitled"}`,
                        "",
                        `- **Name/ID**: ${data.name || data.id}`,
                        `- **Prompt**: ${data.prompt}`,
                        `- **Status**: ${data.state || "PENDING"}`,
                        "",
                        `You can check the progress of this session using the \`jules_list_sessions\` tool.`,
                    ];
                    textContent = lines.join("\n");
                } else {
                    textContent = JSON.stringify(data, null, 2);
                }

                if (textContent.length > CHARACTER_LIMIT) {
                    textContent = textContent.slice(0, CHARACTER_LIMIT) + "\n...[truncated]";
                }

                return {
                    content: [{ type: "text", text: textContent }],
                    structuredContent: data,
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: handleApiError(error) }],
                    isError: true,
                };
            }
        }
    );
}
