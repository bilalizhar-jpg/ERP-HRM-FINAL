import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X,
  CalendarDays,
  FileText,
  CalendarOff,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Leave {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  total_days: number;
  created_at: string;
}

interface LeaveStats {
  total: number;
  approved: number;
  pending: number;
  balance: number;
}

interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
}

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [stats, setStats] = useState<LeaveStats>({ total: 0, approved: 0, pending: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form state
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const employee = JSON.parse(localStorage.getItem('employee') || '{}');

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`/api/employee/leaves?employee_id=${employee.id}`);
      const data = await response.json();
      if (data.leaves) {
        setLeaves(data.leaves);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch(`/api/leave-types?company_id=${employee.company_id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setLeaveTypes(data);
        if (data.length > 0 && !leaveType) {
          setLeaveType(data[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (employee.id) {
        setLoading(true);
        await Promise.all([fetchLeaves(), fetchLeaveTypes()]);
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const totalDays = calculateDays(startDate, endDate);

    try {
      const response = await fetch('/api/employee/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: employee.company_id,
          employee_id: employee.id,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason,
          total_days: totalDays
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || leave.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 size={14} />;
      case 'Rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Leaves</h1>
          <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Manage your leave requests and balance</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest group shrink-0"
        >
          <Plus size={16} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
          Apply for Leave
        </button>
      </div>

      {/* Stats and Leave Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Total Requests', value: stats.total, icon: FileText, color: 'blue' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'emerald' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
            { label: 'Leave Balance', value: stats.balance, icon: Calendar, color: 'indigo' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
              </div>
              <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-600" />
            Leave Types & Limits
          </h3>
          <div className="space-y-4">
            {leaveTypes.map((item, i) => {
              const colors = ['blue', 'rose', 'emerald', 'purple', 'amber', 'indigo'];
              const color = colors[i % colors.length];
              return (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">{item.days_allowed} Days</span>
                </div>
              );
            })}
            {leaveTypes.length === 0 && (
              <p className="text-[10px] text-slate-400 font-medium italic">No leave types configured.</p>
            )}
          </div>
          <p className="mt-6 text-[9px] text-slate-400 font-medium leading-relaxed italic">
            * Leave limits are subject to company policy and manager approval.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="SEARCH LEAVES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-900 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Leave Type</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Days</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length > 0 ? filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                        {leave.leave_type.charAt(0)}
                      </div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{leave.leave_type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                      <CalendarDays size={14} className="text-slate-400" />
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {leave.total_days} Days
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusColor(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                      {leave.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-slate-500 font-medium max-w-xs truncate">{leave.reason}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(leave.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 rounded-full bg-slate-50 text-slate-300">
                        <CalendarOff size={48} strokeWidth={1} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">No Leave Records Found</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Leave Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Apply for Leave</h2>
                  <p className="text-[10px] text-slate-400 font-black mt-3 uppercase tracking-[0.3em]">Submit a new leave request</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-4 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase appearance-none"
                    >
                      {leaveTypes.map(type => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                    <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Total Days</span>
                      <span className="text-xl font-black text-blue-700 tracking-tighter">{calculateDays(startDate, endDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Leave</label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="PLEASE PROVIDE A DETAILED REASON..."
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase resize-none placeholder:text-slate-300"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-blue-600 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} strokeWidth={3} />
                    )}
                    Submit Request
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
