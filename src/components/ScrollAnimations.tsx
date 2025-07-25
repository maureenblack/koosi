import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

const useParallax = (value: any, distance: number) => {
  return useTransform(value, [0, 1], [-distance, distance]);
};

const ScrollAnimations = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  
  const y = useParallax(scrollYProgress, 300);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  return (
    <motion.div ref={ref} style={{ y, opacity, scale }}>
      {children}
    </motion.div>
  );
};

export const CounterAnimation = ({ target, label }: { target: number, label: string }) => {
  const [count, setCount] = React.useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      const timer = setInterval(() => {
        setCount((prev) => {
          if (prev < target) {
            return prev + Math.ceil((target - prev) / 20);
          }
          return target;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent"
        animate={{ scale: isInView ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        {count.toLocaleString()}+
      </motion.div>
      <div className="text-gray-400 text-sm">{label}</div>
    </motion.div>
  );
};

export default ScrollAnimations;