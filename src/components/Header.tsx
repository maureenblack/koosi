import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header 
      className="shadow-lg sticky top-0 z-50"
      style={{ backgroundColor: '#1A0B4A' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="group">
            <img 
              src="/images/koosi-logo.png" 
              alt="Koosi" 
              className="h-10 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div 
              className="w-10 h-10 bg-orange-500 rounded-lg items-center justify-center hidden"
              style={{ display: 'none' }}
            >
              <span className="text-white font-bold text-lg">K</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">Home</a>
            <a href="#features" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">How It Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">Pricing</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-300 hover:text-blue-300 transition-colors duration-200 font-medium px-4 py-2">
              Sign In
            </button>
            <button className="btn-primary">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-orange-400 transition-all duration-200"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div 
          className="md:hidden shadow-lg border-t"
          style={{ 
            backgroundColor: '#1A0B4A',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="px-4 pt-2 pb-4 space-y-1">
            <a 
              href="/" 
              className="block py-3 px-4 rounded-lg text-gray-300 hover:text-orange-400 transition-all duration-200 font-medium hover:bg-orange-500 hover:bg-opacity-10"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="#features" 
              className="block py-3 px-4 rounded-lg text-gray-300 hover:text-orange-400 transition-all duration-200 font-medium hover:bg-orange-500 hover:bg-opacity-10"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="block py-3 px-4 rounded-lg text-gray-300 hover:text-orange-400 transition-all duration-200 font-medium hover:bg-orange-500 hover:bg-opacity-10"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              className="block py-3 px-4 rounded-lg text-gray-300 hover:text-orange-400 transition-all duration-200 font-medium hover:bg-orange-500 hover:bg-opacity-10"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div 
              className="pt-4 space-y-3 mt-4"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <button 
                className="w-full text-left py-3 px-4 text-gray-300 hover:text-blue-300 transition-colors duration-200 font-medium rounded-lg hover:bg-white hover:bg-opacity-5"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </button>
              <button 
                className="w-full btn-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;