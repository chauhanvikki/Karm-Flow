import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase } from 'lucide-react';
import type { Job } from '../../lib/mockData';

interface JobCardProps {
  job: Job;
  hasApplied: boolean;
  index: number;
}

export default function JobCard({ job, hasApplied, index }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
      className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 flex flex-col h-full hover:border-[#444444] transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[18px] font-semibold text-[#FAFAFA] mb-1">{job.title}</h3>
          <p className="text-[#888888] text-[14px]">{job.department}</p>
        </div>
        {hasApplied && (
          <span className="bg-brand-accent/10 text-brand-accent text-[12px] font-medium px-2.5 py-1 rounded-full border border-brand-accent/20">
            Applied
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-1.5 text-[#888888] text-[13px]">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5 text-[#888888] text-[13px]">
          <Briefcase className="w-4 h-4" />
          {job.type}
        </div>
      </div>

      <p className="text-[#CCCCCC] text-[14px] mb-6 flex-grow line-clamp-2">
        {job.summary}
      </p>

      <div className="mt-auto pt-4 border-t border-[#222222]">
        {hasApplied ? (
          <Link
            to="/dashboard/applications"
            className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-[14px] bg-[#1A1A1A] text-[#888888] hover:text-[#FAFAFA] transition-colors"
          >
            View Status
          </Link>
        ) : (
          <Link
            to={`/dashboard/jobs/${job.id}`}
            className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-[14px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] transition-colors"
          >
            View & Apply
          </Link>
        )}
      </div>
    </motion.div>
  );
}
