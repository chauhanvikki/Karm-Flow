import { useState, useEffect } from 'react';
import { Search, FilterX } from 'lucide-react';
import { motion } from 'framer-motion';
import JobCard from './JobCard';
import type { Job } from '../../lib/mockData'; // we can keep types from mockData for now, or define them locally

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('karmflow_token');
        
        // Fetch open jobs
        const jobsRes = await fetch('http://localhost:3000/api/jobs');
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          // Transform backend _id to id if necessary, or just use _id
          const mappedJobs = data.map((j: any) => ({ ...j, id: j._id || j.id }));
          setJobs(mappedJobs);
        }

        // Fetch user's applications to see what they applied for
        if (token) {
          const appsRes = await fetch('http://localhost:3000/api/applications/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (appsRes.ok) {
            const apps = await appsRes.json();
            const ids = apps.map((a: any) => typeof a.jobId === 'object' ? a.jobId._id : a.jobId);
            setAppliedJobIds(new Set(ids));
          }
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    job.department.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2">Open Positions</h2>
        <p className="text-[#888888] text-[16px]">Find your next role and build your career.</p>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] w-5 h-5" />
        <input
          type="text"
          placeholder="Search by role or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111111] border border-[#222222] rounded-xl pl-12 pr-4 py-3.5 text-[#FAFAFA] placeholder:text-[#666666] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 h-[260px] animate-pulse">
              <div className="w-2/3 h-6 bg-[#222222] rounded mb-2" />
              <div className="w-1/3 h-4 bg-[#222222] rounded mb-6" />
              <div className="flex gap-2 mb-6">
                <div className="w-20 h-4 bg-[#222222] rounded" />
                <div className="w-16 h-4 bg-[#222222] rounded" />
              </div>
              <div className="w-full h-16 bg-[#222222] rounded mb-4" />
              <div className="w-full h-10 bg-[#222222] rounded mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job, index) => (
            <JobCard 
              key={job.id} 
              job={job} 
              index={index}
              hasApplied={appliedJobIds.has(job.id)} 
            />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-[#111111] border border-[#222222] rounded-[12px]"
        >
          <FilterX className="w-12 h-12 text-[#444444] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">No jobs found</h3>
          <p className="text-[#888888] mb-6">We couldn't find any roles matching your search.</p>
          <button
            onClick={() => setSearch('')}
            className="text-brand-accent hover:text-brand-accent/80 font-medium"
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
