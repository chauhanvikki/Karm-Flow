import { Users, UserPlus, Settings, Shield } from 'lucide-react';

export default function TeamSettings() {
  const team = [
    { id: 1, name: 'Vikki Singh', email: 'vikki@karmflow.com', role: 'Admin' },
    { id: 2, name: 'Sarah Connor', email: 'sarah@karmflow.com', role: 'Recruiter' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2 tracking-tight">Team Settings</h2>
          <p className="text-[#888888] text-[16px]">Manage who has access to your ATS workspace.</p>
        </div>
        <button
          className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-full font-medium text-[14px] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-[#EAEAEA] transition-colors active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden mb-8">
        <div className="p-6 border-b border-[#222222] flex items-center gap-3">
          <Users className="w-5 h-5 text-[#FAFAFA]" />
          <h3 className="text-lg font-semibold text-[#FAFAFA]">Team Members</h3>
        </div>
        <div className="divide-y divide-[#222222]">
          {team.map(member => (
            <div key={member.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#FAFAFA]">{member.name}</p>
                <p className="text-[#888888] text-[14px]">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border border-[#333333] rounded-full text-[12px] text-[#FAFAFA] font-medium">
                  {member.role === 'Admin' && <Shield className="w-3.5 h-3.5 text-brand-accent" />}
                  {member.role}
                </span>
                <button className="p-2 text-[#888888] hover:text-[#FAFAFA] transition-colors rounded-md hover:bg-[#222222]">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
