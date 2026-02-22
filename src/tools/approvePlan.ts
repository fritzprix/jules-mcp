import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleApiError, julesApiRequest } from "../services/julesApiClient.js";
import { ApprovePlanInputSchema, ApprovePlanInput, ResponseFormat } from "../schemas/julesSchemas.js";
import { CHARACTER_LIMIT } from "../constants.js";

/**
 * Registers the jules_approve_plan tool with the given MCP server.
 */
export function registerApprovePlanTool(server: McpServer) {
    server.registerTool(
        "jules_approve_plan",
        {
            title: "Approve Jules Session Plan",
            description: `Approve the plan for a session that requires explicit approval.

If you created a session with requirePlanApproval: true, Jules will pause and wait for approval. Call this tool to allow it to proceed.

Args:
  - sessionId (string): The session ID or name (e.g., "sessions/12345" or "12345").
  - response_format ('markdown' | 'json'): Output format (default: 'markdown').

Returns:
  Status of the approval.`,
            inputSchema: ApprovePlanInputSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true, // Approving a plan kicks off mutations in the source repo
                idempotentHint: false,
                openWorldHint: false,
            },
        },
        async (params: ApprovePlanInput) => {
            try {
                const endpoint = params.sessionId.includes("/")
                    ? `/${params.sessionId}:approvePlan`
                    : `/v1alpha/sessions/${params.sessionId}:approvePlan`;

                const data = await julesApiRequest<any>(endpoint, "POST", {});

                let textContent: string;
                if (params.response_format === ResponseFormat.MARKDOWN) {
                    textContent = `# Plan Approved\n\nSuccessfully approved plan for session \`${params.sessionId}\`.\n\nYou can use \`jules_list_sessions\` to monitor its progress.`;
                } else {
                    textContent = JSON.stringify({ success: true, session: params.sessionId, data }, null, 2);
                }

                return {
                    content: [{ type: "text", text: textContent }],
                    structuredContent: { success: true, session: params.sessionId, data },
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
