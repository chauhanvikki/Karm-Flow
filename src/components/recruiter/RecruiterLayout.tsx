import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Kanban, Users, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { ToastProvider } from '../candidate/ToastProvider';

export default function RecruiterLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem('karmflow_role');

  if (role !== 'recruiter' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('karmflow_token');
    localStorage.removeItem('karmflow_role');
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/recruiter-dashboard', icon: LayoutDashboard, end: true },
    { label: 'Jobs', path: '/recruiter-dashboard/jobs', icon: Briefcase },
    { label: 'Pipeline', path: '/recruiter-dashboard/pipeline', icon: Kanban },
    { label: 'Candidates', path: '/recruiter-dashboard/candidates', icon: Users },
    { label: 'Team', path: '/recruiter-dashboard/team', icon: Settings },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#222222] bg-[#0A0A0A] flex flex-col md:h-screen md:sticky md:top-0 z-40">
          <div className="p-6">
            <h1 className="text-xl font-display font-bold tracking-tight">KarmFlow</h1>
            <p className="text-[#888888] text-sm mt-1">Recruiter Space</p>
          </div>

          <nav className="flex-1 px-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[15px] transition-all whitespace-nowrap",
                    isActive
                      ? "bg-[#1A1A1A] text-[#FAFAFA]"
                      : "text-[#888888] hover:text-[#FAFAFA] hover:bg-[#111111]"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 hidden md:block border-t border-[#222222]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[15px] text-[#888888] hover:text-red-400 hover:bg-[#111111] transition-all w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-[#0A0A0A]">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
