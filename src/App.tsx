import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import IntroSequence from './components/IntroSequence';
import AuthLayout from './components/AuthLayout';
import CandidateLayout from './components/candidate/CandidateLayout';
import JobListings from './components/candidate/JobListings';
import JobDetail from './components/candidate/JobDetail';
import MyApplications from './components/candidate/MyApplications';
import Profile from './components/candidate/Profile';
import RecruiterLayout from './components/recruiter/RecruiterLayout';
import Overview from './components/recruiter/Overview';
import JobsList from './components/recruiter/JobsList';
import PipelineBoard from './components/recruiter/PipelineBoard';
import CandidateDirectory from './components/recruiter/CandidateDirectory';
import TeamSettings from './components/recruiter/TeamSettings';

function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('karmflow_intro_seen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!hasSeenIntro && !prefersReducedMotion) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('karmflow_intro_seen', 'true');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroSequence key="intro" onComplete={handleIntroComplete} />
        ) : (
          <motion.div
            key="auth-or-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="min-h-screen"
          >
            <Routes>
              {/* Auth Route */}
              <Route path="/" element={<AuthLayout />} />
              
              {/* Candidate Dashboard Routes */}
              <Route path="/dashboard" element={<CandidateLayout />}>
                <Route index element={<JobListings />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Recruiter Dashboard Routes */}
              <Route path="/recruiter-dashboard" element={<RecruiterLayout />}>
                <Route index element={<Overview />} />
                <Route path="jobs" element={<JobsList />} />
                <Route path="pipeline" element={<PipelineBoard />} />
                <Route path="candidates" element={<CandidateDirectory />} />
                <Route path="team" element={<TeamSettings />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
