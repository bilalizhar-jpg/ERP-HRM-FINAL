import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Plus,
  Trash2,
  Printer,
  ChevronLeft,
  Download,
  FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface EmployeeInfo {
  name: string;
  position: string;
  contact: string;
  address: string;
  totalWorkingHours: string;
  staffId: string;
  month: string;
  from: string;
  to: string;
  recruitmentDate: string;
  workedHours: string;
}

interface PayslipRow {
  id: string;
  description: string;
  amount: string;
  rate: string;
  value: string;
  deduction: string;
}

export default function SalarySlip() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const payslipRef = useRef<HTMLDivElement>(null);

  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    name: 'Honorato Imogene Curry Terry',
    position: '',
    contact: '+1(873) 591-1817',
    address: '',
    totalWorkingHours: '10',
    staffId: '#000001',
    month: 'April, 2024',
    from: '2024-04-01',
    to: '2024-04-30',
    recruitmentDate: '2011-04-27',
    workedHours: '0'
  });

  const [earnings, setEarnings] = useState<PayslipRow[]>([
    { id: '1', description: 'Basic salary', amount: '6,400.00', rate: '', value: '0.00', deduction: '' },
    { id: '2', description: 'Transport allowance', amount: '470.00', rate: '', value: '0.00', deduction: '' },
    { id: '3', description: 'Total benefit', amount: '', rate: '', value: '1,570.00', deduction: '' },
    { id: '4', description: 'Overtime', amount: '', rate: '', value: '', deduction: '' },
  ]);

  const [deductions, setDeductions] = useState<PayslipRow[]>([
    { id: '5', description: 'State income tax', amount: '', rate: '', value: '', deduction: '0.00' },
    { id: '6', description: 'Social security', amount: '', rate: '0 %', value: '', deduction: '0.00' },
    { id: '7', description: 'Loan deduction', amount: '', rate: '', value: '', deduction: '1,020.00' },
    { id: '8', description: 'Salary advance', amount: '', rate: '', value: '', deduction: '0.00' },
  ]);

  const updateEmployeeInfo = (field: keyof EmployeeInfo, value: string) => {
    setEmployeeInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateRow = (id: string, field: keyof PayslipRow, value: string, type: 'earning' | 'deduction') => {
    const setter = type === 'earning' ? setEarnings : setDeductions;
    setter(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addCustomField = (type: 'earning' | 'deduction') => {
    const newRow: PayslipRow = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'New Field',
      amount: '',
      rate: '',
      value: '',
      deduction: ''
    };
    if (type === 'earning') setEarnings([...earnings, newRow]);
    else setDeductions([...deductions, newRow]);
  };

  const removeRow = (id: string, type: 'earning' | 'deduction') => {
    const setter = type === 'earning' ? setEarnings : setDeductions;
    setter(prev => prev.filter(row => row.id !== id));
  };

  const downloadPDF = async () => {
    if (!payslipRef.current) return;
    
    const canvas = await html2canvas(payslipRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`payslip-${employeeInfo.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ChevronLeft size={20} />
          Back to Salary Manage
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20"
          >
            <Printer size={16} />
            Print
          </button>
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Download size={16} />
            Download as PDF
          </button>
        </div>
      </div>

      <div ref={payslipRef} className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 max-w-5xl mx-auto print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-12 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <FileText size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bdtask HRM (PAYSLIP)</h1>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-12">
          {[
            { label: 'Employee name', field: 'name' },
            { label: 'Month', field: 'month' },
            { label: 'Position', field: 'position' },
            { label: 'From', field: 'from' },
            { label: 'Contact', field: 'contact' },
            { label: 'To', field: 'to' },
            { label: 'Address', field: 'address' },
            { label: 'Recruitment date', field: 'recruitmentDate' },
            { label: 'Total working hours', field: 'totalWorkingHours' },
            { label: 'Worked hours', field: 'workedHours' },
            { label: 'Staff id', field: 'staffId' },
          ].map((item) => (
            <div key={item.label} className="flex border-b border-slate-100 py-2">
              <span className="w-40 text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
              <input 
                type="text"
                value={employeeInfo[item.field as keyof EmployeeInfo]}
                onChange={(e) => updateEmployeeInfo(item.field as keyof EmployeeInfo, e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 p-0"
              />
            </div>
          ))}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Amount (৳)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Rate (৳)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">#Value (৳)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Deduction (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...earnings, ...deductions].map((row) => {
                const isEarning = earnings.some(e => e.id === row.id);
                return (
                  <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 border-r border-slate-100 relative">
                      <input 
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(row.id, 'description', e.target.value, isEarning ? 'earning' : 'deduction')}
                        className={`w-full bg-transparent border-none focus:ring-0 text-sm font-bold ${row.description.includes('Gross') || row.description.includes('Total') || row.description.includes('Net') ? 'text-slate-800' : 'text-slate-600'} p-0`}
                      />
                      <button 
                        onClick={() => removeRow(row.id, isEarning ? 'earning' : 'deduction')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                    <td className="px-6 py-3 border-r border-slate-100">
                      <input 
                        type="text"
                        value={row.amount}
                        onChange={(e) => updateRow(row.id, 'amount', e.target.value, isEarning ? 'earning' : 'deduction')}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right p-0"
                      />
                    </td>
                    <td className="px-6 py-3 border-r border-slate-100">
                      <input 
                        type="text"
                        value={row.rate}
                        onChange={(e) => updateRow(row.id, 'rate', e.target.value, isEarning ? 'earning' : 'deduction')}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right p-0"
                      />
                    </td>
                    <td className="px-6 py-3 border-r border-slate-100">
                      <input 
                        type="text"
                        value={row.value}
                        onChange={(e) => updateRow(row.id, 'value', e.target.value, isEarning ? 'earning' : 'deduction')}
                        className={`w-full bg-transparent border-none focus:ring-0 text-sm text-right p-0 ${row.description.includes('Gross') ? 'font-black text-slate-800' : 'text-slate-600'}`}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input 
                        type="text"
                        value={row.deduction}
                        onChange={(e) => updateRow(row.id, 'deduction', e.target.value, isEarning ? 'earning' : 'deduction')}
                        className={`w-full bg-transparent border-none focus:ring-0 text-sm text-right p-0 ${row.description.includes('Total') || row.description.includes('Net') ? 'font-black text-slate-800' : 'text-slate-600'}`}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50/50">
                <td colSpan={5} className="px-6 py-3">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => addCustomField('earning')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      <Plus size={14} />
                      Add Earning Field
                    </button>
                    <button 
                      onClick={() => addCustomField('deduction')}
                      className="flex items-center gap-2 text-rose-600 hover:text-rose-700 text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      <Plus size={14} />
                      Add Deduction Field
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-12 mt-24 text-center">
          <div className="space-y-2">
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Prepared by</p>
              <p className="text-sm font-bold text-slate-700 mt-1">Admin</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Checked by</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Authorized by</p>
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
