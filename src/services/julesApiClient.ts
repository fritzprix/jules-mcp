import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../constants.js";

/**
 * Make an authenticated request to the Jules API.
 */
export async function julesApiRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: any,
    params?: any
): Promise<T> {
    const apiKey = process.env.JULES_API_KEY;
    if (!apiKey) {
        throw new Error("JULES_API_KEY environment variable is missing.");
    }

    try {
        const response = await axios({
            method,
            url: `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
            data,
            params,
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Goog-Api-Key": apiKey,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Helper to extract an actionable error message.
 */
export function handleApiError(error: unknown): string {
    if (error instanceof Error && error.message.includes("JULES_API_KEY")) {
        return error.message;
    }
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            const detail = data?.error?.message || JSON.stringify(data) || "No additional error info from server.";
            switch (status) {
                case 400:
                    return `Error: Bad Request (400). Check the parameters. Detail: ${detail}`;
                case 401:
                    return `Error: Unauthorized (401). Ensure JULES_API_KEY is correct. Detail: ${detail}`;
                case 403:
                    return `Error: Forbidden (403). You don't have access to this resource. Detail: ${detail}`;
                case 404:
                    return `Error: Not Found (404). The requested resource doesn't exist. Detail: ${detail}`;
                case 429:
                    return `Error: Rate limit exceeded (429). Please wait before making more requests. Detail: ${detail}`;
                default:
                    return `Error: API request failed with status ${status}. Detail: ${detail}`;
            }
        } else if (error.code === "ECONNABORTED") {
            return "Error: Request timed out. Please try again.";
        }
    }
    return `Error: Unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
}
