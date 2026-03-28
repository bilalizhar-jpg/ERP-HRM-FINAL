import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Plus,
  Printer,
  ChevronLeft,
  Download,
  Search
} from 'lucide-react';

interface SalaryChartRow {
  id: string;
  si: number;
  name: string;
  basicSalary: string;
  totalBenefit: string;
  transportAllowance: string;
  grossSalary: string;
  stateIncomeTax: string;
  socialSecurityNpf: string;
  employerContribution: string;
  loanDeduction: string;
  salaryAdvance: string;
  totalDeductions: string;
  netSalary: string;
  customFields: { [key: string]: string };
}

export default function EmployeeSalaryChart() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [customFieldNames, setCustomFieldNames] = useState<string[]>([]);
  
  const [rows, setRows] = useState<SalaryChartRow[]>([
    { id: '1', si: 1, name: 'Honorato Imogene Curry Terry', basicSalary: '0', totalBenefit: '1570', transportAllowance: '0', grossSalary: '1570', stateIncomeTax: '0', socialSecurityNpf: '0', employerContribution: '0', loanDeduction: '12675', salaryAdvance: '0', totalDeductions: '12675', netSalary: '-11105', customFields: {} },
    { id: '2', si: 2, name: 'Maisha Lucy Zamora Gonzales', basicSalary: '0', totalBenefit: '0', transportAllowance: '0', grossSalary: '0', stateIncomeTax: '0', socialSecurityNpf: '0', employerContribution: '0', loanDeduction: '10000', salaryAdvance: '0', totalDeductions: '10000', netSalary: '-10000', customFields: {} },
    { id: '3', si: 3, name: 'Amy Aphrodite Zamora Peck', basicSalary: '0', totalBenefit: '4000', transportAllowance: '0', grossSalary: '4000', stateIncomeTax: '0', socialSecurityNpf: '0', employerContribution: '0', loanDeduction: '4917', salaryAdvance: '0', totalDeductions: '4917', netSalary: '-917', customFields: {} },
    { id: '4', si: 4, name: 'Jonathan Ibrahim Shekh', basicSalary: '0', totalBenefit: '0', transportAllowance: '0', grossSalary: '0', stateIncomeTax: '0', socialSecurityNpf: '0', employerContribution: '0', loanDeduction: '4375', salaryAdvance: '0', totalDeductions: '4375', netSalary: '-4375', customFields: {} },
    { id: '5', si: 5, name: 'Scarlet Melvin Reese Rogers', basicSalary: '0', totalBenefit: '56', transportAllowance: '0', grossSalary: '56', stateIncomeTax: '0', socialSecurityNpf: '0', employerContribution: '0', loanDeduction: '0', salaryAdvance: '0', totalDeductions: '0', netSalary: '56', customFields: {} },
  ]);

  const addCustomField = () => {
    const fieldName = prompt('Enter custom field name:');
    if (fieldName && !customFieldNames.includes(fieldName)) {
      setCustomFieldNames([...customFieldNames, fieldName]);
      setRows(rows.map(row => ({
        ...row,
        customFields: { ...row.customFields, [fieldName]: '0' }
      })));
    }
  };

  const updateRow = (id: string, field: keyof SalaryChartRow | string, value: string, isCustom = false) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        if (isCustom) {
          return { ...row, customFields: { ...row.customFields, [field]: value } };
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Employee salary chart for January, 2049</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
            <Download size={16} />
            Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20">
            <Printer size={16} />
            Print Chart
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button 
            onClick={addCustomField}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-all border border-blue-100"
          >
            <Plus size={16} />
            Add Custom Field
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1800px]">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 w-12 text-center">SI</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 min-w-[200px]">Name</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Basic salary(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Total benefit(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Transport allowance(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Gross salary(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">State income tax(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Social security npf(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Employer contribution(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Loan deduction(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Salary advance(৳)</th>
                {customFieldNames.map(name => (
                  <th key={name} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 bg-slate-700">{name}(৳)</th>
                ))}
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Total deductions(৳)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest">Net salary(৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-sm text-slate-400 text-center border-r border-slate-50">{row.si}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700 border-r border-slate-50">{row.name}</td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.basicSalary} 
                      onChange={(e) => updateRow(row.id, 'basicSalary', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.totalBenefit} 
                      onChange={(e) => updateRow(row.id, 'totalBenefit', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right font-bold"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.transportAllowance} 
                      onChange={(e) => updateRow(row.id, 'transportAllowance', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50 bg-slate-50/30">
                    <input 
                      type="text" 
                      value={row.grossSalary} 
                      onChange={(e) => updateRow(row.id, 'grossSalary', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-blue-600 text-right font-black"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.stateIncomeTax} 
                      onChange={(e) => updateRow(row.id, 'stateIncomeTax', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.socialSecurityNpf} 
                      onChange={(e) => updateRow(row.id, 'socialSecurityNpf', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.employerContribution} 
                      onChange={(e) => updateRow(row.id, 'employerContribution', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.loanDeduction} 
                      onChange={(e) => updateRow(row.id, 'loanDeduction', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-slate-50">
                    <input 
                      type="text" 
                      value={row.salaryAdvance} 
                      onChange={(e) => updateRow(row.id, 'salaryAdvance', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                    />
                  </td>
                  {customFieldNames.map(name => (
                    <td key={name} className="px-4 py-4 border-r border-slate-50 bg-slate-50/20">
                      <input 
                        type="text" 
                        value={row.customFields[name]} 
                        onChange={(e) => updateRow(row.id, name, e.target.value, true)}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 text-right"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-4 border-r border-slate-50 bg-rose-50/20">
                    <input 
                      type="text" 
                      value={row.totalDeductions} 
                      onChange={(e) => updateRow(row.id, 'totalDeductions', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-rose-600 text-right font-bold"
                    />
                  </td>
                  <td className="px-4 py-4 bg-emerald-50/20">
                    <input 
                      type="text" 
                      value={row.netSalary} 
                      onChange={(e) => updateRow(row.id, 'netSalary', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-emerald-600 text-right font-black"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-8 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-all active:scale-[0.98]">
          Cancel Changes
        </button>
        <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
          Save & Update Chart
        </button>
      </div>
    </div>
  );

  return (
    <div className={isSuperAdminPath ? "min-h-screen bg-[#f8f9fa] flex" : ""}>
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className={isSuperAdminPath ? "flex-1 p-8 lg:p-12 overflow-y-auto" : "p-6"}>
        <div className="max-w-full mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
