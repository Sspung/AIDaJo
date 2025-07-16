// Environment configuration for API endpoints
export const API_CONFIG = {
  // Development: relative paths work with proxy
  // Production: needs full URL to backend service
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD 
    ? 'https://aidajo-backend.replit.app' // Your production backend URL
    : ''), // Empty string for relative paths in development
  
  // API endpoints
  ENDPOINTS: {
    AI_TOOLS: '/api/ai-tools',
    AI_BUNDLES: '/api/ai-bundles',
    ANALYTICS: '/api/analytics',
    AUTH: '/api/auth',
    USER: '/api/user',
  },
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Environment checks
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

// Debug logging in development
if (IS_DEVELOPMENT) {
  console.log('🔧 Environment Config:', {
    mode: import.meta.env.MODE,
    baseUrl: API_CONFIG.BASE_URL,
    isDev: IS_DEVELOPMENT,
    isProd: IS_PRODUCTION,
  });
}