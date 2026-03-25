import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function EmployerDashboard() {
  const stats = [
    { label: 'Total Employees', value: '1,248', icon: Users, color: 'bg-blue-500' },
    { label: 'Avg. Attendance', value: '94%', icon: Clock, color: 'bg-emerald-500' },
    { label: 'Pending Leaves', value: '24', icon: Calendar, color: 'bg-amber-500' },
    { label: 'Monthly Payroll', value: '$452k', icon: DollarSign, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Employer Dashboard</h1>
          <p className="text-slate-500 font-medium">Overview of employer metrics and activities.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Recent Activities</h2>
              <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <ActivityIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Payroll processed for March 2026</p>
                    <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Pending Approvals</h2>
              <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Leave Request - John Doe</p>
                      <p className="text-xs text-slate-500 mt-1">Sick Leave • 2 Days</p>
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
        </div>
      </main>
    </div>
  );
}

function ActivityIcon() {
  return <TrendingUp size={18} />;
}
