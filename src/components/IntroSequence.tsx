import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  useEffect(() => {
    // 1.8s total sequence length
    const timer = setTimeout(() => {
      onComplete();
    }, 2100); // giving a bit of buffer for the exit animation
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3, ease: 'easeIn' }}
    >
      <div className="flex flex-col items-center">
        {/* Wordmark */}
        <motion.h1
          className="font-display text-5xl md:text-6xl font-bold tracking-tight text-brand-light relative"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          KarmFlow
          
          {/* Accent Line */}
          <motion.div
            className="absolute -bottom-2 left-0 h-[2px] bg-brand-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.4 }}
          />
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="mt-6 text-sm md:text-base font-medium tracking-[0.2em] text-[#888888] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
        >
          Your Karm. Your Career.
        </motion.p>
      </div>
    </motion.div>
  );
}
