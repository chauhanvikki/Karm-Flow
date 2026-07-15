import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ApplicationStage, Application, Candidate } from '../../lib/mockData';
import CandidateCard from './CandidateCard';
import clsx from 'clsx';

interface PipelineColumnProps {
  stage: ApplicationStage;
  applications: Application[];
  candidates: Record<string, Candidate>;
  onCandidateClick: (app: Application, candidate: Candidate) => void;
}

export default function PipelineColumn({ stage, applications, candidates, onCandidateClick }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: {
      type: 'Column',
      stage,
    }
  });

  const isTerminal = stage === 'Hired' || stage === 'Rejected';

  return (
    <div className="flex flex-col w-[300px] shrink-0 h-full">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0A0A0A] py-2 z-10">
        <div className="flex items-center gap-2">
          <h3 className={clsx(
            "text-[14px] font-semibold uppercase tracking-wider",
            stage === 'Hired' ? "text-brand-accent" :
            stage === 'Rejected' ? "text-red-500" : "text-[#FAFAFA]"
          )}>
            {stage}
          </h3>
          <span className="bg-[#1A1A1A] text-[#888888] text-[11px] font-medium px-2 py-0.5 rounded-full">
            {applications.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 rounded-[16px] p-2 flex flex-col gap-3 min-h-[150px] transition-colors border",
          isOver ? "bg-[#151515] border-brand-accent/30" : "bg-[#0F0F0F] border-transparent",
          isTerminal ? "border-dashed border-[#222222]" : ""
        )}
      >
        <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map(app => (
            <CandidateCard
              key={app.id}
              application={app}
              candidate={candidates[app.candidateId]}
              onClick={() => onCandidateClick(app, candidates[app.candidateId])}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
