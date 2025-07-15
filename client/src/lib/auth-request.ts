// Enhanced API request function with token authentication
export async function authApiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user_info");
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("token");
  const userInfo = localStorage.getItem("user_info");
  return !!(token && userInfo);
}

// Helper function to get current user from localStorage
export function getCurrentUser() {
  const userInfo = localStorage.getItem("user_info");
  if (!userInfo) return null;
  
  try {
    return JSON.parse(userInfo);
  } catch {
    return null;
  }
}

// Helper function to logout
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_info");
  window.location.href = "/";
}