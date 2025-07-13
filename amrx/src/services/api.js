const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryable = status >= 500 || status === 429;
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

class ApiService {
  static getAuthHeaders() {
    const token = localStorage.getItem('pharmacistToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  static async request(endpoint, options = {}, retryCount = 0) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...ApiService.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making API request to: ${url}`, { 
      method: config.method || 'GET',
      retryCount,
      hasAuth: !!config.headers.Authorization 
    });

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      
      // Handle authentication errors
      if (response.status === 401) {
        ApiService.handleAuthError();
        throw new ApiError('Authentication failed', 401);
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = (retryAfter ? parseInt(retryAfter) : 60) * 1000;
        
        if (retryCount < RETRY_CONFIG.maxRetries) {
          console.log(`Rate limited. Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return ApiService.request(endpoint, options, retryCount + 1);
        }
        
        throw new ApiError('Rate limit exceeded', 429);
      }

      // Handle server errors with retry logic
      if (response.status >= 500 && retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
          RETRY_CONFIG.maxDelay
        );
        
        console.log(`Server error ${response.status}. Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return ApiService.request(endpoint, options, retryCount + 1);
      }

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data.code
        );
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Don't retry if it's not a retryable error
      if (!error.retryable && retryCount < RETRY_CONFIG.maxRetries) {
        console.log('Non-retryable error, but attempting retry...');
        const delay = RETRY_CONFIG.baseDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return ApiService.request(endpoint, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  static handleAuthError() {
    console.log('Handling authentication error...');
    localStorage.removeItem('pharmacistToken');
    localStorage.removeItem('pharmacistData');
    
    // Dispatch custom event for auth state change
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    // Redirect to auth page if not already there
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  }

  static isAuthenticated() {
    const token = localStorage.getItem('pharmacistToken');
    if (!token) return false;
    
    try {
      // Basic JWT expiration check (client-side)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  static refreshToken() {
    // Implement token refresh logic here
    // This would typically call a refresh endpoint
    console.log('Token refresh not implemented yet');
  }

  // Public API endpoints
  static async submitPublicData(formData) {
    console.log('Submitting public data:', formData);
    return ApiService.request('/api/public', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  static async submitPharmacistData(formData) {
    return ApiService.request('/api/pharmacist', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  static async getDashboardStats() {
    return ApiService.request('/api/dashboard');
  }

  static async getHealthCheck() {
    return ApiService.request('/api/health');
  }

  // Authentication endpoints
  static async loginPharmacist(credentials) {
    return ApiService.request('/api/auth/pharmacist/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async registerPharmacist(pharmacistData) {
    return ApiService.request('/api/auth/pharmacist/register', {
      method: 'POST',
      body: JSON.stringify(pharmacistData),
    });
  }

  static async getPharmacistDashboard() {
    return ApiService.request('/api/pharmacist/dashboard');
  }

  // Enhanced methods with better error handling
  static async uploadFile(file, endpoint = '/api/upload') {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.request(endpoint, {
      method: 'POST',
      headers: {
        ...ApiService.getAuthHeaders(),
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }

  static async batchUpload(files, endpoint = '/api/batch-upload') {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    return ApiService.request(endpoint, {
      method: 'POST',
      headers: {
        ...ApiService.getAuthHeaders(),
      },
      body: formData,
    });
  }

  // Utility methods
  static getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
  }

  static setAuthToken(token) {
    if (token) {
      localStorage.setItem('pharmacistToken', token);
    } else {
      localStorage.removeItem('pharmacistToken');
    }
  }

  static clearAuth() {
    localStorage.removeItem('pharmacistToken');
    localStorage.removeItem('pharmacistData');
  }
}

export default ApiService;
export { ApiError }; 