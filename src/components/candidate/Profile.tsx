import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './ToastProvider';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional().or(z.literal('')),
  skills: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { addToast } = useToast();
  
  const savedUserStr = localStorage.getItem('karmflow_user');
  const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: savedUser?.name || '',
      email: savedUser?.email || '',
      phone: savedUser?.phone || '',
      skills: savedUser?.skills || ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const token = localStorage.getItem('karmflow_token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update profile');
      
      localStorage.setItem('karmflow_user', JSON.stringify(result.user));
      addToast('Profile saved successfully');
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Error saving profile');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2">My Profile</h2>
        <p className="text-[#888888] text-[16px]">Manage your personal information and skills.</p>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-[16px] p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Full Name</label>
              <input
                {...register('name')}
                type="text"
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#888888] focus:outline-none cursor-not-allowed"
                readOnly
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Phone Number</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="e.g. 1234567890"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#FAFAFA] mb-2">Skills (comma separated)</label>
            <input
              {...register('skills')}
              type="text"
              placeholder="e.g. Design, React, Copywriting"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-[#FAFAFA] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
            />
            <p className="text-xs text-[#666666] mt-2">These act as tags to help recruiters match you to roles.</p>
          </div>

          <div className="pt-4 border-t border-[#222222]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 h-12 rounded-full font-semibold text-[15px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
