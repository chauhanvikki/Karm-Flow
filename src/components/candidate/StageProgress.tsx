import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ApplicationStage } from '../../lib/mockData';

const STAGES: ApplicationStage[] = ['Applied', 'In Review', 'Interview', 'Offer'];

interface StageProgressProps {
  currentStage: ApplicationStage;
}

export default function StageProgress({ currentStage }: StageProgressProps) {
  const currentIndex = currentStage === 'Rejected' ? 0 : STAGES.indexOf(currentStage);
  const isRejected = currentStage === 'Rejected';

  return (
    <div className="w-full relative mt-6 mb-2">
      {/* Background Track */}
      <div className="absolute top-[9px] left-0 right-0 h-[2px] bg-[#222222] rounded-full z-0" />
      
      {/* Active Track */}
      {!isRejected && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out
          className="absolute top-[9px] left-0 h-[2px] bg-brand-accent rounded-full z-0"
        />
      )}

      <div className="relative z-10 flex justify-between items-start">
        {STAGES.map((stage, index) => {
          const isCompleted = !isRejected && index < currentIndex;
          const isCurrent = !isRejected && index === currentIndex;
          const isFuture = isRejected || index > currentIndex;

          return (
            <div key={stage} className="flex flex-col items-center flex-1 -mx-4 group">
              <div className="relative flex items-center justify-center w-5 h-5 bg-[#111111] mb-2 rounded-full z-10">
                {/* Node indicator */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1 : 0.8,
                    backgroundColor: isRejected && index === 0 
                      ? '#ef4444' // red for rejected
                      : isCompleted || isCurrent 
                        ? '#0F9B8E' // brand-accent
                        : '#333333' // muted future state
                  }}
                  transition={{ duration: 0.3 }}
                  className={clsx(
                    "w-3 h-3 rounded-full relative z-10 transition-colors",
                    isCurrent && !isRejected && "animate-pulse-subtle"
                  )}
                />
                
                {/* Ping animation for current stage */}
                {isCurrent && !isRejected && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 bg-brand-accent rounded-full z-0"
                  />
                )}
              </div>
              
              <span className={clsx(
                "text-[11px] font-medium transition-colors text-center px-1",
                isRejected && index === 0 ? "text-red-500" :
                (isCompleted || isCurrent) ? "text-[#FAFAFA]" : "text-[#666666]"
              )}>
                {isRejected && index === 0 ? 'Rejected' : stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
