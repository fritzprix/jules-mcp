import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleApiError, julesApiRequest } from "../services/julesApiClient.js";
import { ListSourcesInputSchema, ListSourcesInput, ResponseFormat } from "../schemas/julesSchemas.js";
import { CHARACTER_LIMIT } from "../constants.js";

/**
 * Registers the jules_list_sources tool with the given MCP server.
 */
export function registerListSourcesTool(server: McpServer) {
    server.registerTool(
        "jules_list_sources",
        {
            title: "List Jules Sources",
            description: `List your available sources connected to Jules (e.g., GitHub repositories).

Use this to find the name of the source you want to work with before creating a session.

Args:
  - pageSize (number): Maximum results to return (default: 20)
  - pageToken (string): Page token for retrieving the next page
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  A list of sources available to the user.`,
            inputSchema: ListSourcesInputSchema,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        async (params: ListSourcesInput) => {
            try {
                const queryParams: Record<string, any> = {
                    pageSize: params.pageSize,
                };
                if (params.pageToken) {
                    queryParams.pageToken = params.pageToken;
                }

                const data = await julesApiRequest<any>("/v1alpha/sources", "GET", undefined, queryParams);

                const sources = data?.sources || [];
                const nextPageToken = data?.nextPageToken;

                if (!sources.length) {
                    return {
                        content: [{ type: "text", text: "No sources found." }],
                    };
                }

                const output = {
                    sources,
                    nextPageToken,
                };

                let textContent: string;
                if (params.response_format === ResponseFormat.MARKDOWN) {
                    const lines = [`# Jules Sources`, ""];
                    for (const source of sources) {
                        lines.push(`## ${source.name}`);
                        lines.push(`- **ID**: ${source.id}`);
                        if (source.githubRepo) {
                            lines.push(`- **GitHub Repo**: ${source.githubRepo.owner}/${source.githubRepo.repo}`);
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
