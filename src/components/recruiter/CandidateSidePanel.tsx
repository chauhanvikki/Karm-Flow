import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Mail, MessageSquare, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { Candidate, Application, ApplicationStage } from '../../lib/mockData';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../candidate/ToastProvider';

interface CandidateSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  application: Application | null;
  onStageChange: (id: string, newStage: ApplicationStage) => void;
}

export default function CandidateSidePanel({ isOpen, onClose, candidate, application, onStageChange }: CandidateSidePanelProps) {
  const { addToast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  if (!candidate || !application) return null;

  const onAddNote = (data: any) => {
    if (data.note) {
      addToast('Note added successfully');
      reset();
    }
  };

  const STAGES: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[500px] bg-[#111111] border-l border-[#222222] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-[#222222]">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-lg font-medium text-[#FAFAFA] border border-[#333333]">
                  {candidate.initials}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#FAFAFA]">{candidate.name}</h2>
                  <div className="flex items-center gap-3 text-[13px] text-[#888888] mt-1">
                    <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-[#FAFAFA] transition-colors">
                      <Mail className="w-3.5 h-3.5" /> {candidate.email}
                    </a>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-[#888888] hover:text-[#FAFAFA] transition-colors rounded-full hover:bg-[#222222]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Quick Actions / Status */}
              {/* Process Line / Stage Heatmap */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[12px] font-medium text-[#888888] uppercase tracking-wider">Pipeline Progress</label>
                  <select
                    value={application.currentStage}
                    onChange={(e) => onStageChange(application.id, e.target.value as ApplicationStage)}
                    className="bg-transparent border-none text-[#FAFAFA] text-[13px] font-medium cursor-pointer focus:ring-0 hover:text-brand-accent transition-colors"
                  >
                    {STAGES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                
                <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden bg-[#1A1A1A]">
                  {STAGES.map((stage, idx) => {
                    const currentIdx = STAGES.findIndex(s => s.toLowerCase() === application.currentStage.toLowerCase());
                    const isCompleted = idx <= currentIdx;
                    const isRejected = application.currentStage.toLowerCase() === 'rejected';
                    
                    let bgClass = 'bg-[#222222]'; // Upcoming
                    if (isCompleted) {
                      if (isRejected) {
                        bgClass = 'bg-red-500/80';
                      } else if (stage.toLowerCase() === 'hired') {
                        bgClass = 'bg-green-500/80';
                      } else {
                        bgClass = 'bg-brand-accent';
                      }
                    }

                    return (
                      <div 
                        key={stage} 
                        className={`flex-1 transition-all duration-500 ${bgClass}`}
                        title={stage}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 px-1">
                  {STAGES.map((stage, idx) => {
                    const currentIdx = STAGES.findIndex(s => s.toLowerCase() === application.currentStage.toLowerCase());
                    const isActive = idx === currentIdx;
                    return (
                      <span key={stage} className={`text-[10px] uppercase font-semibold tracking-wider ${isActive ? 'text-[#FAFAFA]' : 'text-[#666666]'}`}>
                        {stage}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Tabs / Content */}
              <div className="space-y-8">
                
                {/* ATS Match Breakdown */}
                {application.atsScore && (
                  <section>
                    <h3 className="font-semibold text-[#FAFAFA] mb-3">ATS Match Breakdown</h3>
                    <div className="bg-[#151515] border border-[#222222] rounded-xl p-5">
                      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#222222]">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#222222]" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                              strokeDasharray={28 * 2 * Math.PI}
                              strokeDashoffset={28 * 2 * Math.PI - ((application.atsScore.matchScore || 0) / 100) * (28 * 2 * Math.PI)}
                              className={`${
                                application.atsScore.matchScore >= 70 ? 'text-green-500' :
                                application.atsScore.matchScore >= 40 ? 'text-yellow-500' :
                                'text-red-500'
                              } transition-all duration-1000 ease-out`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[14px] font-bold text-[#FAFAFA]">
                            {application.atsScore.matchScore}%
                          </div>
                        </div>
                        <div>
                          <p className="text-[14px] text-[#FAFAFA] font-medium leading-relaxed">{application.atsScore.summary}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {application.atsScore.matchedKeywords && application.atsScore.matchedKeywords.length > 0 && (
                          <div>
                            <p className="text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-2">Matched Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {application.atsScore.matchedKeywords.map((kw: string) => (
                                <span key={kw} className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[11px] text-green-400">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {application.atsScore.missingKeywords && application.atsScore.missingKeywords.length > 0 && (
                          <div>
                            <p className="text-[12px] font-medium text-[#888888] uppercase tracking-wider mb-2">Missing Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {application.atsScore.missingKeywords.map((kw: string) => (
                                <span key={kw} className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-red-400">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Resume Preview */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#FAFAFA]">Resume</h3>
                    <a 
                      href={application.resumeUrl ? (application.resumeUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000'}${application.resumeUrl}` : application.resumeUrl) : '#'}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[13px] text-brand-accent hover:text-brand-accent/80 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open / Download
                    </a>
                  </div>
                  <div className="h-32 rounded-xl border border-[#333333] bg-[#151515] flex flex-col items-center justify-center text-[#888888]">
                    <Briefcase className="w-6 h-6 mb-2 text-[#444444]" />
                    <span className="text-[13px] text-center px-4 truncate w-full">
                      {application.resumeUrl ? application.resumeUrl.split('/').pop() : 'No resume uploaded'}
                    </span>
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <h3 className="font-semibold text-[#FAFAFA] mb-3">Notes</h3>
                  <form onSubmit={handleSubmit(onAddNote)} className="mb-4">
                    <textarea
                      {...register('note')}
                      placeholder="Add a note..."
                      rows={3}
                      className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] text-[14px] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button type="submit" className="px-4 py-2 bg-[#FAFAFA] text-[#0A0A0A] rounded-full text-[13px] font-medium hover:bg-[#EAEAEA] transition-colors">
                        Save Note
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {/* Mock note */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center text-[#FAFAFA] text-xs font-medium flex-shrink-0">
                        VS
                      </div>
                      <div className="flex-1 bg-[#151515] border border-[#222222] rounded-xl rounded-tl-none p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[13px] font-medium text-[#FAFAFA]">Vikki Singh</span>
                          <span className="text-[11px] text-[#666666]">2d ago</span>
                        </div>
                        <p className="text-[14px] text-[#CCCCCC]">Strong communication skills. Proceeding to technical screen.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Stage History */}
                <section>
                  <h3 className="font-semibold text-[#FAFAFA] mb-4">Timeline</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#222222]">
                    {application.timeline.map((event, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#111111] bg-[#222222] text-[#888888] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-[#222222] bg-[#151515]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px] font-medium text-[#FAFAFA]">{event.stage}</span>
                          </div>
                          <time className="text-[11px] text-[#666666]">{formatDistanceToNow(new Date(event.date), { addSuffix: true })}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
