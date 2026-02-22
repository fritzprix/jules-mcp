import { z } from "zod";

// --- Enums ---
export enum ResponseFormat {
    MARKDOWN = "markdown",
    JSON = "json",
}

// --- Common ---
export const PaginationSchema = z.object({
    pageSize: z.number().int().min(1).max(100).default(20).describe("Maximum results to return"),
    pageToken: z.string().optional().describe("Page token for retrieving the next page"),
    response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format: 'markdown' or 'json'"),
});

// --- jules_list_sources ---
export const ListSourcesInputSchema = PaginationSchema;
export type ListSourcesInput = z.infer<typeof ListSourcesInputSchema>;

// --- jules_create_session ---
export const CreateSessionInputSchema = z.object({
    prompt: z.string().describe("The user's goal or prompt for the session."),
    source: z.string().describe("The name of the source resource (e.g., 'sources/github/owner/repo')."),
    startingBranch: z.string().default("main").describe("The starting branch for the repository."),
    automationMode: z.enum(["AUTO_CREATE_PR", "NONE"]).default("NONE").describe("Whether to automatically create a PR ('AUTO_CREATE_PR' or 'NONE')."),
    title: z.string().describe("The title of the session."),
    requirePlanApproval: z.boolean().default(false).describe("If true, requires an explicit call to approve_plan to proceed."),
    response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format: 'markdown' or 'json'"),
});
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

// --- jules_list_sessions ---
export const ListSessionsInputSchema = PaginationSchema;
export type ListSessionsInput = z.infer<typeof ListSessionsInputSchema>;

// --- jules_approve_plan ---
export const ApprovePlanInputSchema = z.object({
    sessionId: z.string().describe("The session ID or resource name (e.g., 'sessions/12345')."),
    response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format: 'markdown' or 'json'"),
});
export type ApprovePlanInput = z.infer<typeof ApprovePlanInputSchema>;
