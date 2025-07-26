import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const SignupSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/dashboard');
    }
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          {/* Success animation */}
          <div className="mx-auto h-24 w-24 mb-6">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-25 animate-ping" />
              <div className="relative flex items-center justify-center h-full w-full rounded-full bg-green-100">
                <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to Koosi!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been successfully created
          </p>
          
          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in {countdown} seconds...
            </p>
            
            <div className="flex flex-col space-y-3">
              <Link
                to="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard Now
              </Link>
              
              <Link
                to="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
