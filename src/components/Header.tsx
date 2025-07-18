import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Koosi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-orange-500">Home</a>
            <a href="#features" className="text-gray-700 hover:text-orange-500">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-orange-500">How It Works</a>
            <a href="#pricing" className="text-gray-700 hover:text-orange-500">Pricing</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-500">Sign In</button>
            <button className="btn-primary">Get Started</button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
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
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <a href="/" className="block py-2 text-gray-700">Home</a>
            <a href="#features" className="block py-2 text-gray-700">Features</a>
            <a href="#how-it-works" className="block py-2 text-gray-700">How It Works</a>
            <a href="#pricing" className="block py-2 text-gray-700">Pricing</a>
            <div className="pt-4 space-y-2">
              <button className="w-full text-left py-2 text-gray-700">Sign In</button>
              <button className="w-full btn-primary">Get Started</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;