import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService, User } from '../services/auth.service';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AuthService.getCurrentUser();
        if (!userData) {
          navigate('/login');
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative px-6 py-8 sm:px-8 sm:py-12">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-lg text-blue-100">
              Here's an overview of your Koosi account
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stat cards with gradients and icons */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 overflow-hidden shadow-xl rounded-xl text-white transform hover:scale-105 transition-transform duration-200">
            <div className="px-6 py-8 sm:p-10 flex justify-between items-start">
              <div>
                <dt className="text-sm font-medium text-pink-100 truncate">
                  Total Capsules
                </dt>
                <dd className="mt-2 text-4xl font-bold">
                  0
                </dd>
              </div>
              <div className="rounded-full p-3 bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 overflow-hidden shadow-xl rounded-xl text-white transform hover:scale-105 transition-transform duration-200">
            <div className="px-6 py-8 sm:p-10 flex justify-between items-start">
              <div>
                <dt className="text-sm font-medium text-blue-100 truncate">
                  Active Capsules
                </dt>
                <dd className="mt-2 text-4xl font-bold">
                  0
                </dd>
              </div>
              <div className="rounded-full p-3 bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-purple-500 overflow-hidden shadow-xl rounded-xl text-white transform hover:scale-105 transition-transform duration-200">
            <div className="px-6 py-8 sm:p-10 flex justify-between items-start">
              <div>
                <dt className="text-sm font-medium text-purple-100 truncate">
                  Consensus Groups
                </dt>
                <dd className="mt-2 text-4xl font-bold">
                  0
                </dd>
              </div>
              <div className="rounded-full p-3 bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Quick Actions</span>
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <button className="group relative overflow-hidden rounded-xl bg-white px-4 py-6 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 via-fuchsia-500/20 to-indigo-500/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex items-center space-x-4">
                <div className="rounded-lg bg-rose-500/10 p-3">
                  <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Create New Capsule</span>
              </div>
            </button>

            <button className="group relative overflow-hidden rounded-xl bg-white px-4 py-6 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-cyan-500/20 to-teal-500/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex items-center space-x-4">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Join Consensus Group</span>
              </div>
            </button>

            <button className="group relative overflow-hidden rounded-xl bg-white px-4 py-6 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-purple-500/20 to-fuchsia-500/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative flex items-center space-x-4">
                <div className="rounded-lg bg-violet-500/10 p-3">
                  <svg className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Settings & Preferences</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
