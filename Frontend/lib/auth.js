import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Auth functions
export const auth = {
  // Login function
  async login(identifier, password) {
    console.log('Attempting login with URL:', `${API_BASE_URL}/api/auth/login`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch (e) {
          error = { detail: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Login error response:', error);
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Store tokens securely with HttpOnly, Secure, and SameSite flags
      // Use secure cookies for production
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieFlags = `path=/; max-age=${data.expires_in || 1800}; SameSite=Strict${isProduction ? '; Secure' : ''}`;

      // Store access token in cookie (HttpOnly would need server-side setting)
      // For now, we'll use a secure cookie without HttpOnly since we need JS access
      document.cookie = `token=${data.access_token}; ${cookieFlags}`;

      // Store refresh token securely (longer expiration)
      if (data.refresh_token) {
        const refreshCookieFlags = `path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict${isProduction ? '; Secure' : ''}`;
        document.cookie = `refresh_token=${data.refresh_token}; ${refreshCookieFlags}`;
      }

      // Store user data in sessionStorage (not sensitive token data)
      if (data.user) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Make sure the backend is running.');
      }
      throw error;
    }
  },

  // Register function
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout function
  logout() {
    // Clear all auth-related storage
    sessionStorage.removeItem('user');

    // Clear cookies with proper flags
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

    // Use router navigation instead of window.location for better UX
    // Note: This will be called from context, so we'll redirect there
    return true;
  },

  // Get current user
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return null;
        }
        throw new Error('Failed to fetch user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      return null;
    }
  },

  // Get token from cookie
  getToken() {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
      if (tokenCookie) {
        // Use slice to handle JWT tokens with '=' characters in them
        return tokenCookie.trim().slice('token='.length);
      }
    }
    return null;
  },

  // Get refresh token from cookie
  getRefreshToken() {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const refreshCookie = cookies.find(c => c.trim().startsWith('refresh_token='));
      if (refreshCookie) {
        // Use slice to handle tokens with '=' characters in them
        return refreshCookie.trim().slice('refresh_token='.length);
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  // Get user from token
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  },

  // Refresh access token using refresh token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('No refresh token available');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.error('Token refresh failed');
        this.logout();
        return null;
      }

      const data = await response.json();

      // Update access token cookie
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieFlags = `path=/; max-age=${data.expires_in || 1800}; SameSite=Strict${isProduction ? '; Secure' : ''}`;
      document.cookie = `token=${data.access_token}; ${cookieFlags}`;

      console.log('Access token refreshed successfully');
      return data.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return null;
    }
  }
};

// API helper with authentication and auto-refresh
export const apiClient = {
  async request(endpoint, options = {}) {
    let token = auth.getToken();

    // Check if token is about to expire (within 5 minutes)
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const timeUntilExpiry = decoded.exp - Date.now() / 1000;

        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 300) {
          console.log('Token expiring soon, refreshing...');
          const newToken = await auth.refreshAccessToken();
          if (newToken) {
            token = newToken;
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
      }
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token once on 401
        const newToken = await auth.refreshAccessToken();
        if (newToken) {
          // Retry request with new token
          config.headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }

        // If refresh failed or retry failed, logout
        auth.logout();
        throw new Error('Authentication required');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};