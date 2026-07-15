import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { Mail, FileText } from 'lucide-react';
import type { Candidate, Application } from '../../lib/mockData';

interface CandidateCardProps {
  candidate: Candidate;
  application: Application;
  onClick: () => void;
}

export default function CandidateCard({ candidate, application, onClick }: CandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: 'Application',
      application,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-[#151515] border border-[#222222] rounded-[12px] p-4 cursor-grab active:cursor-grabbing hover:border-[#333333] transition-colors relative group ${
        isDragging ? 'shadow-2xl z-50 scale-[1.02]' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs font-medium text-[#FAFAFA] border border-[#333333]">
            {candidate.initials || candidate.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-semibold text-[#FAFAFA] leading-tight">{candidate.name}</h4>
              {application.atsScore && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  application.atsScore.matchScore >= 70 ? 'bg-green-500/10 text-green-400' :
                  application.atsScore.matchScore >= 40 ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {application.atsScore.matchScore}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#666666]">
              {formatDistanceToNow(new Date(application.appliedAt || Date.now()), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1A1A1A] text-[#888888] border border-[#222222]">
          {candidate.source || 'Website'}
        </span>
        {(candidate.tags || []).map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-[#222222] opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${candidate.email}`; }}
          className="text-[#666666] hover:text-[#FAFAFA] transition-colors"
          title="Email"
        >
          <Mail className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="text-[#666666] hover:text-[#FAFAFA] transition-colors ml-auto"
          title="View Resume"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
