import { useState, useMemo, useEffect, useRef } from 'react';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import type { ApplicationStage, Application, Candidate, Job } from '../../lib/mockData';
import PipelineColumn from './PipelineColumn';
import CandidateCard from './CandidateCard';
import CandidateSidePanel from './CandidateSidePanel';
import { useToast } from '../candidate/ToastProvider';

const STAGES: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

export default function PipelineBoard() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('job') || '';
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate>>({});
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const { addToast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('karmflow_token');
        const res = await fetch('http://localhost:3000/api/jobs?mine=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mappedJobs = data.map((j: any) => ({ ...j, id: j._id || j.id }));
          setJobs(mappedJobs);
          if (!selectedJobId && mappedJobs.length > 0) {
            setSelectedJobId(mappedJobs[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    // Connect socket
    socketRef.current = io('http://localhost:3000');
    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join-job-room', selectedJobId);
    });

    socket.on('application:stage-changed', (updatedApp: any) => {
      setApplications(prev => prev.map(app => 
        (app.id === updatedApp._id || app.id === updatedApp.id) 
          ? { ...app, currentStage: updatedApp.stage } 
          : app
      ));
    });

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('karmflow_token');
        const res = await fetch(`http://localhost:3000/api/applications/jobs/${selectedJobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mappedApps: Application[] = [];
          const cands: Record<string, Candidate> = {};

          data.forEach((a: any) => {
            const cand = a.candidateId;
            if (cand) {
              cands[cand._id || cand.id] = { ...cand, id: cand._id || cand.id };
            }
            mappedApps.push({
              ...a,
              id: a._id || a.id,
              jobId: selectedJobId,
              candidateId: cand ? (cand._id || cand.id) : '',
              currentStage: a.stage,
              appliedAt: a.createdAt || new Date().toISOString(),
              timeline: a.stageHistory?.map((sh: any) => ({ stage: sh.stage, date: sh.movedAt || a.createdAt || new Date().toISOString() })) || []
            });
          });

          setApplications(mappedApps);
          setCandidates(cands);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    fetchApplications();

    return () => {
      socket.emit('leave-job-room', selectedJobId);
      socket.disconnect();
    };
  }, [selectedJobId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Application';
    const isOverTask = over.data.current?.type === 'Application';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setApplications(apps => {
        const activeIndex = apps.findIndex(t => t.id === activeId);
        const overIndex = apps.findIndex(t => t.id === overId);

        if (apps[activeIndex].currentStage !== apps[overIndex].currentStage) {
          const newApps = [...apps];
          newApps[activeIndex].currentStage = apps[overIndex].currentStage;
          return arrayMove(newApps, activeIndex, overIndex);
        }

        return arrayMove(apps, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setApplications(apps => {
        const activeIndex = apps.findIndex(t => t.id === activeId);
        const newApps = [...apps];
        newApps[activeIndex].currentStage = overId as ApplicationStage;
        return arrayMove(newApps, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveTask = active.data.current?.type === 'Application';
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Application';

    let targetStage: ApplicationStage | null = null;

    if (isOverColumn) targetStage = overId as ApplicationStage;
    if (isOverTask) {
      const overApp = applications.find(a => a.id === overId);
      if (overApp) targetStage = overApp.currentStage;
    }

    if (targetStage) {
      updateApplicationStage(activeId, targetStage);
    }
  };

  const updateApplicationStage = async (appId: string, newStage: ApplicationStage) => {
    try {
      const token = localStorage.getItem('karmflow_token');
      const res = await fetch(`http://localhost:3000/api/applications/${appId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ stage: newStage })
      });
      if (res.ok) {
        addToast('Stage updated successfully');
      } else {
        addToast('Failed to update stage');
        // A robust app would revert state here.
      }
    } catch (err) {
      console.error('Error updating stage:', err);
      addToast('Error updating stage');
    }
  };

  const handleManualStageChange = (appId: string, newStage: ApplicationStage) => {
    setApplications(apps => apps.map(app => 
      app.id === appId ? { ...app, currentStage: newStage } : app
    ));
    if (selectedApp) {
      setSelectedApp({ ...selectedApp, currentStage: newStage });
    }
    updateApplicationStage(appId, newStage);
  };

  const activeApplication = useMemo(() => applications.find(app => app.id === activeId), [activeId, applications]);
  const activeCandidate = activeApplication ? candidates[activeApplication.candidateId] : undefined;

  const [sortBy, setSortBy] = useState<'date' | 'ats'>('date');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-[#0A0A0A]">
      <div className="p-6 md:p-10 pb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222222]">
        <div>
          <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2 tracking-tight">Pipeline</h2>
          <p className="text-[#888888] text-[16px]">Drag and drop candidates to move them through the stages.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'ats')}
            className="w-full md:w-[200px] bg-[#111111] border border-[#333333] rounded-lg px-4 py-2.5 text-[#FAFAFA] text-sm font-medium focus:outline-none focus:border-brand-accent transition-all appearance-none"
          >
            <option value="date">Sort by Date</option>
            <option value="ats">Sort by ATS Match</option>
          </select>
          
          <div className="relative w-full md:w-[300px]">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2.5 text-[#FAFAFA] text-sm font-medium focus:outline-none focus:border-brand-accent transition-all appearance-none"
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.location})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 md:px-10 pb-10">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start">
            {STAGES.map(stage => {
              const stageApps = applications.filter(a => a.currentStage === stage);
              
              if (sortBy === 'ats') {
                stageApps.sort((a, b) => (b.atsScore?.matchScore || 0) - (a.atsScore?.matchScore || 0));
              } else {
                stageApps.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
              }

              return (
                <PipelineColumn
                  key={stage}
                  stage={stage}
                  applications={stageApps}
                  candidates={candidates}
                  onCandidateClick={(app, cand) => {
                    setSelectedApp(app);
                    setSelectedCandidate(cand);
                  }}
                />
              );
            })}
          </div>

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activeApplication && activeCandidate ? (
              <CandidateCard
                application={activeApplication}
                candidate={activeCandidate}
                onClick={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CandidateSidePanel
        isOpen={!!selectedApp}
        onClose={() => { setSelectedApp(null); setSelectedCandidate(null); }}
        candidate={selectedCandidate}
        application={selectedApp}
        onStageChange={handleManualStageChange}
      />
    </div>
  );
}
