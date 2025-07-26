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
      title: "Smart Timing",
      description: "Messages unlock based on real-world events, not just calendar dates. Graduate, get engaged, or achieve goals to trigger your capsules.",
      color: "from-blue-500 to-blue-600",
      image: "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80",
      icon: ClockIcon
    },
    {
      title: "Blockchain Security",
      description: "Your messages are encrypted and stored on blockchain, ensuring they're tamper-proof and will survive for generations.",
      color: "from-green-500 to-green-600",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80",
      icon: ShieldCheckIcon
    },
    {
      title: "Family Coordination",
      description: "Set conditions that require family consensus. Perfect for sharing wisdom when loved ones are truly ready to receive it.",
      color: "from-purple-500 to-purple-600",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80",
      icon: UserGroupIcon
    },
    {
      title: "Perfect Moments",
      description: "Transform ordinary messages into extraordinary memories by delivering them at life's most meaningful milestones.",
      color: "from-pink-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80",
      icon: SparklesIcon
    },
    {
      title: "Emergency Protocols",
      description: "Dead man's switch ensures important messages reach loved ones even when life takes unexpected turns.",
      color: "from-orange-500 to-orange-600",
      image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80",
      icon: BoltIcon
    },
    {
      title: "Emotional Impact",
      description: "Be emotionally present across time. Your future self and loved ones will thank you for perfect timing.",
      color: "from-red-500 to-red-600",
      image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80",
      icon: HeartIcon
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-[400px] overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center backdrop-blur-sm`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-white/90 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>

              <div 
                className={`absolute inset-0 bg-gradient-to-r ${feature.color} mix-blend-overlay opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default Features;