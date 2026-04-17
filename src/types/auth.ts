export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'agent' | 'expert' | 'viewer';
  last_login?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role: 'admin' | 'agent' | 'expert' | 'viewer';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}