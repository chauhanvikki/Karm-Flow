import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Calendar } from 'lucide-react';
import ApplyModal from './ApplyModal';
import { MOCK_JOBS, MOCK_APPLICATIONS, delay } from '../../lib/mockData';
import type { Job } from '../../lib/mockData';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('karmflow_token');
        
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        // Fetch Job details
        const jobRes = await fetch(`${apiBase}/jobs/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (jobRes.ok) {
          const data = await jobRes.json();
          setJob({ ...data, id: data._id || data.id });
        } else {
          setJob(null);
        }

        // Fetch Applications to check if already applied
        if (token && jobRes.ok) {
          const appRes = await fetch(`${apiBase}/applications/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (appRes.ok) {
            const apps = await appRes.json();
            const applied = apps.some((a: any) => {
              const appJobId = typeof a.jobId === 'object' ? a.jobId._id : a.jobId;
              return appJobId === id;
            });
            setHasApplied(applied);
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-pulse">
        <div className="w-24 h-6 bg-[#222222] rounded mb-8" />
        <div className="w-2/3 h-10 bg-[#222222] rounded mb-4" />
        <div className="flex gap-4 mb-10">
          <div className="w-24 h-5 bg-[#222222] rounded" />
          <div className="w-24 h-5 bg-[#222222] rounded" />
        </div>
        <div className="space-y-4">
          <div className="w-full h-4 bg-[#222222] rounded" />
          <div className="w-full h-4 bg-[#222222] rounded" />
          <div className="w-5/6 h-4 bg-[#222222] rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-semibold text-[#FAFAFA] mb-2">Job Not Found</h2>
        <p className="text-[#888888] mb-6">The position you're looking for doesn't exist or has been closed.</p>
        <Link to="/dashboard" className="text-brand-accent hover:underline">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="p-6 md:p-10 max-w-4xl mx-auto pb-32 md:pb-10 md:pr-[320px]">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-[#888888] hover:text-[#FAFAFA] transition-colors mb-8 font-medium text-[14px]">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#FAFAFA] mb-6 tracking-tight">
          {job.title}
        </h1>

        <div className="flex flex-wrap gap-4 mb-10 border-b border-[#222222] pb-8">
          <div className="flex items-center gap-2 text-[#888888]">
            <MapPin className="w-5 h-5" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-[#888888]">
            <Briefcase className="w-5 h-5" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-2 text-[#888888]">
            <Calendar className="w-5 h-5" />
            <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">About the Role</h3>
          <p className="text-[#CCCCCC] leading-relaxed mb-8">{job.description}</p>

          <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Requirements</h3>
          <ul className="list-disc pl-5 space-y-2 text-[#CCCCCC] mb-8">
            {(job.requirements || []).map((req: string, i: number) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sticky Apply Panel */}
      <div className="fixed bottom-0 left-0 right-0 md:absolute md:top-10 md:right-10 md:left-auto md:bottom-auto md:w-[280px] bg-[#111111] md:bg-transparent border-t md:border-none border-[#222222] p-4 md:p-0 z-30">
        <div className="md:bg-[#111111] md:border md:border-[#222222] md:rounded-[16px] md:p-6 md:sticky md:top-[120px]">
          <div className="hidden md:block mb-6">
            <h4 className="font-semibold text-[#FAFAFA] mb-1">Interested?</h4>
            <p className="text-sm text-[#888888]">Submit your application to join the team.</p>
          </div>
          
          {hasApplied ? (
            <Link
              to="/dashboard/applications"
              className="flex justify-center items-center w-full h-14 rounded-full font-semibold text-[15px] bg-[#1A1A1A] text-[#FAFAFA] border border-[#333333] hover:bg-[#222222] transition-colors"
            >
              View Application Status
            </Link>
          ) : (
            <button
              onClick={() => setIsApplyOpen(true)}
              className="w-full h-14 rounded-full font-semibold text-[15px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] transition-colors active:scale-[0.98]"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      <ApplyModal 
        jobId={job.id} 
        jobTitle={job.title} 
        isOpen={isApplyOpen} 
        onClose={() => setIsApplyOpen(false)} 
      />
    </div>
  );
}
