import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Scene3D from '../components/Scene3D';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0B4A] to-[#2D1B69]">
      <div className="relative">
        <Scene3D />
        <div className="relative z-10">
          <Hero />
          <Features />
        </div>
      </div>
    </div>
  );
};

export default Home;
