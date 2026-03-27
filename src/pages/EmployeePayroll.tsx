import { useState, useEffect, useCallback } from 'react';
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
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type for autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: {
    startY?: number;
    head?: unknown[][];
    body?: unknown[][];
    theme?: string;
    headStyles?: Record<string, unknown>;
  }) => jsPDF;
}

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

  // Loan form state
  const [loanAmount, setLoanAmount] = useState('');
  const [loanReason, setLoanReason] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const employee = JSON.parse(localStorage.getItem('employee') || '{}');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [slipsRes, loansRes, commsRes] = await Promise.all([
        fetch(`/api/employee/salary-slips?employee_id=${employee.id}`),
        fetch(`/api/employee/loan-requests?employee_id=${employee.id}`),
        fetch(`/api/employee/commissions?employee_id=${employee.id}`)
      ]);

      const slipsData = await slipsRes.json();
      const loansData = await loansRes.json();
      const commsData = await commsRes.json();

      if (slipsData.success) setSlips(slipsData.slips);
      if (loansData.success) setLoans(loansData.requests);
      if (commsData.success) setCommissions(commsData.commissions);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  }, [employee.id]);

  useEffect(() => {
    if (employee.id) {
      fetchData();
    }
  }, [employee.id, fetchData]);

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/employee/loan-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: employee.company_id,
          employee_id: employee.id,
          amount: parseFloat(loanAmount),
          reason: loanReason,
          date: loanDate
        })
      });
      if (response.ok) {
        setShowLoanModal(false);
        setLoanAmount('');
        setLoanReason('');
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting loan request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = (slip: SalarySlip) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Blue-500
    doc.text('SALARY SLIP', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Company ID: ${employee.company_id}`, 20, 40);
    doc.text(`Employee Name: ${employee.name}`, 20, 50);
    doc.text(`Employee ID: ${employee.employee_id || employee.id}`, 20, 60);
    doc.text(`Month/Year: ${slip.month} ${slip.year}`, 20, 70);
    
    // Table
    const tableData = [
      ['Description', 'Amount'],
      ['Basic Salary', `$${slip.basic_salary.toFixed(2)}`],
      ['Allowances', `$${slip.allowances.toFixed(2)}`],
      ['Commissions/Bonuses', `$${slip.commissions_bonuses.toFixed(2)}`],
      ['Deductions', `-$${slip.deductions.toFixed(2)}`],
      ['Loan Deductions', `-$${slip.loan_deductions.toFixed(2)}`],
      [{ content: 'Net Salary', styles: { fontStyle: 'bold' } }, { content: `$${slip.net_salary.toFixed(2)}`, styles: { fontStyle: 'bold' } }]
    ];

    doc.autoTable({
      startY: 80,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Salary_Slip_${slip.month}_${slip.year}.pdf`);
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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your salary slips, loans, and commissions</p>
        </div>
        {activeTab === 'loans' && (
          <button
            onClick={() => setShowLoanModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Request Advance/Loan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('slips')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'slips' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Salary Slips
          </div>
          {activeTab === 'slips' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'loans' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Loan Requests
          </div>
          {activeTab === 'loans' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'commissions' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Commissions & Bonuses
          </div>
          {activeTab === 'commissions' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading payroll data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'slips' && (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Month/Year</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Basic Salary</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Salary</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Generated</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSlips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No salary slips found</td>
                    </tr>
                  ) : (
                    filteredSlips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{slip.month} {slip.year}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">${slip.basic_salary.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-600">${slip.net_salary.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(slip.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => downloadPDF(slip)}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'loans' && (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No loan requests found</td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">{new Date(loan.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">${loan.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600">{loan.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            loan.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            loan.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
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
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No commissions or bonuses found</td>
                    </tr>
                  ) : (
                    filteredCommissions.map((comm) => (
                      <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">{new Date(comm.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-semibold text-green-600">+${comm.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600">{comm.description}</td>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">Request Advance/Loan</h3>
                <button onClick={() => setShowLoanModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleLoanSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={loanReason}
                    onChange={(e) => setLoanReason(e.target.value)}
                    placeholder="Why do you need this loan?"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLoanModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
