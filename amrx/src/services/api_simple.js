const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  // Get authentication headers
  static getAuthHeaders() {
    const token = localStorage.getItem('pharmacistToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Make API request
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
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Request failed: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = localStorage.getItem('pharmacistToken');
    if (!token) return false;
    
    try {
      // Simple token check - just verify it exists and is not expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() < expirationTime;
    } catch (error) {
      console.warn('Token validation failed:', error);
      ApiService.clearAuth();
      return false;
    }
  }

  // Clear authentication data
  static clearAuth() {
    localStorage.removeItem('pharmacistToken');
    localStorage.removeItem('pharmacistData');
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
}

export default ApiService;
