/**
 * API Service - Production Ready (Mock Data Only)
 * Uses mock data for Vercel deployment
 */

import {
  api,
  intelligenceApi,
  trendsApi,
  gapsApi,
  papersApi,
  systemApi
} from './api-mock';

// Re-export all APIs (using mock data)
export {
  api,
  intelligenceApi,
  trendsApi,
  gapsApi,
  papersApi,
  systemApi
};

export default api;