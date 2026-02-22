import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { julesApiRequest, handleApiError } from '../services/julesApiClient.js';
import { API_BASE_URL } from '../constants.js';

const mock = new MockAdapter(axios as any);

describe('julesApiClient', () => {
    beforeEach(() => {
        mock.reset();
        process.env.JULES_API_KEY = 'test-api-key';
    });

    it('should make an authenticated GET request', async () => {
        mock.onGet(`${API_BASE_URL}/v1alpha/sources`).reply(200, {
            sources: [{ name: 'test-source' }]
        });

        const result = await julesApiRequest<any>('/v1alpha/sources');
        expect(result.sources[0].name).toBe('test-source');
        expect(mock.history.get[0].headers?.['X-Goog-Api-Key']).toBe('test-api-key');
    });

    it('should throw error if JULES_API_KEY is missing', async () => {
        delete process.env.JULES_API_KEY;
        await expect(julesApiRequest('/v1alpha/sources')).rejects.toThrow('JULES_API_KEY environment variable is missing.');
    });

    it('should handle API errors correctly', async () => {
        // Simulate a network call that fails with 401
        mock.onGet(`${API_BASE_URL}/v1alpha/sources`).reply(401, {
            error: { message: 'Unauthorized' }
        });

        try {
            await julesApiRequest('/v1alpha/sources');
        } catch (error) {
            const message = handleApiError(error);
            expect(message).toContain('Error: Unauthorized (401)');
            expect(message).toContain('Unauthorized');
        }
    });

    it('should handle timeout errors correctly', async () => {
        mock.onGet(`${API_BASE_URL}/v1alpha/sources`).timeout();

        try {
            await julesApiRequest('/v1alpha/sources');
        } catch (error: any) {
            const message = handleApiError(error);
            expect(message).toContain('Error: Request timed out.');
        }
    });
});
