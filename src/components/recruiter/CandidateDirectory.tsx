import { useState } from 'react';
import { Search, Mail, FileText, Download } from 'lucide-react';
import { MOCK_CANDIDATES } from '../../lib/mockData';

export default function CandidateDirectory() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'ats'>('name');
  const candidates = Object.values(MOCK_CANDIDATES);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (sortBy === 'ats') {
    filteredCandidates.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
  } else {
    filteredCandidates.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-[calc(100vh-64px)] md:h-screen flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-display font-bold text-[#FAFAFA] mb-2 tracking-tight">Candidates</h2>
          <p className="text-[#888888] text-[16px]">Directory of all candidates across all roles.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'ats')}
            className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-[#FAFAFA] text-sm font-medium focus:outline-none focus:border-brand-accent transition-all appearance-none"
          >
            <option value="name">Sort by Name</option>
            <option value="ats">Sort by ATS Match</option>
          </select>
          <button
            className="inline-flex h-10 px-5 items-center justify-center gap-2 rounded-full font-medium text-[14px] bg-[#1A1A1A] text-[#FAFAFA] border border-[#333333] hover:bg-[#222222] transition-colors active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-6 flex-shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#222222] rounded-full pl-10 pr-4 py-2 text-[#FAFAFA] text-sm focus:outline-none focus:border-brand-accent transition-all"
          />
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#111111] z-10 border-b border-[#222222]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">Candidate</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">ATS Match</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">Source</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888]">Tags</th>
                <th className="px-6 py-4 text-[13px] font-medium text-[#888888] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map(candidate => (
                  <tr key={candidate.id} className="hover:bg-[#151515] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs font-medium text-[#FAFAFA] border border-[#333333]">
                          {candidate.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-[#FAFAFA] mb-0.5">{candidate.name}</p>
                          <p className="text-[13px] text-[#888888]">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {candidate.atsScore ? (
                        <span className={`text-[11px] font-bold px-2 py-1 rounded ${
                          candidate.atsScore >= 70 ? 'bg-green-500/10 text-green-400' :
                          candidate.atsScore >= 40 ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {candidate.atsScore}% Match
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#666666] italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#FAFAFA]">{candidate.source}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {candidate.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1A1A1A] text-[#888888] border border-[#222222]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => window.location.href = `mailto:${candidate.email}`}
                          className="p-2 text-[#888888] hover:text-[#FAFAFA] transition-colors rounded-md hover:bg-[#222222]"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#888888] hover:text-[#FAFAFA] transition-colors rounded-md hover:bg-[#222222]">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#888888]">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
