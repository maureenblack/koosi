import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthService, SignupData, LoginData } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('signup')) {
      setIsSignup(true);
      // Remove the signup parameter from URL
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignupData & LoginData>({
    email: '',
    password: '',
    name: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { setUser } = useAuth();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (isSignup && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignup && !formData.name) {
      errors.name = 'Name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await AuthService.signup(formData);
        navigate('/signup-success');
      } else {
        const { token } = await AuthService.login(formData);
        AuthService.setToken(token);
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'twitter') => {
    setError('');
    setLoading(true);

    try {
      // Note: These providers are not implemented yet
      throw new Error(`${provider} login is not implemented yet`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      const { token } = await AuthService.socialLogin('google', response.credential);
      AuthService.setToken(token);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-[480px]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-orange-500 sm:text-sm ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-orange-500 sm:text-sm ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
              {isSignup && <span className="text-sm text-gray-500 ml-1">(min. 6 characters)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-orange-500 sm:text-sm ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col space-y-3">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                GitHub
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('twitter')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Twitter
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isSignup ? 'Already have an account? Log in' : 'Need an account? Sign up'}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-600 text-center text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};
