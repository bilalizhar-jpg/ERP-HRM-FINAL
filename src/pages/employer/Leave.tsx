import { Calendar } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Leave() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Leave Management</h1>
          <p className="text-slate-500 font-medium">Review and manage employee leave requests.</p>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Pending Requests</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Employee {i}</p>
                    <p className="text-xs text-slate-500 mt-1">Annual Leave • Oct 12 - Oct 15</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">Approve</button>
                  <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
