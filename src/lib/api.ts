import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  // Public so individual pages can use the configured axios instance directly
  // for endpoints not wrapped by typed helpers below (auth/users, etc.).
  public api: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing: boolean = false;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage on init
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      this.accessToken = savedToken;
    }

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add access token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If 401 and haven't tried to refresh yet, and not already refreshing
        if (error.response?.status === 401 && !originalRequest._retry && !this.isRefreshing) {
          originalRequest._retry = true;

          // Only try to refresh if we have an access token (meaning user was logged in)
          if (this.accessToken) {
            this.isRefreshing = true;
            
            try {
              // Try to refresh token
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true }
              );

              const { accessToken } = response.data;
              this.setAccessToken(accessToken);

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              this.isRefreshing = false;
              return this.api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear token but don't redirect (let ProtectedRoute handle it)
              this.clearAccessToken();
              this.isRefreshing = false;
              return Promise.reject(refreshError);
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  clearAccessToken() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  getAccessToken() {
    return this.accessToken;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    this.setAccessToken(response.data.accessToken);
    return response.data;
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearAccessToken();
    }
  }

  async refreshToken() {
    const response = await this.api.post('/auth/refresh');
    this.setAccessToken(response.data.accessToken);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data.user;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    role: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  // Crops endpoints
  async getCrops() {
    const response = await this.api.get('/crops');
    return response.data.data;
  }

  async getCrop(id: number) {
    const response = await this.api.get(`/crops/${id}`);
    return response.data.data;
  }

  async createCrop(data: any) {
    const response = await this.api.post('/crops', data);
    return response.data.data;
  }

  async updateCrop(id: number, data: any) {
    const response = await this.api.put(`/crops/${id}`, data);
    return response.data.data;
  }

  async deleteCrop(id: number) {
    const response = await this.api.delete(`/crops/${id}`);
    return response.data;
  }

  // Symptoms endpoints
  async getSymptoms(cropId?: number) {
    const url = cropId ? `/symptoms?cropId=${cropId}` : '/symptoms';
    const response = await this.api.get(url);
    return response.data.data;
  }

  async getSymptom(id: number) {
    const response = await this.api.get(`/symptoms/${id}`);
    return response.data.data;
  }

  async createSymptom(data: any) {
    const response = await this.api.post('/symptoms', data);
    return response.data.data;
  }

  async updateSymptom(id: number, data: any) {
    const response = await this.api.put(`/symptoms/${id}`, data);
    return response.data.data;
  }

  async deleteSymptom(id: number) {
    const response = await this.api.delete(`/symptoms/${id}`);
    return response.data;
  }

  // Diagnosis endpoint
  async diagnose(symptomIds: number[]) {
    const response = await this.api.post('/diagnose', { symptomIds });
    return response.data.data;
  }

  // Generic CRUD for other resources
  async getAll(resource: string) {
    const response = await this.api.get(`/${resource}`);
    return response.data.data;
  }

  async getOne(resource: string, id: number) {
    const response = await this.api.get(`/${resource}/${id}`);
    return response.data.data;
  }

  async create(resource: string, data: any) {
    const response = await this.api.post(`/${resource}`, data);
    return response.data.data;
  }

  async update(resource: string, id: number, data: any) {
    const response = await this.api.put(`/${resource}/${id}`, data);
    return response.data.data;
  }

  async delete(resource: string, id: number) {
    const response = await this.api.delete(`/${resource}/${id}`);
    return response.data;
  }

  // Direct axios methods for flexibility
  async get(url: string, config?: any) {
    const response = await this.api.get(url, config);
    return response;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.api.post(url, data, config);
    return response;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.api.put(url, data, config);
    return response;
  }

  async patch(url: string, data?: any, config?: any) {
    const response = await this.api.patch(url, data, config);
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;