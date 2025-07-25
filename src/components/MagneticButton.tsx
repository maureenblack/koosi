import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = '', 
  onClick,
  disabled = false 
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (disabled || !ref.current || !isMounted) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    const maxOffset = 10;
    const boundedX = Math.max(Math.min(middleX * 0.1, maxOffset), -maxOffset);
    const boundedY = Math.max(Math.min(middleY * 0.1, maxOffset), -maxOffset);
    
    if (isMounted) {
      setPosition({ x: boundedX, y: boundedY });
    }
  }, [disabled, isMounted]);

  const reset = useCallback(() => {
    if (!disabled && isMounted) {
      setPosition({ x: 0, y: 0 });
    }
  }, [disabled, isMounted]);

  if (!isMounted) return null;

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={disabled ? undefined : onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ 
        type: "spring", 
        stiffness: 150, 
        damping: 15, 
        mass: 0.1,
        restDelta: 0.001 
      }}
      className={`relative overflow-hidden ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
      disabled={disabled}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0"
        whileHover={{ opacity: disabled ? 0 : 0.1 }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.button>
  );
};

export default MagneticButton;