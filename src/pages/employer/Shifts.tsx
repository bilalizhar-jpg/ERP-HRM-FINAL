import { Clock, Plus } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Shifts() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Shift Management</h1>
          <p className="text-slate-500 font-medium">Create and assign work shifts to employees.</p>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Upcoming Shifts</h2>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              <Plus size={16} /> Add Shift
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Morning Shift</p>
                    <p className="text-xs text-slate-500 mt-1">09:00 AM - 05:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                        E{j}
                      </div>
                    ))}
                  </div>
                  <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
