import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Clock, Heart, Sparkles, ArrowRight, Zap, Play, MousePointer } from 'lucide-react';
import Scene3D from './Scene3D';
import MagneticButton from './MagneticButton';
import { CounterAnimation } from './ScrollAnimations';

const Hero = () => {
  const [activeDemo, setActiveDemo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [capsuleStep, setCapsuleStep] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();

  // Advanced mouse tracking with momentum
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        setMousePosition({ x, y });
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    console.log('Adding mousemove event listener');
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      console.log('Removing mousemove event listener');
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Typing animation effect
  const typewriterText = "Dear future me, remember this moment...";
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (isTyping && capsuleStep === 0 && activeDemo) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < typewriterText.length) {
          setDisplayText(typewriterText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          setMessage(typewriterText);
          setIsTyping(false);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isTyping, capsuleStep, activeDemo]);

  const triggers = [
    { id: 'graduation', label: 'When I Graduate', icon: '🎓', color: 'from-blue-500 to-indigo-600', delay: 0 },
    { id: 'anniversary', label: 'Our 5th Anniversary', icon: '💍', color: 'from-pink-500 to-rose-600', delay: 0.1 },
    { id: 'birthday', label: 'My 30th Birthday', icon: '🎂', color: 'from-purple-500 to-violet-600', delay: 0.2 },
    { id: 'achievement', label: 'First Job Promotion', icon: '🚀', color: 'from-emerald-500 to-teal-600', delay: 0.3 },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(255, 107, 53, 0.2) 0%, 
            rgba(45, 27, 105, 0.9) 30%, 
            rgba(26, 11, 74, 1) 70%),
          linear-gradient(135deg, #1A0B4A 0%, #2D1B69 50%, #1A0B4A 100%)
        `
      }}
    >
      {/* 3D Scene */}
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>

      {/* Dynamic Mesh Gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mouseXSpring}px ${mouseYSpring}px, rgba(255, 107, 53, 0.15), transparent 40%)`,
        }}
      />

      {/* Floating Cursor Follower */}
      <motion.div
        className="absolute w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full pointer-events-none z-10 mix-blend-screen"
        style={{
          left: mouseXSpring,
          top: mouseYSpring,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Interactive Grid Lines */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 107, 53, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 107, 53, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Enhanced Content */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Floating Badge */}
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full backdrop-blur-sm border text-orange-300 text-sm font-medium mb-8 relative overflow-hidden"
              style={{
                background: 'rgba(255, 107, 53, 0.1)',
                borderColor: 'rgba(255, 107, 53, 0.3)'
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255, 107, 53, 0.3)',
                  '0 0 40px rgba(255, 107, 53, 0.5)',
                  '0 0 20px rgba(255, 107, 53, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <Clock className="w-4 h-4 mr-2 z-10" />
              <span className="z-10">AI-Powered Temporal Technology</span>
              <Sparkles className="w-4 h-4 ml-2 z-10" />
            </motion.div>

            {/* Animated Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <motion.span 
                className="block"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Messages That
              </motion.span>
              <motion.span 
                className="block relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span 
                  className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradient-x 3s ease infinite'
                  }}
                >
                  Unlock Life
                </span>
                <motion.div
                  className="absolute -right-4 top-0 text-4xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.div>
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-gray-300 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Create digital time capsules that open at exactly the right moment. 
              <motion.span 
                className="text-orange-300 font-semibold"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {" "}AI determines perfect timing
              </motion.span> based on life events, achievements, and emotional readiness.
            </motion.p>
            
            {/* Enhanced CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <MagneticButton
                className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold px-8 py-4 rounded-2xl border border-orange-400/50"
                onClick={() => {
                  setActiveDemo(true);
                  setTimeout(() => setIsTyping(true), 500);
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10 flex items-center">
                  <MousePointer className="w-5 h-5 mr-2" />
                  Try Interactive Demo
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.div>
                </span>
              </MagneticButton>

              <MagneticButton
                className="group flex items-center text-white font-medium px-8 py-4 rounded-2xl border border-white/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <motion.div 
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors relative overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  <Play className="w-6 h-6 text-white z-10" />
                </motion.div>
                <span>Watch Demo Video</span>
              </MagneticButton>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              className="flex items-center space-x-8 pt-8 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <CounterAnimation target={10000} label="Capsules Created" />
              <CounterAnimation target={99.9} label="Perfect Timing %" />
              <CounterAnimation target={50} label="Life Events" />
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive Demo with 3D Effects */}
          <motion.div
            className="relative z-20"
            initial={{ opacity: 0, x: 100, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            <div className="relative perspective-1000">
              {/* 3D Demo Container */}
              <motion.div
                className="relative backdrop-blur-xl rounded-3xl p-8 border overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                animate={{
                  y: activeDemo ? 0 : [0, -10, 0],
                  rotateX: activeDemo ? 0 : [0, 2, 0],
                }}
                transition={{
                  y: activeDemo ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotateX: activeDemo ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 2,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Glowing Border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(45deg, transparent, rgba(255, 107, 53, 0.1), transparent, rgba(79, 195, 247, 0.1), transparent)',
                    backgroundSize: '400% 400%'
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                {!activeDemo ? (
                  // Enhanced Preview State
                  <motion.div className="text-center relative z-10">
                    <motion.div
                      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center relative"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl blur-lg opacity-50"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <Heart className="w-12 h-12 text-white z-10" />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-2xl font-bold text-white mb-3"
                      animate={{ opacity: [1, 0.8, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Create Your First Capsule
                    </motion.h3>
                    
                    <p className="text-gray-300 mb-6">Experience the magic of perfect timing</p>
                    
                    <MagneticButton
                      className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-4 rounded-xl border border-orange-400/30"
                      onClick={() => {
                        setActiveDemo(true);
                        setTimeout(() => setIsTyping(true), 500);
                      }}
                    >
                      <motion.span
                        className="flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        Start Interactive Demo
                        <Sparkles className="w-5 h-5 ml-2" />
                      </motion.span>
                    </MagneticButton>
                  </motion.div>
                ) : (
                  // Enhanced Active Demo
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                  >
                    {capsuleStep === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ✍️
                          </motion.span>
                          <span className="ml-2">Write Your Message</span>
                        </h3>
                        
                        <div className="relative">
                          <textarea
                            value={isTyping ? displayText : message}
                            onChange={(e) => !isTyping && setMessage(e.target.value)}
                            placeholder="Dear future me..."
                            className="w-full h-32 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                            disabled={isTyping}
                          />
                          {isTyping && (
                            <motion.div
                              className="absolute bottom-4 right-4 w-2 h-6 bg-orange-400"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                        </div>
                        
                        <MagneticButton
                          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setCapsuleStep(1)}
                        >
                          <motion.span
                            className="flex items-center justify-center"
                            whileHover={{ x: 5 }}
                          >
                            Next: Choose Trigger
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </motion.span>
                        </MagneticButton>
                      </motion.div>
                    )}

                    {capsuleStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            ⏰
                          </motion.span>
                          <span className="ml-2">When should this unlock?</span>
                        </h3>
                        
                        <div className="space-y-3 mb-6">
                          {triggers.map((trigger, index) => (
                            <motion.button
                              key={trigger.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: trigger.delay }}
                              className={`w-full p-4 rounded-xl border transition-all relative overflow-hidden ${
                                selectedTrigger === trigger.id
                                  ? 'border-orange-400 bg-orange-500/20 scale-105'
                                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:scale-102'
                              }`}
                              whileHover={{ 
                                scale: selectedTrigger === trigger.id ? 1.05 : 1.02,
                                rotateY: 2 
                              }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedTrigger(trigger.id)}
                            >
                              {/* Animated background glow */}
                              {selectedTrigger === trigger.id && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-yellow-400/30 rounded-xl"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                              
                              <div className="flex items-center relative z-10">
                                <motion.span 
                                  className="text-3xl mr-4"
                                  animate={selectedTrigger === trigger.id ? { 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.2, 1]
                                  } : {}}
                                  transition={{ duration: 0.5 }}
                                >
                                  {trigger.icon}
                                </motion.span>
                                
                                <div className="text-left">
                                  <span className="text-white font-medium block">{trigger.label}</span>
                                  <span className="text-gray-400 text-sm">
                                    {trigger.id === 'graduation' && 'AI monitors academic platforms'}
                                    {trigger.id === 'anniversary' && 'Smart calendar integration'}
                                    {trigger.id === 'birthday' && 'Automatic date calculation'}
                                    {trigger.id === 'achievement' && 'Professional network tracking'}
                                  </span>
                                </div>
                                
                                {selectedTrigger === trigger.id && (
                                  <motion.div
                                    className="ml-auto"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        
                        <MagneticButton
                          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setCapsuleStep(2)}
                        >
                          <motion.span
                            className="flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Create Capsule
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-4 h-4 ml-2" />
                            </motion.div>
                          </motion.span>
                        </MagneticButton>
                      </motion.div>
                    )}
 
                    {capsuleStep === 2 && (
                      <motion.div
                        className="text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Success Animation */}
                        <motion.div
                          className="relative w-32 h-32 mx-auto mb-6"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                        >
                          {/* Pulsing rings */}
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute inset-0 border-2 border-green-400 rounded-full"
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ 
                                scale: [0, 1.5, 2],
                                opacity: [1, 0.5, 0]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3
                              }}
                            />
                          ))}
                          
                          {/* Center icon */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 1 }}
                          >
                            <Zap className="w-16 h-16 text-white" />
                          </motion.div>
                        </motion.div>
                        
                        <motion.h3 
                          className="text-3xl font-bold text-white mb-3"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          Capsule Created! 🎉
                        </motion.h3>
                        
                        <motion.p 
                          className="text-gray-300 mb-6"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          Your message will unlock when the perfect moment arrives
                        </motion.p>
                        
                        {/* Capsule Preview */}
                        <motion.div 
                          className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.9 }}
                        >
                          <div className="flex items-start space-x-4">
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center"
                              animate={{ 
                                boxShadow: [
                                  '0 0 20px rgba(255, 107, 53, 0.5)',
                                  '0 0 40px rgba(255, 107, 53, 0.8)',
                                  '0 0 20px rgba(255, 107, 53, 0.5)'
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Heart className="w-6 h-6 text-white" />
                            </motion.div>
                            
                            <div className="text-left flex-1">
                              <p className="text-sm text-gray-300 mb-2">
                                <strong className="text-white">Message:</strong> {message.slice(0, 40)}...
                              </p>
                              <p className="text-sm text-gray-300">
                                <strong className="text-white">Trigger:</strong> {triggers.find(t => t.id === selectedTrigger)?.label}
                              </p>
                              
                              {/* Fake AI analysis */}
                              <motion.div 
                                className="mt-3 p-3 bg-green-500/20 rounded-lg border border-green-400/30"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.2 }}
                              >
                                <div className="flex items-center text-green-400 text-xs">
                                  <motion.div
                                    className="w-2 h-2 bg-green-400 rounded-full mr-2"
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                  AI Analysis: Optimal timing detected
                                </div>
                                <div className="text-xs text-gray-300 mt-1">
                                  Estimated delivery: When emotional impact is maximized
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                        
                        <MagneticButton
                          className="w-full bg-white/20 text-white font-semibold py-4 rounded-xl border border-white/30 backdrop-blur-sm"
                          onClick={() => {
                            setActiveDemo(false);
                            setCapsuleStep(0);
                            setMessage('');
                            setSelectedTrigger('');
                            setDisplayText('');
                          }}
                        >
                          <motion.span
                            className="flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            Create Another Capsule
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </motion.div>
                          </motion.span>
                        </MagneticButton>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
 
              {/* Floating Elements around Demo */}
              <motion.div
                className="absolute -top-6 -right-6 w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
 
              <motion.div
                className="absolute -bottom-8 -left-8 w-16 h-16 border-2 border-blue-400/50 rounded-xl"
                animate={{
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 0.8, 1.2, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
 
              <motion.div
                className="absolute top-1/2 -right-12 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                animate={{
                  x: [0, 10, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
 };
 
 export default Hero;