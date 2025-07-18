import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, ClockIcon, HeartIcon } from '@heroicons/react/24/outline';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8"
          >
            <ClockIcon className="w-4 h-4 mr-2" />
            Perfect timing for life's moments
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Digital Time Capsules
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
              for Perfect Moments
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed"
          >
            Send messages to the future that unlock at exactly the right moment. 
            Because timing isn't just everything—it's the only thing that turns a message into a moment.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group">
              <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Create Your First Capsule</span>
            </button>
            <button className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2 group">
              <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 text-sm"
          >
            {[
              "🎓 Graduation Messages",
              "💍 Anniversary Surprises", 
              "👶 Baby's First Words",
              "🏆 Achievement Celebrations"
            ].map((feature, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                {feature}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;