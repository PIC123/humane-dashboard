/**
 * API Service - Production Ready
 * Automatically uses mock data in production, real API in development
 */

// Import mock API
import * as mockApi from './api-mock';

// API Configuration
const USE_MOCK = process.env.NODE_ENV === 'production';

// Re-export appropriate API based on environment
export const api = USE_MOCK ? mockApi.api : require('./api').api;

// Re-export individual APIs
export const intelligenceApi = USE_MOCK ? mockApi.intelligenceApi : require('./api').intelligenceApi;
export const trendsApi = USE_MOCK ? mockApi.trendsApi : require('./api').trendsApi;
export const gapsApi = USE_MOCK ? mockApi.gapsApi : require('./api').gapsApi;
export const papersApi = USE_MOCK ? mockApi.papersApi : require('./api').papersApi;
export const systemApi = USE_MOCK ? mockApi.systemApi : require('./api').systemApi;

export default api;