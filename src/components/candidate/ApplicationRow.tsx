import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import StageProgress from './StageProgress';
import type { Application, Job } from '../../lib/mockData';

interface ApplicationRowProps {
  application: Application;
  job: Job;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export default function ApplicationRow({ application, job, isExpanded, onToggle, index }: ApplicationRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      className="bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden hover:border-[#333333] transition-colors"
    >
      <button 
        onClick={onToggle}
        className="w-full text-left p-6 focus:outline-none"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-[18px] font-semibold text-[#FAFAFA] mb-1">{job.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#888888]">
              <span>{job.department}</span>
              <span className="w-1 h-1 rounded-full bg-[#444444]" />
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="hidden md:block w-[300px]">
               <StageProgress currentStage={application.currentStage} />
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888888]"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
        
        {/* Mobile progress */}
        <div className="block md:hidden mt-6 w-full">
          <StageProgress currentStage={application.currentStage} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-t border-[#222222] bg-[#0A0A0A]"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[14px] font-medium text-[#FAFAFA] mb-4">Application History</h4>
                <div className="space-y-4">
                  {application.timeline.map((event, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-[#333333]">
                          <CheckCircle2 className="w-3 h-3 text-[#FAFAFA]" />
                        </div>
                        {i !== application.timeline.length - 1 && (
                          <div className="w-[1px] h-6 bg-[#222222] my-1" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#FAFAFA]">{event.stage}</p>
                        <p className="text-[13px] text-[#888888]">
                          {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-[14px] font-medium text-[#FAFAFA] mb-4">Resume Feedback</h4>
                {!application.atsScore ? (
                  <p className="text-[13px] text-[#888888] italic">Score unavailable</p>
                ) : (
                  <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Simple SVG Ring Gauge */}
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#222222]" />
                          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                            strokeDasharray={20 * 2 * Math.PI}
                            strokeDashoffset={20 * 2 * Math.PI - ((application.atsScore.matchScore || 0) / 100) * (20 * 2 * Math.PI)}
                            className="text-[#555555] transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#FAFAFA]">
                          {application.atsScore.matchScore}%
                        </div>
                      </div>
                      <div>
                        <p className="text-[14px] text-[#FAFAFA] font-medium">{application.atsScore.summary}</p>
                        <p className="text-[13px] text-[#888888] mt-1">
                          Your resume matched {application.atsScore.matchedKeywords?.length || 0} of {(application.atsScore.matchedKeywords?.length || 0) + (application.atsScore.missingKeywords?.length || 0)} key skills.
                        </p>
                      </div>
                    </div>
                    
                    {application.atsScore.missingKeywords && application.atsScore.missingKeywords.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#222222]">
                        <p className="text-[13px] text-[#888888] mb-2">Consider highlighting:</p>
                        <div className="flex flex-wrap gap-2">
                          {application.atsScore.missingKeywords.slice(0, 5).map((kw: string) => (
                            <span key={kw} className="px-2 py-1 bg-[#1A1A1A] border border-[#333333] rounded text-[11px] text-[#AAAAAA]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
