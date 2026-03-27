import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { Edit, Plus, Search, Filter, FileText, X, Eye, Check, Trash2, CalendarDays, ArrowRight } from 'lucide-react';

type TabType = 'WEEKLY HOLIDAY' | 'HOLIDAY' | 'LEAVE TYPE' | 'LEAVE APPROVAL' | 'LEAVE REPORT';

export default function Leave() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const [activeTab, setActiveTab] = useState<TabType>('WEEKLY HOLIDAY');
  const [showWeeklyHolidayModal, setShowWeeklyHolidayModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Holiday Form State
  const [holidayName, setHolidayName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);

  // Leave Type Form State
  const [leaveTypeName, setLeaveTypeName] = useState('');
  const [leaveTypeDays, setLeaveTypeDays] = useState(0);

  const tabs: TabType[] = ['WEEKLY HOLIDAY', 'HOLIDAY', 'LEAVE TYPE', 'LEAVE APPROVAL', 'LEAVE REPORT'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const calculateTotalDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setTotalDays(calculateTotalDays(val, toDate));
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setTotalDays(calculateTotalDays(fromDate, val));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'WEEKLY HOLIDAY':
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-end bg-slate-50/30">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Weekly Holiday</h2>
                <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Configure recurring weekly off days</p>
              </div>
              <button 
                onClick={() => setShowWeeklyHolidayModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest group"
              >
                <Plus size={16} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                Add Weekly Holiday
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24">SL</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Day Name</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-10 py-8 text-xs text-slate-400 font-black">01</td>
                    <td className="px-10 py-8">
                      <div className="flex flex-wrap gap-3">
                        {selectedDays.length > 0 ? selectedDays.map(day => (
                          <span key={day} className="px-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                            {day}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-300 font-black uppercase tracking-widest italic">No days selected</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => setShowWeeklyHolidayModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-100 group-hover:shadow-lg group-hover:shadow-blue-100"
                      >
                        <Edit size={14} strokeWidth={3} />
                        Edit Days
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'HOLIDAY':
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-end bg-slate-50/30">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Holiday List</h2>
                <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Manage annual public holidays</p>
              </div>
              <button 
                onClick={() => setShowHolidayModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest group"
              >
                <Plus size={16} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                Add Holiday
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24">SL</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Holiday Name</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Days</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 1, name: 'New Year', from: 'Jan 01, 2026', to: 'Jan 01, 2026', total: 1 },
                    { id: 2, name: 'Eid-ul-Fitr', from: 'Mar 20, 2026', to: 'Mar 22, 2026', total: 3 },
                    { id: 3, name: 'Independence Day', from: 'Aug 14, 2026', to: 'Aug 14, 2026', total: 1 },
                  ].map((holiday, idx) => (
                    <tr key={holiday.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-8 text-xs text-slate-400 font-black">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-10 py-8">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{holiday.name}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span>{holiday.from}</span>
                          <ArrowRight size={12} className="text-slate-300" />
                          <span>{holiday.to}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                          {holiday.total} Days
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setShowHolidayModal(true)}
                            className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-500 border border-slate-100 hover:border-blue-600 shadow-sm hover:shadow-xl hover:shadow-blue-100"
                          >
                            <Edit size={18} strokeWidth={2.5} />
                          </button>
                          <button className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 border border-slate-100 hover:border-red-600 shadow-sm hover:shadow-xl hover:shadow-red-100">
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'LEAVE TYPE':
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-end bg-slate-50/30">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Leave Types</h2>
                <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Define leave categories and quotas</p>
              </div>
              <button 
                onClick={() => setShowLeaveTypeModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest group"
              >
                <Plus size={16} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                Add Leave Type
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24">SL</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Leave Type</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Allocated Days</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 1, name: 'Annual Leave', days: 15 },
                    { id: 2, name: 'Sick Leave', days: 10 },
                    { id: 3, name: 'Maternity Leave', days: 90 },
                  ].map((type, idx) => (
                    <tr key={type.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-8 text-xs text-slate-400 font-black">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-10 py-8">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{type.name}</span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                          {type.days} Days
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setShowLeaveTypeModal(true)}
                            className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-500 border border-slate-100 hover:border-blue-600 shadow-sm hover:shadow-xl hover:shadow-blue-100"
                          >
                            <Edit size={18} strokeWidth={2.5} />
                          </button>
                          <button className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 border border-slate-100 hover:border-red-600 shadow-sm hover:shadow-xl hover:shadow-red-100">
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'LEAVE APPROVAL':
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-end bg-slate-50/30">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Leave Approvals</h2>
                <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Review and process leave requests</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search requests..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-72 transition-all" />
                </div>
                <button className="w-12 h-12 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
                  <Filter size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-16">SL</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Apply Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-20">Days</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 1, employee: 'Sarah Connor', type: 'Annual Leave', applyDate: 'Mar 20, 2026', start: 'Mar 28', end: 'Apr 05', days: 8, status: 'Approved' },
                    { id: 2, employee: 'John Smith', type: 'Sick Leave', applyDate: 'Mar 24, 2026', start: 'Mar 25', end: 'Mar 26', days: 2, status: 'Pending' },
                    { id: 3, employee: 'Ellen Ripley', type: 'Casual Leave', applyDate: 'Mar 22, 2026', start: 'Mar 26', end: 'Mar 26', days: 1, status: 'Pending' },
                  ].map((request, idx) => (
                    <tr key={request.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-8 text-xs text-slate-400 font-black">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] border border-blue-100">
                            {request.employee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{request.employee}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{request.type}</span>
                      </td>
                      <td className="px-8 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">{request.applyDate}</td>
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span>{request.start}</span>
                          <ArrowRight size={10} className="text-slate-300" />
                          <span>{request.end}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                          {request.days}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border shadow-sm ${
                          request.status === 'Approved' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-slate-100 hover:border-blue-600 shadow-sm" title="View">
                            <Eye size={16} strokeWidth={2.5} />
                          </button>
                          <button className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-slate-100 hover:border-emerald-600 shadow-sm" title="Approve">
                            <Check size={16} strokeWidth={2.5} />
                          </button>
                          <button className="w-10 h-10 bg-white text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all border border-slate-100 hover:border-amber-600 shadow-sm" title="Reject">
                            <X size={16} strokeWidth={2.5} />
                          </button>
                          <button className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-slate-100 hover:border-red-600 shadow-sm" title="Delete">
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'LEAVE REPORT':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Leave Reports</h2>
                  <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Generate detailed leave analytics</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                    <FileText size={16} />
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>All Employees</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Leave Type</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>All Types</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Month</label>
                  <input type="month" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="flex items-end">
                  <button className="w-full px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Annual</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sick</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Casual</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Taken</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'Sarah Connor', annual: 5, sick: 2, casual: 1, total: 8, remaining: 17 },
                      { name: 'John Smith', annual: 0, sick: 4, casual: 0, total: 4, remaining: 21 },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <span className="text-sm font-black text-slate-700">{row.name}</span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-500">{row.annual}</td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-500">{row.sick}</td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-500">{row.casual}</td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                            {row.total} Days
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                            {row.remaining} Days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">Leave Management</h1>
            <p className="text-slate-500 font-medium">Manage holidays, leave types, and approvals.</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>

      {showWeeklyHolidayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
            <div className="p-10 pb-6 flex justify-between items-center border-b border-slate-50 bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Weekly Holiday</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Configure weekend days</p>
              </div>
              <button 
                onClick={() => setShowWeeklyHolidayModal(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 pt-8">
              <div className="grid grid-cols-1 gap-4">
                {days.map((day) => (
                  <label key={day} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                    selectedDays.includes(day) 
                      ? 'bg-blue-50 border-blue-600' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}>
                    <span className={`text-sm font-black uppercase tracking-wider transition-colors ${
                      selectedDays.includes(day) ? 'text-blue-600' : 'text-slate-600'
                    }`}>{day}</span>
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        checked={selectedDays.includes(day)}
                        onChange={() => toggleDay(day)}
                      />
                      <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setShowWeeklyHolidayModal(false)}
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowWeeklyHolidayModal(false)}
                  className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHolidayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
            <div className="p-10 pb-6 flex justify-between items-center border-b border-slate-50 bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Add Holiday</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Create a new public holiday</p>
              </div>
              <button 
                onClick={() => setShowHolidayModal(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 pt-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Holiday Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Eid Vacation"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">From Date</label>
                  <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => handleFromDateChange(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">To Date</label>
                  <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => handleToDateChange(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Days</label>
                <div className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black text-slate-500 flex items-center justify-between">
                  <span>{totalDays} Days</span>
                  <CalendarDays size={18} className="text-slate-400" />
                </div>
              </div>

              <div className="mt-10 flex gap-4 pt-4">
                <button 
                  onClick={() => setShowHolidayModal(false)}
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowHolidayModal(false)}
                  className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Save Holiday
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeaveTypeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
            <div className="p-10 pb-6 flex justify-between items-center border-b border-slate-50 bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Add Leave Type</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Configure a new leave category</p>
              </div>
              <button 
                onClick={() => setShowLeaveTypeModal(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 pt-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Leave Type Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Medical Leave"
                  value={leaveTypeName}
                  onChange={(e) => setLeaveTypeName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Allocated Days</label>
                <input 
                  type="number" 
                  value={leaveTypeDays}
                  onChange={(e) => setLeaveTypeDays(parseInt(e.target.value) || 0)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Advanced Settings</p>
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 flex items-center gap-1.5 transition-all">
                    <Plus size={12} strokeWidth={3} />
                    Add Custom Field
                  </button>
                </div>
                <div className="h-px bg-slate-100 w-full"></div>
              </div>

              <div className="mt-10 flex gap-4 pt-4">
                <button 
                  onClick={() => setShowLeaveTypeModal(false)}
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowLeaveTypeModal(false)}
                  className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Save Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
