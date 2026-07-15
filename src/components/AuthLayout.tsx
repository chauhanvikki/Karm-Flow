import AuthCard from './AuthCard';

export default function AuthLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#FAFAFA]">
      {/* Left Panel - Hero */}
      <div className="relative w-full lg:w-[60%] h-[30vh] lg:h-screen lg:sticky lg:top-0 bg-[#0A0A0A] overflow-hidden flex flex-col justify-between p-6 lg:p-12 z-10">
        
        {/* Animated Background SVG elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-accent rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDuration: '12s', animationDelay: '1s' }} />
        </div>

        {/* Brand Header */}
        <div className="z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-white text-lg leading-none">K</span>
          </div>
          <span className="font-display font-semibold text-xl text-brand-light tracking-tight">KarmFlow</span>
        </div>

        {/* Hero Copy (Desktop only or scaled down on mobile) */}
        <div className="z-10 mt-auto hidden lg:block max-w-lg">
          <h2 className="font-display text-4xl lg:text-6xl font-semibold text-white leading-[1.1] mb-6">
            Your Karm.<br />
            <span className="text-[#888888]">Your Career.</span>
          </h2>
          <p className="text-[#A0A0A0] text-lg lg:text-xl font-medium leading-relaxed max-w-md">
            The intelligent applicant tracking system that respects your journey and empowers your next move.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth */}
      <div className="w-full lg:w-[40%] flex-1 flex flex-col items-center justify-center px-4 py-8 lg:p-12 relative z-20 -mt-6 lg:mt-0 bg-[#FAFAFA] rounded-t-3xl lg:rounded-none shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-none min-h-screen">
        <div className="w-full max-w-[420px] my-auto">
          <AuthCard />
        </div>
      </div>
    </div>
  );
}
