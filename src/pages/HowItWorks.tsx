import React from 'react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0B4A] to-[#2D1B69] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-center mb-12">How Koosi Works</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-4">Create Your Message</h3>
            <p className="text-white/80">
              Write your message, upload photos, videos, or documents. Add your personal touch to create a meaningful time capsule.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold mb-4">Set Your Triggers</h3>
            <p className="text-white/80">
              Choose when and how your message will be delivered. Set time-based, event-based, or smart contract triggers.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold mb-4">Secure Delivery</h3>
            <p className="text-white/80">
              Your message is encrypted and securely stored. When the trigger conditions are met, it's automatically delivered.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-size-200 animate-gradient-x rounded-full"></div>
            <div className="relative bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-orange-500/30">
              Start Creating
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
