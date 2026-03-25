import { DollarSign, Receipt, CheckCircle } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Expenses() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Expense Management</h1>
          <p className="text-slate-500 font-medium">Review and approve employee expense claims.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Pending Claims', value: '12', icon: Receipt, color: 'bg-amber-500' },
            { label: 'Approved This Month', value: '$4,250', icon: CheckCircle, color: 'bg-emerald-500' },
            { label: 'Total Expenses YTD', value: '$32,400', icon: DollarSign, color: 'bg-blue-500' },
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
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Pending Expense Claims</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Employee {i}</p>
                    <p className="text-xs text-slate-500 mt-1">Travel & Accommodation • Oct {10 + i}, 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-black text-slate-900">${150 * i}.00</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">Approve</button>
                    <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
