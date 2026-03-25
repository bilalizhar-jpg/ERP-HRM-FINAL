import { TrendingUp, Star, Award, Target } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Performance() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Performance</h1>
          <p className="text-slate-500 font-medium">Evaluate and track employee performance metrics.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Top Performers', value: '12', icon: Star, color: 'bg-amber-500' },
            { label: 'Goals Met', value: '85%', icon: Target, color: 'bg-emerald-500' },
            { label: 'Reviews Pending', value: '5', icon: TrendingUp, color: 'bg-blue-500' },
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
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Recent Reviews</h2>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              New Review
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Employee {i}</p>
                    <p className="text-xs text-slate-500 mt-1">Q1 Performance Review</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className={star <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                  ))}
                  <span className="ml-2 text-sm font-bold text-slate-900">4.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
