import { motion } from 'framer-motion';
import { Briefcase, Users, UserCheck, TrendingUp, TrendingDown, Clock, CheckCircle2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MOCK_JOBS, MOCK_RECRUITER_APPLICATIONS, MOCK_ACTIVITIES } from '../../lib/mockData';

export default function Overview() {
  const openJobs = MOCK_JOBS.filter(j => j.status === 'Open').length;
  const activeCandidates = MOCK_RECRUITER_APPLICATIONS.filter(a => !['Hired', 'Rejected'].includes(a.currentStage)).length;
  const interviewing = MOCK_RECRUITER_APPLICATIONS.filter(a => a.currentStage === 'Interview').length;
  const hired = MOCK_RECRUITER_APPLICATIONS.filter(a => a.currentStage === 'Hired').length;

  const stats = [
    { label: 'Open Jobs', value: openJobs, icon: Briefcase, trend: '+2', positive: true },
    { label: 'Active Candidates', value: activeCandidates, icon: Users, trend: '+12', positive: true },
    { label: 'In Interview', value: interviewing, icon: Clock, trend: '-1', positive: false },
    { label: 'Hires this month', value: hired, icon: UserCheck, trend: '+1', positive: true },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2 tracking-tight">Overview</h2>
          <p className="text-[#888888] text-[16px]">Here's what's happening with your pipeline today.</p>
        </div>
        <Link
          to="/recruiter-dashboard/jobs?new=true"
          className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-full font-medium text-[14px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-[#111111] border border-[#222222] rounded-[16px] p-5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#FAFAFA]">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-full ${
                stat.positive ? 'bg-brand-accent/10 text-brand-accent' : 'bg-[#222222] text-[#888888]'
              }`}>
                {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[28px] font-bold text-[#FAFAFA] leading-none mb-1">{stat.value}</p>
              <p className="text-[#888888] text-[13px]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[#FAFAFA] mb-6">Recent Activity</h3>
        <div className="bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden">
          {MOCK_ACTIVITIES.length > 0 ? (
            <div className="divide-y divide-[#222222]">
              {MOCK_ACTIVITIES.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="p-5 flex items-start gap-4 hover:bg-[#151515] transition-colors"
                >
                  <div className="mt-1">
                    {activity.type === 'stage_moved' ? (
                      <div className="w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : activity.type === 'new_application' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#222222] text-[#FAFAFA] flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-[#FAFAFA]">{activity.title}</p>
                    <p className="text-[#888888] text-[14px] mt-0.5">{activity.description}</p>
                  </div>
                  <div className="text-[12px] text-[#666666] whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-[#888888]">No recent activity yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
