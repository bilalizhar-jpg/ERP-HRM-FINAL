import { Briefcase, Users, UserPlus } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Recruitment() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Recruitment</h1>
          <p className="text-slate-500 font-medium">Manage job postings and applicant tracking.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Open Positions', value: '4', icon: Briefcase, color: 'bg-blue-500' },
            { label: 'Total Applicants', value: '142', icon: Users, color: 'bg-indigo-500' },
            { label: 'Interviews Scheduled', value: '8', icon: UserPlus, color: 'bg-emerald-500' },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Active Job Postings</h2>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Post New Job
            </button>
          </div>
          <div className="space-y-4">
            {['Software Engineer', 'Marketing Manager', 'Sales Representative'].map((job, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{job}</p>
                    <p className="text-xs text-slate-500 mt-1">Full-time • Remote</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-black text-slate-900">{24 + i * 12}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicants</p>
                  </div>
                  <button className="text-blue-600 text-xs font-bold hover:underline">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
