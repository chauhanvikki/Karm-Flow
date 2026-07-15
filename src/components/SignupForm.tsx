import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { signupSchema } from '../lib/schema';
import type { SignupFormData } from '../lib/schema';
import { FloatingInput } from './FloatingInput';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from './LoginForm';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupFormProps {
  role: UserRole;
}

export function SignupForm({ role }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const payload = { ...data, role };
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }

      // Store token and role
      localStorage.setItem('karmflow_token', result.token);
      localStorage.setItem('karmflow_role', role);
      if (result.user) {
        localStorage.setItem('karmflow_user', JSON.stringify(result.user));
      }

      setIsSuccess(true);
      // Simulate redirect
      setTimeout(() => {
        setIsSuccess(false);
        if (role === 'recruiter') {
          navigate('/recruiter-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error.message); // Simple error display for now
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-2">
      <FloatingInput
        label="Full name"
        type="text"
        registration={register('name')}
        error={errors.name?.message}
        autoComplete="name"
      />
      
      <AnimatePresence mode="popLayout">
        {role === 'recruiter' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <FloatingInput
              label="Company name"
              type="text"
              registration={register('companyName')}
              error={errors.companyName?.message}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <FloatingInput
        label="Email address"
        type="email"
        registration={register('email')}
        error={errors.email?.message}
        autoComplete="email"
      />
      
      <FloatingInput
        label="Create a password"
        type="password"
        registration={register('password')}
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="mt-6 w-full h-[52px] bg-brand-dark text-white rounded-full font-medium text-[15px] transition-all hover:bg-[#1A1A1A] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center overflow-hidden relative"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isSuccess ? (
          <span className="animate-in zoom-in duration-200">Account created</span>
        ) : (
          <span>Create {role === 'recruiter' ? 'Employer' : 'Candidate'} account</span>
        )}
      </button>
    </form>
  );
}
