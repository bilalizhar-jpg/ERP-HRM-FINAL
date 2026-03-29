import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import PayrollTabs from '../../../components/PayrollTabs';
import { 
  Calendar as CalendarIcon,
  Check,
  List,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function SalaryGenerate() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const basePath = isSuperAdminPath ? '/super-admin/employer' : '/company-admin';

  const [salaryMonth, setSalaryMonth] = useState('2026-03');

  const salaryListData = [
    { sl: 1, name: '2049-01', date: '2026-03-12', by: 'Admin', status: 'Approved', approvedDate: '2026-03-12', approvedBy: 'Admin' },
    { sl: 2, name: '2050-02', date: '2026-02-12', by: 'Admin', status: 'Approved', approvedDate: '2026-02-15', approvedBy: 'Admin' },
    { sl: 3, name: '2039-06', date: '2026-01-29', by: 'Admin', status: 'Approved', approvedDate: '2026-02-02', approvedBy: 'Admin' },
    { sl: 4, name: '2032-02', date: '2026-01-28', by: 'Admin', status: 'Approved', approvedDate: '2026-01-28', approvedBy: 'Admin' },
    { sl: 5, name: '2028-07', date: '2026-01-22', by: 'Admin', status: 'Approved', approvedDate: '2026-01-22', approvedBy: 'Admin' },
    { sl: 6, name: '2028-10', date: '2026-01-22', by: 'Admin', status: 'Approved', approvedDate: '2026-01-22', approvedBy: 'Admin' },
    { sl: 7, name: '1234-12', date: '2025-12-29', by: 'Admin', status: 'Approved', approvedDate: '2026-01-19', approvedBy: 'Admin' },
    { sl: 8, name: '8888-12', date: '2025-12-24', by: 'Admin', status: 'Approved', approvedDate: '2025-12-24', approvedBy: 'Admin' },
    { sl: 9, name: '2020-12', date: '2025-10-31', by: 'Admin', status: 'Approved', approvedDate: '2025-11-03', approvedBy: 'Admin' },
    { sl: 10, name: '6555-12', date: '2025-10-21', by: 'Admin', status: 'Approved', approvedDate: '2025-10-21', approvedBy: 'Admin' },
    { sl: 11, name: '2026-10', date: '2025-10-10', by: 'Admin', status: 'Approved', approvedDate: '2025-10-10', approvedBy: 'Admin' },
  ];

  const handlePostingSheet = (id: string) => {
    navigate(`${basePath}/payroll/posting-sheet/${id}`);
  };

  const handleSalaryChart = (id: string) => {
    navigate(`${basePath}/payroll/salary-chart/${id}`);
  };

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <PayrollTabs isSuperAdmin={isSuperAdminPath} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Select Salary Month Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Select salary month</h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-700 whitespace-nowrap">
                  Salary month <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex-1">
                  <input 
                    type="month" 
                    value={salaryMonth}
                    onChange={(e) => setSalaryMonth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Salary List Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Salary list</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 w-12">SI</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        Salary name
                        <div className="flex flex-col -space-y-1 opacity-30">
                          <ChevronUp size={10} />
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        Generate date
                        <div className="flex flex-col -space-y-1 opacity-30">
                          <ChevronUp size={10} />
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        Generate by
                        <div className="flex flex-col -space-y-1 opacity-30">
                          <ChevronUp size={10} />
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        Status
                        <div className="flex flex-col -space-y-1 opacity-30">
                          <ChevronUp size={10} />
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        Approved date
                        <div className="flex flex-col -space-y-1 opacity-30">
                          <ChevronUp size={10} />
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        Approved by
                        <div className="flex flex-col -space-y-1 opacity-30">
                          <ChevronUp size={10} />
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaryListData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-4 py-4 text-sm text-slate-600">{row.sl}</td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">{row.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{row.date}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{row.by}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{row.approvedDate}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{row.approvedBy}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handlePostingSheet(row.name)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-100 transition-colors shadow-sm"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => handleSalaryChart(row.name)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-100 transition-colors shadow-sm"
                          >
                            <List size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={isSuperAdminPath ? "min-h-screen bg-[#f8f9fa] flex" : ""}>
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className={isSuperAdminPath ? "flex-1 p-8 lg:p-12 overflow-y-auto" : "p-6"}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
