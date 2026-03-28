import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import PayrollTabs from '../../../components/PayrollTabs';
import AddSalaryAdvanceModal from './AddSalaryAdvanceModal';
import EditSalaryAdvanceModal from './EditSalaryAdvanceModal';
import { 
  Plus,
  FileSpreadsheet, 
  FileText, 
  Search,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface AdvanceItem {
  sl: number;
  name: string;
  amount: string;
  release: string;
  month: string;
  status: string;
}

export default function SalaryAdvance() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState('10');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdvanceItem | null>(null);

  const advanceData: AdvanceItem[] = [
    { sl: 1, name: 'Honorato Imogene Curry Terry', amount: '122', release: '0', month: 'gdg', status: 'Active' },
    { sl: 2, name: 'Maisha Lucy Zamora Gonzales', amount: '101', release: '0', month: '2026-03', status: 'Active' },
    { sl: 3, name: 'Maisha Lucy Zamora Gonzales', amount: '200', release: '0', month: '2026-03', status: 'Active' },
    { sl: 4, name: 'Maisha Lucy Zamora Gonzales', amount: '222', release: '0', month: '2026-03', status: 'Inactive' },
    { sl: 5, name: 'Kristen Lillith Stout Rodriquez', amount: '50', release: '0', month: '2026-03', status: 'Active' },
    { sl: 6, name: 'Honorato Imogene Curry Terry', amount: '5000', release: '0', month: '2026-02', status: 'Active' },
    { sl: 7, name: 'Maisha Lucy Zamora Gonzales', amount: '100', release: '0', month: '2026-02', status: 'Active' },
    { sl: 8, name: 'Honorato Imogene Curry Terry', amount: '5000', release: '0', month: '2026-02', status: 'Active' },
    { sl: 9, name: 'Amy Aphrodite Zamora Peck', amount: '12000', release: '0', month: '2026-02', status: 'Active' },
    { sl: 10, name: 'Amy Aphrodite Zamora Peck', amount: '999999.99', release: '0', month: '2026-03', status: 'Active' },
  ];

  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <PayrollTabs isSuperAdmin={isSuperAdminPath} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Salary advanced list</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add salary advance
          </button>
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

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                CSV
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                <FileText className="w-3.5 h-3.5" />
                Excel
              </button>
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
                      Employee name
                      <div className="flex flex-col -space-y-1 opacity-30">
                        <ChevronUp size={10} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      Amount
                      <div className="flex flex-col -space-y-1 opacity-30">
                        <ChevronUp size={10} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      Release amount
                      <div className="flex flex-col -space-y-1 opacity-30">
                        <ChevronUp size={10} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      Salary month
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
                {advanceData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-600">{row.sl}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">{row.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{row.amount}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{row.release}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{row.month}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingItem(row);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-100 transition-colors shadow-sm"
                        >
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
            <span className="text-sm font-medium text-slate-500">Showing 1 to 10 of 356 entries</span>
            <div className="flex items-center gap-1">
              <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">Previous</button>
              <button className="w-10 h-10 flex items-center justify-center text-sm font-black bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">1</button>
              <button className="w-10 h-10 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">2</button>
              <button className="w-10 h-10 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">3</button>
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

      <AddSalaryAdvanceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <EditSalaryAdvanceModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }} 
        data={editingItem}
      />
    </div>
  );
}
