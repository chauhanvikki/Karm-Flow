import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './ToastProvider';
import { useNavigate } from 'react-router-dom';

const applySchema = z.object({
  coverNote: z.string().max(500, 'Keep it under 500 characters').optional(),
});
type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyModal({ jobId, jobTitle, isOpen, onClose }: ApplyModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema)
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const simulateUpload = async (file: File) => {
    setFile(file);
    // In a real app we'd get progress from XHR, but here we'll just simulate the UI
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 20) {
      setUploadProgress(i);
      await new Promise(r => setTimeout(r, 150));
    }
    
    setIsUploading(false);
  };

  const onSubmit = async (data: ApplyFormData) => {
    if (!file) {
      addToast('Please upload a resume first.');
      return;
    }
    
    try {
      const token = localStorage.getItem('karmflow_token');
      if (!token) {
        addToast('Please log in to apply.');
        return;
      }

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobId', jobId);
      if (data.coverNote) {
        formData.append('coverNote', data.coverNote);
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type; let the browser set it to multipart/form-data with boundary
        },
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          addToast(result.message || 'You have already applied to this job.');
        } else {
          addToast(result.message || 'Failed to submit application.');
        }
        return;
      }

      addToast('Application submitted successfully!');
      onClose();
      navigate('/dashboard/applications');
    } catch (err) {
      console.error('Submit error:', err);
      addToast('Something went wrong. Please try again.');
    }
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
            initial={{ opacity: 0, y: '100%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 md:inset-0 md:m-auto md:max-w-xl md:h-fit bg-[#111111] border border-[#222222] md:rounded-[24px] rounded-t-[24px] z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#222222]">
              <div>
                <h2 className="text-xl font-semibold text-[#FAFAFA]">Apply for Role</h2>
                <p className="text-[#888888] text-sm mt-1">{jobTitle}</p>
              </div>
              <button onClick={onClose} className="p-2 text-[#888888] hover:text-[#FAFAFA] transition-colors rounded-full hover:bg-[#222222]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <label className="block text-[14px] font-medium text-[#FAFAFA] mb-3">Resume / CV *</label>
                
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative border-2 border-dashed border-[#333333] hover:border-brand-accent transition-colors rounded-xl p-8 text-center bg-[#151515]"
                >
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-full bg-[#222222] rounded-full h-2 mb-3 max-w-xs overflow-hidden">
                        <div 
                          className="bg-brand-accent h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-[#888888]">Uploading {file?.name}...</p>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center text-brand-accent">
                      <CheckCircle2 className="w-8 h-8 mb-3" />
                      <p className="font-medium text-[15px]">{file.name}</p>
                      <p className="text-sm text-[#888888] mt-1">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#222222] flex items-center justify-center mb-4 text-[#888888]">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="font-medium text-[#FAFAFA] text-[15px]">Click to upload or drag and drop</p>
                      <p className="text-[#888888] text-sm mt-1">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Cover Note (Optional)</label>
                <textarea
                  {...register('coverNote')}
                  rows={4}
                  placeholder="Why are you a great fit for this role?"
                  className="w-full bg-[#151515] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] placeholder:text-[#666666] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
                />
                {errors.coverNote && <p className="text-red-500 text-xs mt-1">{errors.coverNote.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full h-14 rounded-full font-semibold text-[15px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
