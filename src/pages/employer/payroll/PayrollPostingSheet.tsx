import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Plus,
  Trash2,
  Printer,
  ChevronLeft
} from 'lucide-react';

interface PostingRow {
  id: string;
  description: string;
  debit: string;
  credit: string;
}

export default function PayrollPostingSheet() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const [rows, setRows] = useState<PostingRow[]>([
    { id: '1', description: 'Gross salary', debit: '9038.00', credit: '' },
    { id: '2', description: 'Net salary', debit: '', credit: '-23929.00' },
    { id: '3', description: 'Loans', debit: '', credit: '32967.00' },
    { id: '4', description: 'Salary advance', debit: '', credit: '0.00' },
    { id: '5', description: 'State income tax', debit: '', credit: '0.00' },
    { id: '6', description: 'Employee npf contribution', debit: '', credit: '0.00' },
    { id: '7', description: 'Employer npf contribution', debit: '', credit: '0.00' },
    { id: '8', description: 'licf contribution', debit: '', credit: '0.00' },
  ]);

  const addRow = () => {
    const newRow: PostingRow = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      debit: '0.00',
      credit: '0.00'
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof PostingRow, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ChevronLeft size={20} />
          Back to Salary Generate
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20">
          <Printer size={16} />
          Print Sheet
        </button>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Payroll posting sheet for January, 2049</h1>
        <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-black uppercase tracking-wider">
          Approved
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-r border-slate-700 w-1/2">Description</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest" colSpan={2}>Amounts</th>
            </tr>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-3 border-r border-slate-200"></th>
              <th className="px-6 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-200">Debit</th>
              <th className="px-6 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 border-r border-slate-100 relative">
                  <input 
                    type="text"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="Enter description..."
                  />
                  <button 
                    onClick={() => removeRow(row.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
                <td className="px-6 py-4 border-r border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">৳</span>
                    <input 
                      type="text"
                      value={row.debit}
                      onChange={(e) => updateRow(row.id, 'debit', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">৳</span>
                    <input 
                      type="text"
                      value={row.credit}
                      onChange={(e) => updateRow(row.id, 'credit', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/50">
              <td className="px-6 py-4 border-r border-slate-100">
                <button 
                  onClick={addRow}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors"
                >
                  <Plus size={16} />
                  Add Custom Field
                </button>
              </td>
              <td className="px-6 py-4 border-r border-slate-100 bg-slate-100/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase">Total Debit</span>
                  <span className="text-sm font-black text-slate-800">৳ 9,038.00</span>
                </div>
              </td>
              <td className="px-6 py-4 bg-slate-100/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase">Total Credit</span>
                  <span className="text-sm font-black text-slate-800">৳ 9,038.00</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-8 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-all active:scale-[0.98]">
          Save Draft
        </button>
        <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
          Post to Accounting
        </button>
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
