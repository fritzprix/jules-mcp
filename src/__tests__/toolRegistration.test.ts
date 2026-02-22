import { describe, it, expect, vi } from 'vitest';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListSourcesTool } from '../tools/listSources.js';
import { registerCreateSessionTool } from '../tools/createSession.js';
import { registerListSessionsTool } from '../tools/listSessions.js';
import { registerApprovePlanTool } from '../tools/approvePlan.js';

describe('Tool Registration', () => {
    it('should register all core jules tools', () => {
        const server = new McpServer({ name: 'test', version: '1.0.0' });
        const registerSpy = vi.spyOn(server, 'registerTool');

        registerListSourcesTool(server);
        registerCreateSessionTool(server);
        registerListSessionsTool(server);
        registerApprovePlanTool(server);

        expect(registerSpy).toHaveBeenCalledWith(
            'jules_list_sources',
            expect.any(Object),
            expect.any(Function)
        );
        expect(registerSpy).toHaveBeenCalledWith(
            'jules_create_session',
            expect.any(Object),
            expect.any(Function)
        );
        expect(registerSpy).toHaveBeenCalledWith(
            'jules_list_sessions',
            expect.any(Object),
            expect.any(Function)
        );
        expect(registerSpy).toHaveBeenCalledWith(
            'jules_approve_plan',
            expect.any(Object),
            expect.any(Function)
        );
    });
});
