import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api';
const TOKEN_KEY = 'koosi_auth_token';

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  googleId?: string;
  githubId?: string;
  createdAt: string;
}

interface AuthResponse {
  token: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type SocialProvider = 'google' | 'github' | 'twitter';

export class AuthService {
  private static token: string | null = null;

  static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  static setToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  static clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token = null;
  }

  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/signup`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const details = error.response.data?.details;
        if (details) {
          const validationErrors = Object.values(details)
            .map((detail: any) => detail._errors?.join(', '))
            .filter(Boolean)
            .join(', ');
          throw new Error(validationErrors || 'Invalid input data');
        }
        throw new Error(error.response.data?.error || 'Invalid input data');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 409) {
        throw new Error('Email already registered');
      }
      throw new Error('An error occurred. Please try again.');
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const details = error.response.data?.details;
        if (details) {
          const validationErrors = Object.values(details)
            .map((detail: any) => detail._errors?.join(', '))
            .filter(Boolean)
            .join(', ');
          throw new Error(validationErrors || 'Invalid input data');
        }
        throw new Error(error.response.data?.error || 'Invalid input data');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error('An error occurred. Please try again.');
    }
  }

  static async socialLogin(provider: string, token: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/social/login`, {
        provider,
        token,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const details = error.response.data?.details;
        if (details) {
          const validationErrors = Object.values(details)
            .map((detail: any) => detail._errors?.join(', '))
            .filter(Boolean)
            .join(', ');
          throw new Error(validationErrors || 'Invalid input data');
        }
        throw new Error(error.response.data?.error || 'Invalid input data');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error('An error occurred. Please try again.');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await axios.get<User>(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.clearToken();
      return null;
    }
  }

  static async logout(): Promise<void> {
    this.clearToken();
  }
}
