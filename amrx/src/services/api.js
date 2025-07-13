const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

    console.log(`Making API request to: ${url}`);
    console.log('Request config:', config);

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
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
}

export default ApiService; 