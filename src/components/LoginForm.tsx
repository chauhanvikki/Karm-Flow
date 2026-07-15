import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../lib/schema';
import type { LoginFormData } from '../lib/schema';
import { FloatingInput } from './FloatingInput';

export type UserRole = 'candidate' | 'recruiter';

interface LoginFormProps {
  role: UserRole;
}

export function LoginForm({ role }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const payload = { ...data, role };
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Store token and role
      localStorage.setItem('karmflow_token', result.token);
      localStorage.setItem('karmflow_role', role);
      if (result.user) {
        localStorage.setItem('karmflow_user', JSON.stringify(result.user));
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (role === 'recruiter') {
          navigate('/recruiter-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message); // Simple error display for now
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-2">
      <FloatingInput
        label="Email address"
        type="email"
        registration={register('email')}
        error={errors.email?.message}
        autoComplete="email"
      />
      
      <div className="relative">
        <FloatingInput
          label="Password"
          type="password"
          registration={register('password')}
          error={errors.password?.message}
          autoComplete="current-password"
        />
        <div className="absolute right-0 -bottom-6">
          <a href="#" className="text-xs font-medium text-brand-accent hover:text-brand-accent/80 transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="mt-8 w-full h-[52px] bg-brand-dark text-white rounded-full font-medium text-[15px] transition-all hover:bg-[#1A1A1A] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center overflow-hidden relative"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isSuccess ? (
          <span className="animate-in zoom-in duration-200">Welcome back</span>
        ) : (
          <span>Log in as {role === 'candidate' ? 'Candidate' : 'Recruiter'}</span>
        )}
      </button>
    </form>
  );
}
