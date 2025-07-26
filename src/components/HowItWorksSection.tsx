import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Message',
      description: 'Write a heartfelt message, upload photos, or record a video. Make it as personal as you want.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: '02',
      title: 'Set Your Conditions',
      description: 'Choose when your message should be delivered - a specific date, life event, or achievement.',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      number: '03',
      title: 'Add Recipients',
      description: 'Select who should receive your message. Add multiple recipients and customize delivery for each.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      number: '04',
      title: 'Perfect Timing',
      description: 'We will ensure your message is delivered at exactly the right moment for maximum impact.',
      color: 'from-green-500 to-emerald-500',
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Koosi Works
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Create meaningful messages that arrive at life's perfect moments.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-white/20 to-transparent transform -translate-y-1/2" />
              )}
              
              {/* Step Card */}
              <div className="relative group">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-colors duration-300" />
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold">{step.number}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-white/80">
                    {step.description}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRightIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link 
            to="/login?signup=true"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            Start Creating
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
