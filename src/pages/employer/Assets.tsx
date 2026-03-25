import { Laptop, Smartphone, Monitor, HardDrive } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Assets() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Asset Management</h1>
          <p className="text-slate-500 font-medium">Track and manage company equipment assigned to employees.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Assets', value: '450', icon: HardDrive, color: 'bg-slate-500' },
            { label: 'Laptops', value: '210', icon: Laptop, color: 'bg-blue-500' },
            { label: 'Monitors', value: '180', icon: Monitor, color: 'bg-indigo-500' },
            { label: 'Mobile Devices', value: '60', icon: Smartphone, color: 'bg-emerald-500' },
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
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Assigned Assets</h2>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Assign Asset
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Asset ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Assigned</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-slate-900">AST-{1000 + i}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{i % 2 === 0 ? 'MacBook Pro' : 'Dell XPS'}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">Employee {i}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">Oct {10 + i}, 2025</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-600">
                        In Use
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
