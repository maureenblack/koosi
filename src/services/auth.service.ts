import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type SocialProvider = 'google' | 'github' | 'twitter';

export class AuthService {
  private static token: string | null = null;

  static setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  static clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, data);
      const authResponse = response.data as AuthResponse;
      this.setToken(authResponse.token);
      return authResponse;
    } catch (error) {
      throw new Error('Failed to sign up');
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);
      const authResponse = response.data as AuthResponse;
      this.setToken(authResponse.token);
      return authResponse;
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  }

  static async socialLogin(provider: SocialProvider, token: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/social/login`, { provider, token });
      const authResponse = response.data as AuthResponse;
      this.setToken(authResponse.token);
      return authResponse;
    } catch (error) {
      throw new Error(`Failed to login with ${provider}`);
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as User;
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  }

  static async logout(): Promise<void> {
    this.clearToken();
  }
}
