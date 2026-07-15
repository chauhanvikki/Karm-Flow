import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, MoreHorizontal, Edit2, Archive, Users, ExternalLink } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import type { Job } from '../../lib/mockData';
import JobForm from './JobForm';
import type { JobFormData } from './JobForm';
import { useToast } from '../candidate/ToastProvider';

export default function JobsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isFormOpen = searchParams.get('new') === 'true' || searchParams.has('edit');
  const editJobId = searchParams.get('edit');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Draft' | 'Closed'>('All');
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('karmflow_token');
        const res = await fetch('http://localhost:3000/api/jobs?mine=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data.map((j: any) => ({ ...j, id: j._id || j.id, type: j.employmentType, status: j.status.charAt(0).toUpperCase() + j.status.slice(1) })));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  const handleCloseForm = () => {
    navigate('/recruiter-dashboard/jobs', { replace: true });
  };

  const handleSaveJob = async (data: JobFormData) => {
    try {
      const token = localStorage.getItem('karmflow_token');
      const payload = {
        ...data,
        employmentType: data.type,
        status: data.status.toLowerCase(),
        requirements: data.requirements.split('\n').map(r => r.trim()).filter(Boolean),
      };

      if (editJobId) {
        const res = await fetch(`http://localhost:3000/api/jobs/${editJobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setJobs(jobs.map(j => j.id === editJobId ? { ...j, ...data, requirements: data.requirements.split('\n') } : j));
          addToast('Job updated successfully');
        } else {
          addToast('Failed to update job');
        }
      } else {
        const res = await fetch('http://localhost:3000/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newJob = await res.json();
          setJobs([{ ...newJob, id: newJob._id, type: newJob.employmentType, status: newJob.status.charAt(0).toUpperCase() + newJob.status.slice(1) }, ...jobs]);
          addToast('New job posted successfully');
        } else {
          addToast('Failed to post job');
        }
      }
    } catch (err) {
      console.error('Error saving job:', err);
      addToast('An error occurred');
    }
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to close this job? Candidates will no longer be able to apply.')) {
      try {
        const token = localStorage.getItem('karmflow_token');
        const res = await fetch(`http://localhost:3000/api/jobs/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status: 'closed' })
        });
        if (res.ok) {
          setJobs(jobs.map(j => j.id === id ? { ...j, status: 'Closed' } : j));
          addToast('Job closed');
        } else {
          addToast('Failed to close job');
        }
      } catch (err) {
        addToast('Error closing job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const editingJob = jobs.find(j => j.id === editJobId) || null;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-[calc(100vh-64px)] md:h-screen flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2 tracking-tight">Jobs</h2>
          <p className="text-[#888888] text-[16px]">Manage your open roles and job drafts.</p>
        </div>
        <button
          onClick={() => navigate('/recruiter-dashboard/jobs?new=true')}
          className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-full font-medium text-[14px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Job
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] w-4 h-4" />
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#222222] rounded-full pl-10 pr-4 py-2 text-[#FAFAFA] text-sm focus:outline-none focus:border-brand-accent transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Open', 'Draft', 'Closed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as any)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                statusFilter === filter
                  ? "bg-[#1A1A1A] text-[#FAFAFA] border border-[#333333]"
                  : "text-[#888888] hover:text-[#FAFAFA] border border-transparent"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#111111] z-10 border-b border-[#222222]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">Role</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">Status</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">Applicants</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">Posted Date</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, i) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-[#151515] transition-colors cursor-pointer group"
                    onClick={() => navigate(`/recruiter-dashboard/pipeline?job=${job.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#FAFAFA] mb-0.5 group-hover:text-brand-accent transition-colors">{job.title}</p>
                      <p className="text-[13px] text-[#888888]">{job.department} • {job.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border",
                        job.status === 'Open' ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20" :
                        job.status === 'Draft' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                        "bg-[#222222] text-[#888888] border-[#333333]"
                      )}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[#FAFAFA] font-medium">
                        <Users className="w-4 h-4 text-[#888888]" />
                        {job.applicantCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#888888] text-[14px]">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/recruiter-dashboard/jobs?edit=${job.id}`); }}
                          className="p-2 text-[#888888] hover:text-[#FAFAFA] rounded-md hover:bg-[#222222] transition-colors"
                          title="Edit Job"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {job.status !== 'Closed' && (
                          <button
                            onClick={(e) => handleArchive(job.id, e)}
                            className="p-2 text-[#888888] hover:text-red-400 rounded-md hover:bg-[#222222] transition-colors"
                            title="Close Job"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/dashboard/jobs/${job.id}`}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          className="p-2 text-[#888888] hover:text-[#FAFAFA] rounded-md hover:bg-[#222222] transition-colors"
                          title="View on Candidate Portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#888888]">
                    No jobs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <JobForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        onSave={handleSaveJob} 
        job={editingJob} 
      />
    </div>
  );
}
