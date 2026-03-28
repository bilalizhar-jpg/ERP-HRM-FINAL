import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, 
  DollarSign, 
  History, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SalarySlip {
  id: number;
  month: string;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  loan_deductions: number;
  commissions_bonuses: number;
  net_salary: number;
  created_at: string;
  // Detailed fields to match employer design
  earnings?: { description: string; amount: string; rate: string; value: string }[];
  deductions_list?: { description: string; amount: string; rate: string; deduction: string }[];
}

interface LoanRequest {
  id: number;
  amount: number;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

interface Commission {
  id: number;
  amount: number;
  date: string;
  description: string;
  created_at: string;
}

export default function EmployeePayroll() {
  const [activeTab, setActiveTab] = useState<'slips' | 'loans' | 'commissions'>('slips');
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const payslipRef = useRef<HTMLDivElement>(null);

  // Loan form state
  const [loanAmount, setLoanAmount] = useState('');
  const [loanReason, setLoanReason] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const employee = JSON.parse(localStorage.getItem('employee') || '{}');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Mocking API response with detailed data
      const slipsData = {
        success: true,
        slips: [
          {
            id: 1,
            month: 'March',
            year: 2024,
            basic_salary: 45000,
            allowances: 5000,
            deductions: 2000,
            loan_deductions: 1000,
            commissions_bonuses: 3000,
            net_salary: 50000,
            created_at: new Date().toISOString(),
            earnings: [
              { description: 'Basic salary', amount: '45,000.00', rate: '', value: '45,000.00' },
              { description: 'Transport allowance', amount: '5,000.00', rate: '', value: '5,000.00' },
              { description: 'Performance Bonus', amount: '3,000.00', rate: '', value: '3,000.00' },
            ],
            deductions_list: [
              { description: 'Income Tax', amount: '', rate: '', deduction: '2,000.00' },
              { description: 'Loan Repayment', amount: '', rate: '', deduction: '1,000.00' },
            ]
          }
        ]
      };

      const loansData: { success: boolean; requests: LoanRequest[] } = {
        success: true,
        requests: [
          { id: 1, amount: 15000, reason: 'Medical emergency', date: '2024-03-15', status: 'Approved', created_at: '2024-03-10' },
          { id: 2, amount: 5000, reason: 'Home repair', date: '2024-03-20', status: 'Pending', created_at: '2024-03-18' },
        ]
      };

      const commsData = {
        success: true,
        commissions: [
          { id: 1, amount: 3000, date: '2024-03-01', description: 'Monthly Sales Target Bonus', created_at: '2024-03-01' }
        ]
      };

      setSlips(slipsData.slips);
      setLoans(loansData.requests);
      setCommissions(commsData.commissions);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newLoan: LoanRequest = {
        id: Date.now(),
        amount: parseFloat(loanAmount),
        reason: loanReason,
        date: loanDate,
        status: 'Pending' as const,
        created_at: new Date().toISOString()
      };
      setLoans([newLoan, ...loans]);
      setSubmitting(false);
      setShowLoanModal(false);
      setLoanAmount('');
      setLoanReason('');
    }, 1000);
  };

  const downloadPDF = async () => {
    if (!payslipRef.current || !selectedSlip) return;
    
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
    pdf.save(`payslip-${employee.name?.replace(/\s+/g, '-').toLowerCase() || 'employee'}-${selectedSlip.month}-${selectedSlip.year}.pdf`);
  };

  const filteredSlips = slips.filter(s => 
    s.month.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.year.toString().includes(searchTerm)
  );

  const filteredLoans = loans.filter(l => 
    l.reason.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCommissions = commissions.filter(c => 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Payroll Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Access your salary details, request loans, and track bonuses.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'loans' && (
            <button
              onClick={() => setShowLoanModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Request Advance
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('slips')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
            activeTab === 'slips' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Salary Slips
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
            activeTab === 'loans' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Loan Requests
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
            activeTab === 'commissions' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Bonuses
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-slate-500 font-bold">Fetching your payroll data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'slips' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month/Year</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Salary</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Salary</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Generated</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSlips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">No salary slips found</td>
                    </tr>
                  ) : (
                    filteredSlips.map((slip) => (
                      <tr key={slip.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-slate-800">{slip.month} {slip.year}</div>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-medium">৳ {slip.basic_salary.toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <span className="font-black text-blue-600">৳ {slip.net_salary.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5 text-slate-400 text-sm font-medium">
                          {new Date(slip.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => setSelectedSlip(slip)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white rounded-xl font-bold text-xs transition-all active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Payslip
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'loans' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">No loan requests found</td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => (
                      <tr key={loan.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-slate-500 font-medium">{new Date(loan.date).toLocaleDateString()}</td>
                        <td className="px-8 py-5 font-black text-slate-800">৳ {loan.amount.toLocaleString()}</td>
                        <td className="px-8 py-5 text-slate-600 font-medium">{loan.reason}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            loan.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            loan.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {loan.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                            {loan.status === 'Rejected' && <AlertCircle className="w-3 h-3" />}
                            {loan.status === 'Pending' && <Clock className="w-3 h-3" />}
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'commissions' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium italic">No bonuses found</td>
                    </tr>
                  ) : (
                    filteredCommissions.map((comm) => (
                      <tr key={comm.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-slate-500 font-medium">{new Date(comm.date).toLocaleDateString()}</td>
                        <td className="px-8 py-5 font-black text-emerald-600">+৳ {comm.amount.toLocaleString()}</td>
                        <td className="px-8 py-5 text-slate-600 font-medium">{comm.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Loan Modal */}
      <AnimatePresence>
        {showLoanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Request Advance</h3>
                <button onClick={() => setShowLoanModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleLoanSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (৳)</label>
                  <input
                    type="number"
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={loanReason}
                    onChange={(e) => setLoanReason(e.target.value)}
                    placeholder="Briefly explain your request..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowLoanModal(false)}
                    className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payslip Modal */}
      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl my-8 relative"
            >
              <div className="sticky top-0 z-10 px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-t-[40px]">
                <button 
                  onClick={() => setSelectedSlip(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20 active:scale-95"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                  <button 
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="p-12 lg:p-20 overflow-y-auto max-h-[80vh]">
                <div ref={payslipRef} className="bg-white p-12 border border-slate-100 rounded-3xl">
                  <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                        <FileText size={40} />
                      </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Bdtask HRM (PAYSLIP)</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Official Salary Statement</p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-12">
                    {[
                      { label: 'Employee name', value: employee.name },
                      { label: 'Month', value: `${selectedSlip.month}, ${selectedSlip.year}` },
                      { label: 'Position', value: employee.designation || 'Staff' },
                      { label: 'From', value: `${selectedSlip.year}-${selectedSlip.month}-01` },
                      { label: 'Contact', value: employee.phone || 'N/A' },
                      { label: 'To', value: `${selectedSlip.year}-${selectedSlip.month}-30` },
                      { label: 'Address', value: employee.address || 'N/A' },
                      { label: 'Recruitment date', value: employee.joining_date || 'N/A' },
                      { label: 'Total working hours', value: '160' },
                      { label: 'Worked hours', value: '160' },
                      { label: 'Staff id', value: employee.employee_id || `#${employee.id}` },
                    ].map((item) => (
                      <div key={item.label} className="flex border-b border-slate-100 py-2">
                        <span className="w-40 text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                        <span className="flex-1 text-sm font-bold text-slate-700">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border border-slate-200 rounded-3xl overflow-hidden mb-16 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-r border-slate-700">Description</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 text-right">Amount (৳)</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 text-right">Rate (৳)</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 text-right">#Value (৳)</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Deduction (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedSlip.earnings?.map((row, idx) => (
                          <tr key={`earn-${idx}`} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600">{row.description}</td>
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600 text-right">৳ {row.amount}</td>
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600 text-right">{row.rate || '-'}</td>
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600 text-right">৳ {row.value}</td>
                            <td className="px-8 py-4 text-sm font-bold text-slate-600 text-right">-</td>
                          </tr>
                        ))}
                        {selectedSlip.deductions_list?.map((row, idx) => (
                          <tr key={`deduct-${idx}`} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600">{row.description}</td>
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600 text-right">-</td>
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600 text-right">{row.rate || '-'}</td>
                            <td className="px-8 py-4 border-r border-slate-100 text-sm font-bold text-slate-600 text-right">-</td>
                            <td className="px-8 py-4 text-sm font-bold text-rose-600 text-right">৳ {row.deduction}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50/80">
                          <td className="px-8 py-6 border-r border-slate-100 text-base font-black text-slate-800 uppercase tracking-widest">Net Payable</td>
                          <td colSpan={4} className="px-8 py-6 text-2xl font-black text-blue-600 text-right">৳ {selectedSlip.net_salary.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-3 gap-16 mt-32 text-center">
                    <div className="space-y-3">
                      <div className="border-t-2 border-slate-100 pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prepared by</p>
                        <p className="text-sm font-bold text-slate-700 mt-2">Accounts Dept</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="border-t-2 border-slate-100 pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Checked by</p>
                        <p className="text-sm font-bold text-slate-700 mt-2">HR Manager</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="border-t-2 border-slate-100 pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized by</p>
                        <p className="text-sm font-bold text-slate-700 mt-2">Director</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
