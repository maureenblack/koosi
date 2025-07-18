import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  ShieldCheckIcon, 
  UserGroupIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const Features: React.FC = () => {
  const features = [
    {
      icon: ClockIcon,
      title: "Smart Timing",
      description: "Messages unlock based on real-world events, not just calendar dates. Graduate, get engaged, or achieve goals to trigger your capsules.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: ShieldCheckIcon,
      title: "Blockchain Security",
      description: "Your messages are encrypted and stored on blockchain, ensuring they're tamper-proof and will survive for generations.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: UserGroupIcon,
      title: "Family Coordination",
      description: "Set conditions that require family consensus. Perfect for sharing wisdom when loved ones are truly ready to receive it.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: SparklesIcon,
      title: "Perfect Moments",
      description: "Transform ordinary messages into extraordinary memories by delivering them at life's most meaningful milestones.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: BoltIcon,
      title: "Emergency Protocols",
      description: "Dead man's switch ensures important messages reach loved ones even when life takes unexpected turns.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: HeartIcon,
      title: "Emotional Impact",
      description: "Be emotionally present across time. Your future self and loved ones will thank you for perfect timing.",
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Why Koosi Changes Everything
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Traditional messaging happens now. Koosi happens at the perfect moment.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card group hover:scale-105 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="btn-primary text-lg px-8 py-4">
            Start Creating Magic Moments
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;