import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import PayrollTabs from '../../../components/PayrollTabs';
import { 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  Edit2,
  Trash2,
  ChevronUp
} from 'lucide-react';

export default function CompanyPayroll() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [department, setDepartment] = useState('All');
  const [entries, setEntries] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');

  const payrollData = [
    { sl: 1, month: 'January 2026', department: 'Engineering', amount: '$45,000', status: 'Active', date: 'Jan 31, 2026' },
    { sl: 2, month: 'February 2026', department: 'Marketing', amount: '$28,000', status: 'Active', date: 'Feb 28, 2026' },
    { sl: 3, month: 'March 2026', department: 'Sales', amount: '$35,500', status: 'Inactive', date: '-' },
  ];

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <PayrollTabs isSuperAdmin={isSuperAdminPath} />
      </div>
      
      {/* Company Payroll Report Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Company Payroll Report</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">End Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Department</label>
              <div className="relative">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="All">All</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-black transition-all shadow-lg shadow-blue-500/20">
              <Search className="w-4 h-4" />
              Find
            </button>
          </div>
        </div>
      </div>

      {/* Payroll List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Payroll List</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
              <FileText className="w-3.5 h-3.5" />
              PDF
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Show</span>
              <select 
                value={entries}
                onChange={(e) => setEntries(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Search:</span>
              <div className="relative">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 w-16">SI</th>
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      Month
                      <div className="flex flex-col -space-y-1 opacity-30">
                        <ChevronUp size={10} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      Department
                      <div className="flex flex-col -space-y-1 opacity-30">
                        <ChevronUp size={10} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      Total Amount
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
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-600">{row.sl}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">{row.month}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{row.department}</td>
                    <td className="px-4 py-4 text-sm font-bold text-blue-600">{row.amount}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-100 transition-colors shadow-sm">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded border border-rose-100 transition-colors shadow-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Showing 1 to 3 of 3 entries</span>
            <div className="flex items-center gap-1">
              <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">Previous</button>
              <button className="w-10 h-10 flex items-center justify-center text-sm font-black bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">1</button>
              <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">Next</button>
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
