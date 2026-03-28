import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import PayrollTabs from '../../../components/PayrollTabs';
import { 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Search,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  FileDown
} from 'lucide-react';

export default function ManageEmployeeSalary() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const basePath = isSuperAdminPath ? '/super-admin/employer' : '/employer';

  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState(10);

  const employeeSalaryData = [
    { sl: 1, name: 'Honorato Imogene Curry Terry', month: '2024-04', total: '550.00' },
    { sl: 2, name: 'Maisha Lucy Zamora Gonzales', month: '2024-04', total: '-2,020.00' },
    { sl: 3, name: 'Amy Aphrodite Zamora Peck', month: '2024-04', total: '4,000.00' },
    { sl: 4, name: 'Honorato Imogene Curry Terry', month: '2024-05', total: '8,440.00' },
    { sl: 5, name: 'Maisha Lucy Zamora Gonzales', month: '2024-05', total: '41,000.00' },
  ];

  const handleViewPayslip = (id: string) => {
    navigate(`${basePath}/payroll/payslip/${id}`);
  };

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <PayrollTabs isSuperAdmin={isSuperAdminPath} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Employee salary</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Show</span>
            <select 
              value={entries}
              onChange={(e) => setEntries(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-all shadow-sm">
              <Copy size={14} />
              Copy
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm">
              <FileSpreadsheet size={14} />
              CSV
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm">
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all shadow-sm">
              <FileText size={14} />
              PDF
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm">
              <Printer size={14} />
              Print
            </button>
          </div>

          <div className="relative w-full lg:w-72">
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16 text-center">SI</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    Employee name
                    <div className="flex flex-col -space-y-1 opacity-30">
                      <ChevronUp size={10} />
                      <ChevronDown size={10} />
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    Salary month
                    <div className="flex flex-col -space-y-1 opacity-30">
                      <ChevronUp size={10} />
                      <ChevronDown size={10} />
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    Total salary
                    <div className="flex flex-col -space-y-1 opacity-30">
                      <ChevronUp size={10} />
                      <ChevronDown size={10} />
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employeeSalaryData.map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium text-center">{row.sl}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{row.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{row.month}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-800">৳ {row.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewPayslip(String(row.sl))}
                        className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 transition-all shadow-sm active:scale-95"
                      >
                        <Eye size={12} />
                        Payslip
                      </button>
                      <button 
                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                      >
                        <FileDown size={12} />
                        Download pay slip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium">Showing 1 to {employeeSalaryData.length} of {employeeSalaryData.length} entries</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 bg-blue-600 border border-blue-600 rounded-lg text-xs font-bold text-white">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Next</button>
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
