import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header 
      className="shadow-2xl sticky top-0 z-50 backdrop-blur-md border-b border-white/10"
      style={{ 
        background: 'linear-gradient(135deg, #1A0B4A 0%, #2D1B69 50%, #1A0B4A 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
            <img 
              src="/images/koosi-logo.png" 
              alt="Koosi" 
              className="h-12 relative z-10 transition-all duration-500 group-hover:scale-110 filter drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div 
              className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl items-center justify-center hidden relative z-10"
              style={{ display: 'none' }}
            >
              <span className="text-white font-bold text-xl">K</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
            <Link to="/" className="no-underline px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300 font-medium relative group">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link to="/features" className="no-underline px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300 font-medium relative group">
              <span className="relative z-10">Features</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link to="/how-it-works" className="no-underline px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300 font-medium relative group">
              <span className="relative z-10">How It Works</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link to="/pricing" className="no-underline px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300 font-medium relative group">
              <span className="relative z-10">Pricing</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/signin" className="no-underline text-white/90 hover:text-white transition-colors duration-300 font-medium px-6 py-2 rounded-full border border-white/20 hover:border-white/40 backdrop-blur-sm">
              Sign In
            </Link>
            <Link to="/signup" className="no-underline relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-size-200 animate-gradient-x rounded-full"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-orange-500/30">
                Get Started
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-xl text-white/90 hover:text-white transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
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
          className="md:hidden backdrop-blur-xl border-t border-white/10"
          style={{ 
            background: 'rgba(26, 11, 74, 0.95)',
          }}
        >
          <div className="px-6 pt-4 pb-6 space-y-2">
            <Link 
              to="/" 
              className="no-underline block py-4 px-6 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 border border-transparent hover:border-orange-500/30"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="no-underline block py-4 px-6 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 border border-transparent hover:border-orange-500/30"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/how-it-works" 
              className="no-underline block py-4 px-6 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 border border-transparent hover:border-orange-500/30"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className="no-underline block py-4 px-6 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 border border-transparent hover:border-orange-500/30"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/signin" 
              className="no-underline block py-4 px-6 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 border border-transparent hover:border-orange-500/30"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="no-underline block py-4 px-6 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20 border border-transparent hover:border-orange-500/30 bg-gradient-to-r from-orange-500 to-yellow-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
