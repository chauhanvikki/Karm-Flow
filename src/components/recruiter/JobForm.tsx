import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Job } from '../../lib/mockData';

const jobSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  department: z.string().min(2, 'Department is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['Remote', 'Onsite', 'Hybrid']),
  summary: z.string().min(10, 'Summary is required'),
  description: z.string().min(50, 'Description needs to be more detailed'),
  requirements: z.string().min(10, 'List some requirements'),
  status: z.enum(['Draft', 'Open', 'Closed']),
});

export type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JobFormData) => void;
}

export default function JobForm({ job, isOpen, onClose, onSave }: JobFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      type: 'Remote',
      status: 'Draft',
    }
  });

  useEffect(() => {
    if (job) {
      reset({
        ...job,
        requirements: job.requirements.join('\n')
      });
    } else {
      reset({
        title: '',
        department: '',
        location: '',
        type: 'Remote',
        summary: '',
        description: '',
        requirements: '',
        status: 'Draft',
      });
    }
  }, [job, isOpen, reset]);

  const onSubmit = async (data: JobFormData) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // simulate api
    onSave(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-[#111111] border-l border-[#222222] z-50 flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#222222]">
              <h2 className="text-xl font-semibold text-[#FAFAFA]">{job ? 'Edit Job' : 'Post a Job'}</h2>
              <button onClick={onClose} className="p-2 text-[#888888] hover:text-[#FAFAFA] transition-colors rounded-full hover:bg-[#222222]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Job Title</label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Department</label>
                  <input
                    {...register('department')}
                    type="text"
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                  />
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Location</label>
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Employment Type</label>
                  <select
                    {...register('type')}
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3.5 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all appearance-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Short Summary</label>
                <input
                  {...register('summary')}
                  type="text"
                  placeholder="One-line pitch for the role..."
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
                {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary.message}</p>}
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Full Description</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Requirements (one per line)</label>
                <textarea
                  {...register('requirements')}
                  rows={4}
                  placeholder="- 5+ years experience..."
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
                />
                {errors.requirements && <p className="text-red-500 text-xs mt-1">{errors.requirements.message}</p>}
              </div>
              
              <div>
                <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3.5 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all appearance-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Open">Published (Open)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="mt-auto pt-6 border-t border-[#222222] flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-full font-semibold text-[15px] bg-[#1A1A1A] text-[#FAFAFA] border border-[#333333] hover:bg-[#222222] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-full font-semibold text-[15px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? 'Saving...' : 'Save Job'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
