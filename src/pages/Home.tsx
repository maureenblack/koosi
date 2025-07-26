import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorksSection from '../components/HowItWorksSection';
import { Suspense, lazy } from 'react';
const Scene3D = lazy(() => import('../components/Scene3D'));

// Loading fallback
function LoadingFallback() {
  return (
    <div 
      style={{ 
        width: '100%', 
        height: window.innerWidth <= 768 ? '60vh' : '80vh',
        background: 'linear-gradient(135deg, #1A0B4A 0%, #2D1B69 50%, #1A0B4A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="animate-pulse text-white/50 text-lg font-medium">
        Loading magical experience...
      </div>
    </div>
  );
}

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0B4A] to-[#2D1B69]">
      <div className="relative">
        <Suspense fallback={<LoadingFallback />}>
        <Scene3D />
      </Suspense>
        <div className="relative z-10">
          <Hero />
          <Features />
          <HowItWorksSection />
        </div>
      </div>
    </div>
  );
};

export default Home;
