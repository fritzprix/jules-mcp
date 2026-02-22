import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleApiError, julesApiRequest } from "../services/julesApiClient.js";
import { ListSessionsInputSchema, ListSessionsInput, ResponseFormat } from "../schemas/julesSchemas.js";
import { CHARACTER_LIMIT } from "../constants.js";

/**
 * Registers the jules_list_sessions tool with the given MCP server.
 */
export function registerListSessionsTool(server: McpServer) {
    server.registerTool(
        "jules_list_sessions",
        {
            title: "List Jules Sessions",
            description: `List your Jules sessions to check their status or view outputs (e.g. PR links).

Use this to poll for the completion of a session or to find an active session ID.

Args:
  - pageSize (number): Maximum results to return (default: 20)
  - pageToken (string): Page token for retrieving the next page
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  A list of sessions, including their state and any outputs.`,
            inputSchema: ListSessionsInputSchema,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        async (params: ListSessionsInput) => {
            try {
                const queryParams: Record<string, any> = {
                    pageSize: params.pageSize,
                };
                if (params.pageToken) {
                    queryParams.pageToken = params.pageToken;
                }

                const data = await julesApiRequest<any>("/v1alpha/sessions", "GET", undefined, queryParams);

                const sessions = data?.sessions || [];
                const nextPageToken = data?.nextPageToken;

                if (!sessions.length) {
                    return {
                        content: [{ type: "text", text: "No sessions found." }],
                    };
                }

                const output = {
                    sessions,
                    nextPageToken,
                };

                let textContent: string;
                if (params.response_format === ResponseFormat.MARKDOWN) {
                    const lines = [`# Jules Sessions`, ""];
                    for (const session of sessions) {
                        lines.push(`## ${session.title || 'Untitled'} (${session.name || session.id})`);
                        lines.push(`- **State**: ${session.state || "UNKNOWN"}`);
                        lines.push(`- **Prompt**: ${session.prompt}`);

                        if (session.outputs && session.outputs.length > 0) {
                            lines.push(`- **Outputs**:`);
                            for (const out of session.outputs) {
                                if (out.pullRequest) {
                                    lines.push(`  - Pull Request: [${out.pullRequest.title}](${out.pullRequest.url})`);
                                } else {
                                    lines.push(`  - ${JSON.stringify(out)}`);
                                }
                            }
                        }
                        if (session.pendingPlanApproval) {
                            lines.push(`- ⚠️ **Requires Plan Approval**: Use \`jules_approve_plan\` to approve.`);
                        }
                        lines.push("");
                    }
                    if (nextPageToken) {
                        lines.push(`**Next Page Token**: ${nextPageToken}`);
                    }
                    textContent = lines.join("\n");
                } else {
                    textContent = JSON.stringify(output, null, 2);
                }

                if (textContent.length > CHARACTER_LIMIT) {
                    textContent = textContent.slice(0, CHARACTER_LIMIT) + "\n...[truncated]";
                }

                return {
                    content: [{ type: "text", text: textContent }],
                    structuredContent: output,
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
