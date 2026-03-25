import { Clock } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function TimeTrack() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Time Tracking</h1>
          <p className="text-slate-500 font-medium">Monitor and manage employee time logs.</p>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Active Timers</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Employee {i}</p>
                    <p className="text-xs text-slate-500 mt-1">Working on: Project Alpha</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-mono font-bold text-slate-700">02:45:12</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
