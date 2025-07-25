import React from 'react';
import { Link } from 'react-router-dom';

const PricingCard = ({ 
  title, 
  price, 
  features, 
  isPopular = false,
  buttonText = "Get Started" 
}: {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
}) => (
  <div className={`bg-white/5 backdrop-blur-sm p-8 rounded-2xl border ${isPopular ? 'border-orange-500' : 'border-white/10'} relative`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
          Most Popular
        </div>
      </div>
    )}
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold">{price}</span>
      {price !== "Free" && <span className="text-white/60">/month</span>}
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-white/80">
          <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <Link to="/signup" className={`block text-center py-3 px-6 rounded-full font-semibold transition-all duration-300
      ${isPopular 
        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105' 
        : 'bg-white/10 text-white hover:bg-white/20'}`}>
      {buttonText}
    </Link>
  </div>
);

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0B4A] to-[#2D1B69] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-center mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-center text-white/80 mb-12">Choose the plan that's right for you</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard
            title="Free"
            price="Free"
            features={[
              "5 time capsules",
              "Basic triggers",
              "1GB storage",
              "Email delivery",
              "30-day message history"
            ]}
            buttonText="Get Started Free"
          />
          
          <PricingCard
            title="Pro"
            price="$9.99"
            features={[
              "Unlimited time capsules",
              "Advanced triggers",
              "10GB storage",
              "Priority delivery",
              "1-year message history",
              "Custom branding"
            ]}
            isPopular={true}
          />
          
          <PricingCard
            title="Enterprise"
            price="$29.99"
            features={[
              "Everything in Pro",
              "Unlimited storage",
              "Smart contract triggers",
              "API access",
              "Infinite message history",
              "24/7 priority support"
            ]}
            buttonText="Contact Sales"
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;
