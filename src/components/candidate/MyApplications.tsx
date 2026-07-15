import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import ApplicationRow from './ApplicationRow';
import type { Application, Job } from '../../lib/mockData';

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('karmflow_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${apiBase}/applications/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Backend returns populated jobId. We need to map it correctly for the existing UI
          const apps = data.map((a: any) => ({
            ...a,
            id: a._id || a.id,
            jobId: a.jobId._id || a.jobId.id,
            appliedAt: a.createdAt || new Date().toISOString(),
          }));

          const jobsMap = data.reduce((acc: Record<string, Job>, a: any) => {
            const job = a.jobId;
            if (job) {
              acc[job._id || job.id] = { ...job, id: job._id || job.id };
            }
            return acc;
          }, {});

          // Sort by most recent stage update (stageHistory)
          const sortedApps = apps.sort((a: any, b: any) => {
            const dateA = new Date(a.stageHistory?.[a.stageHistory.length - 1]?.movedAt || a.createdAt || Date.now()).getTime();
            const dateB = new Date(b.stageHistory?.[b.stageHistory.length - 1]?.movedAt || b.createdAt || Date.now()).getTime();
            return dateB - dateA;
          });

          // Map stageHistory to timeline for UI compatibility if needed
          sortedApps.forEach((app: any) => {
            app.timeline = app.stageHistory?.map((sh: any) => ({
              stage: sh.stage,
              date: sh.movedAt || app.createdAt || new Date().toISOString()
            })) || [{ stage: app.stage, date: app.createdAt || new Date().toISOString() }];
          });

          setApplications(sortedApps);
          setJobs(jobsMap);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2">My Applications</h2>
        <p className="text-[#888888] text-[16px]">Track your progress and upcoming interviews.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-[#111111] border border-[#222222] rounded-[16px] p-6 h-[120px] animate-pulse">
              <div className="w-1/3 h-6 bg-[#222222] rounded mb-3" />
              <div className="w-1/4 h-4 bg-[#222222] rounded" />
            </div>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app, index) => (
            <ApplicationRow
              key={app.id}
              index={index}
              application={app}
              job={jobs[app.jobId]}
              isExpanded={expandedId === app.id}
              onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
            />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-[#111111] border border-[#222222] rounded-[16px]"
        >
          <Briefcase className="w-12 h-12 text-[#444444] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">No applications yet</h3>
          <p className="text-[#888888] mb-6">You haven't applied to any open roles.</p>
          <Link
            to="/dashboard"
            className="inline-flex h-12 px-6 items-center justify-center rounded-full font-medium text-[14px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] transition-colors"
          >
            Browse Open Jobs
          </Link>
        </motion.div>
      )}
    </div>
  );
}
