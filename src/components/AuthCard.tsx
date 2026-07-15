import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import type { UserRole } from './LoginForm';
import clsx from 'clsx';
import { Briefcase, UserRound } from 'lucide-react';

type AuthMode = 'login' | 'signup';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function AuthCard() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('candidate');

  return (
    <div className="w-full">
      {/* Role Toggle */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setRole('candidate')}
          className={clsx(
            "flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
            role === 'candidate'
              ? "border-brand-accent bg-brand-accent/5 text-brand-dark"
              : "border-[#EAEAEA] bg-white text-[#888888] hover:border-[#CCCCCC]"
          )}
        >
          <UserRound className="mb-2" size={24} />
          <span className="font-medium text-sm">I'm a Candidate</span>
        </button>
        <button
          onClick={() => setRole('recruiter')}
          className={clsx(
            "flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
            role === 'recruiter'
              ? "border-brand-accent bg-brand-accent/5 text-brand-dark"
              : "border-[#EAEAEA] bg-white text-[#888888] hover:border-[#CCCCCC]"
          )}
        >
          <Briefcase className="mb-2" size={24} />
          <span className="font-medium text-sm">I'm a Recruiter</span>
        </button>
      </div>

      <div className="mb-6 text-center lg:text-left">
        <h2 className="text-2xl font-semibold text-brand-dark mb-2">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-[#666666]">
          {role === 'recruiter'
            ? mode === 'login'
              ? 'Enter your details to manage your job posts.'
              : 'Start finding the best candidates today.'
            : mode === 'login'
            ? 'Enter your details to access your account.'
            : 'Start tracking your career journey today.'}
        </p>
      </div>

      {/* Segmented Control for Login/Signup */}
      <div className="relative flex p-1 mb-8 bg-[#F0F0F0] rounded-lg">
        <div 
          className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-200 ease-out"
          style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
        />
        <button
          type="button"
          onClick={() => setMode('login')}
          className={clsx(
            "relative z-10 flex-1 py-2 text-sm font-medium transition-colors rounded-md",
            mode === 'login' ? 'text-brand-dark' : 'text-[#888888] hover:text-brand-dark'
          )}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={clsx(
            "relative z-10 flex-1 py-2 text-sm font-medium transition-colors rounded-md",
            mode === 'signup' ? 'text-brand-dark' : 'text-[#888888] hover:text-brand-dark'
          )}
        >
          Sign up
        </button>
      </div>

      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${mode}-${role}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {mode === 'login' ? <LoginForm role={role} /> : <SignupForm role={role} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-[#EAEAEA]"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
            Or
          </span>
          <div className="flex-grow border-t border-[#EAEAEA]"></div>
        </div>

        <button
          type="button"
          className="w-full h-[52px] bg-white border border-[#EAEAEA] text-brand-dark rounded-full font-medium text-[15px] transition-all hover:bg-[#F9F9F9] hover:border-[#CCCCCC] active:scale-[0.98] flex items-center justify-center shadow-sm"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
