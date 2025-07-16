import { getApiUrl } from "../config/environment";

// Helper function for API requests with proper error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// Specific API functions
export const api = {
  // AI Tools
  getAiTools: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== "전체") params.append("category", category);
    if (search) params.append("search", search);
    return apiRequest(`/api/ai-tools?${params}`);
  },

  // AI Bundles
  getAiBundles: () => apiRequest("/api/ai-bundles"),

  // Analytics
  getAnalyticsStats: () => apiRequest("/api/analytics/stats"),
  getAnalyticsPopular: () => apiRequest("/api/analytics/popular"),
  getAnalyticsRankings: () => apiRequest("/api/analytics/rankings"),

  // Auth
  getCurrentUser: () => apiRequest("/api/auth/user"),
  login: (data: any) => apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" }),

  // User
  getUserFavorites: () => apiRequest("/api/user/favorites"),
};