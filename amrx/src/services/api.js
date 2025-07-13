const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

class ApiService {
  static getAuthHeaders() {
    const token = localStorage.getItem('pharmacistToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...ApiService.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        ApiService.handleAuthError();
        throw new ApiError('Authentication failed', 401);
      }

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
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
      throw error;
    }
  }

  static handleAuthError() {
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
      console.warn('Token validation failed:', error);
      return false;
    }
  }

  // Public API endpoints
  static async submitPublicData(formData) {
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

    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        ...ApiService.getAuthHeaders(),
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        ApiService.handleAuthError();
        throw new ApiError('Authentication failed', 401);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || `Upload failed! status: ${response.status}`,
          response.status,
          data.code
        );
      }
      
      return data;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  static async batchUpload(files, endpoint = '/api/batch-upload') {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        ...ApiService.getAuthHeaders(),
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        ApiService.handleAuthError();
        throw new ApiError('Authentication failed', 401);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || `Batch upload failed! status: ${response.status}`,
          response.status,
          data.code
        );
      }
      
      return data;
    } catch (error) {
      console.error('Batch upload error:', error);
      throw error;
    }
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