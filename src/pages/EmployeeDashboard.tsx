import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, Coffee, FileText, 
  AlertCircle, Plus, 
  ChevronLeft, ChevronRight, StickyNote,
  CalendarDays, History, ClipboardList,
  Activity, Pause, Square, Monitor, Keyboard,
  Edit2, Trash2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeTracking } from '../contexts/TimeTrackingContext';

interface AttendanceRecord {
  id: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  break_duration_minutes: number;
  status: string;
  is_late: boolean;
}

interface LeaveRecord {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  total_days: number;
}

interface NoteRecord {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface DashboardStats {
  today: {
    punchIn: string | null;
    punchOut: string | null;
    workedTime: number;
    breakTime: number;
    scheduled: number;
    leftTime: number;
  };
  monthly: {
    scheduled: number;
    workedTime: number;
    overtime: number;
    breakTime: number;
    lateTime: number;
    totalLeaves: number;
  };
  leaveBalance: number;
  salarySlipNotification: string | null;
  attendanceList: AttendanceRecord[];
  leaveList: LeaveRecord[];
  notes: NoteRecord[];
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newLeave, setNewLeave] = useState({ 
    leave_type: 'Annual Leave', 
    start_date: format(new Date(), 'yyyy-MM-dd'), 
    end_date: format(new Date(), 'yyyy-MM-dd'), 
    reason: '' 
  });
  const employee = JSON.parse(localStorage.getItem('employee') || '{}');
  
  const { 
    isTracking, 
    isPaused, 
    activeTime, 
    idleTime, 
    settings, 
    hasConsent, 
    setHasConsent,
    startTracking
  } = useTimeTracking();

  const fetchDashboardData = useCallback(async () => {
    if (!employee.id) return;
    try {
      const res = await fetch(`/api/employee/dashboard/stats?employee_id=${employee.id}&company_id=${employee.company_id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [employee.id, employee.company_id]);

  useEffect(() => {
    if (!employee.id) {
      navigate('/employee/login');
      return;
    }
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [employee.id, navigate, fetchDashboardData]);

  useEffect(() => {
    if (settings?.is_enabled && !hasConsent) {
      setShowConsentModal(true);
    }
  }, [settings?.is_enabled, hasConsent]);

  const handleConsent = (agreed: boolean) => {
    setHasConsent(agreed);
    setShowConsentModal(false);
    if (agreed && stats?.today.punchIn && !stats?.today.punchOut) {
      startTracking();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) return;
    try {
      const url = editingNoteId ? `/api/employee/notes/${editingNoteId}` : '/api/employee/notes';
      const method = editingNoteId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employee.id,
          title: newNote.title,
          content: newNote.content,
          date: format(new Date(), 'yyyy-MM-dd')
        })
      });
      if (res.ok) {
        setShowNoteModal(false);
        setEditingNoteId(null);
        setNewNote({ title: '', content: '' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/employee/notes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleEditNote = (note: NoteRecord) => {
    setEditingNoteId(note.id);
    setNewNote({ title: note.title, content: note.content });
    setShowNoteModal(true);
  };

  const handleApplyLeave = async () => {
    if (!newLeave.reason) return;
    const totalDays = differenceInDays(new Date(newLeave.end_date), new Date(newLeave.start_date)) + 1;
    try {
      const res = await fetch('/api/employee/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: employee.company_id,
          employee_id: employee.id,
          leave_type: newLeave.leave_type,
          start_date: newLeave.start_date,
          end_date: newLeave.end_date,
          reason: newLeave.reason,
          total_days: totalDays
        })
      });
      if (res.ok) {
        setShowLeaveModal(false);
        setNewLeave({ 
          leave_type: 'Annual Leave', 
          start_date: format(new Date(), 'yyyy-MM-dd'), 
          end_date: format(new Date(), 'yyyy-MM-dd'), 
          reason: '' 
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error applying for leave:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Employee Dashboard</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Welcome back, {employee.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <CalendarDays size={16} />
            Apply Leave
          </button>
          <button 
            onClick={() => setShowNoteModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Note
          </button>
        </div>
      </div>

      {/* Top Punch Info Bar - Replaced with Leave Balance and Salary Notification */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave balance</p>
            <p className="text-xl font-black text-slate-900">
              {stats?.leaveBalance ?? '--'} Days
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary slip notification</p>
            <p className="text-sm font-bold text-slate-700 max-w-xs truncate">
              {stats?.salarySlipNotification ?? 'No new notifications'}
            </p>
          </div>
        </div>
        
        {/* Time Tracking Widget */}
        {settings?.is_enabled && hasConsent && (
          <div className="flex items-center gap-6 ml-auto pl-8 border-l border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isTracking && !isPaused ? 'bg-blue-50 text-blue-600' : 
                isPaused ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
              }`}>
                {isTracking && !isPaused ? <Activity size={24} className="animate-pulse" /> : 
                 isPaused ? <Pause size={24} /> : <Square size={24} />}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isTracking && !isPaused ? 'Tracking Active' : isPaused ? 'Tracking Paused' : 'Tracking Stopped'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {formatTime(activeTime)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Coffee size={12} />
                Idle: <span className="font-mono text-slate-700">{formatTime(idleTime)}</span>
              </div>
              {settings.screenshot_enabled && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Monitor size={12} />
                  Screenshots: <span className="text-blue-600">On</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Today Time Log */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-6 flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          Today Time Log
        </h2>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">{stats?.today.scheduled} H Scheduled</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">{stats?.today.workedTime.toFixed(2)} H Worked Time</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm font-bold text-amber-500 uppercase tracking-wide">{stats?.today.breakTime.toFixed(2)} H Break Time</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-sm font-bold text-rose-500 uppercase tracking-wide">{stats?.today.leftTime.toFixed(2)} H Left Time</span>
          </div>
        </div>
      </section>

      {/* This Month Stats */}
      <section>
        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-6 flex items-center gap-2">
          <History size={20} className="text-blue-600" />
          This Month
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Schedule Time', value: `${stats?.monthly.scheduled} H`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Worked Time', value: `${stats?.monthly.workedTime.toFixed(2)} H`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Over Time', value: `${stats?.monthly.overtime.toFixed(2)} H`, icon: Plus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Break Time', value: `${stats?.monthly.breakTime.toFixed(2)} H`, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Late Time', value: `${stats?.monthly.lateTime} H`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: "Total Leave's", value: `${stats?.monthly.totalLeaves} days`, icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{item.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Total Leave Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <ClipboardList size={20} className="text-blue-600" />
              Total Leave
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-bold text-sm tracking-wide uppercase">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">SL</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Leave Category</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Days</th>
                </tr>
              </thead>
              <tbody>
                {stats?.leaveList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">No leave records found</td>
                  </tr>
                ) : (
                  stats?.leaveList.slice(0, 5).map((leave, idx) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">{idx + 1}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900 border-b border-slate-50">{leave.leave_type}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">
                        {format(new Date(leave.start_date), 'dd MMM yy')} - {format(new Date(leave.end_date), 'dd MMM yy')}
                      </td>
                      <td className="px-8 py-4 border-b border-slate-50">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                          leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900 border-b border-slate-50">{leave.total_days}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Month Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Current Month
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="text-blue-600">{stats?.attendanceList.length} Days In Time</span>
              <span className="text-rose-600">{stats?.monthly.lateTime} Days Late Time</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">SL</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">In Time</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Out Time</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Break Time</th>
                </tr>
              </thead>
              <tbody>
                {stats?.attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">No attendance records found</td>
                  </tr>
                ) : (
                  stats?.attendanceList.slice(0, 5).map((att, idx) => (
                    <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">{idx + 1}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900 border-b border-slate-50">{format(new Date(att.date), 'MMMM d, yyyy')}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">
                        {att.check_in_time ? format(new Date(att.check_in_time), 'h:mm a') : '--:--'}
                      </td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">
                        {att.check_out_time ? format(new Date(att.check_out_time), 'h:mm a') : '--:--'}
                      </td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">
                        {att.break_duration_minutes > 0 ? `${att.break_duration_minutes} min` : 'No Break'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Calendar and Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Widget */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Attendance Calendar</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-black uppercase tracking-widest w-32 text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
            {calendarDays().map((day, idx) => {
              const att = stats?.attendanceList.find(a => isSameDay(new Date(a.date), day));
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx} 
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all relative group cursor-pointer ${
                    !isCurrentMonth ? 'opacity-20 border-transparent' : 
                    isToday ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className={`text-xs font-black ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                    {format(day, 'd')}
                  </span>
                  {att && (
                    <div className={`w-1.5 h-1.5 rounded-full ${att.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  )}
                  {att && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <p className="font-bold">{att.status}</p>
                      <p className="opacity-70">In: {att.check_in_time ? format(new Date(att.check_in_time), 'h:mm a') : '--'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">My Notes</h2>
            <button 
              onClick={() => {
                setEditingNoteId(null);
                setNewNote({ title: '', content: '' });
                setShowNoteModal(true);
              }}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {stats?.notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 py-12">
                <StickyNote size={48} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-widest">No notes yet</p>
              </div>
            ) : (
              stats?.notes.map(note => (
                <div key={note.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group relative">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight pr-12">{note.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(note.date), 'MMM d')}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{note.content}</p>
                  
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 rounded-lg bg-white text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg bg-white text-rose-600 shadow-sm hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNoteModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                  {editingNoteId ? 'Edit Note' : 'Add New Note'}
                </h3>
                <button 
                  onClick={() => {
                    setShowNoteModal(false);
                    setEditingNoteId(null);
                  }} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Title</label>
                  <input 
                    type="text" 
                    value={newNote.title}
                    onChange={e => setNewNote({...newNote, title: e.target.value})}
                    placeholder="Note title..."
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Content</label>
                  <textarea 
                    rows={4}
                    value={newNote.content}
                    onChange={e => setNewNote({...newNote, content: e.target.value})}
                    placeholder="Write your note here..."
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all resize-none"
                  />
                </div>
                <button 
                  onClick={handleAddNote}
                  className="w-full py-4 bg-blue-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaveModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Apply for Leave</h3>
                <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Leave Type</label>
                  <select 
                    value={newLeave.leave_type}
                    onChange={e => setNewLeave({...newLeave, leave_type: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                  >
                    <option>Annual Leave</option>
                    <option>Sick Leave</option>
                    <option>Maternity Leave</option>
                    <option>Paternity Leave</option>
                    <option>Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Date</label>
                    <input 
                      type="date" 
                      value={newLeave.start_date}
                      onChange={e => setNewLeave({...newLeave, start_date: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">End Date</label>
                    <input 
                      type="date" 
                      value={newLeave.end_date}
                      onChange={e => setNewLeave({...newLeave, end_date: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reason</label>
                  <textarea 
                    rows={3}
                    value={newLeave.reason}
                    onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                    placeholder="Reason for leave..."
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all resize-none"
                  />
                </div>
                <button 
                  onClick={handleApplyLeave}
                  className="w-full py-4 bg-emerald-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Consent Modal */}
      <AnimatePresence>
        {showConsentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Time Tracking Enabled</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">Please review the tracking policy</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4 text-sm text-slate-600 font-medium">
                  <p>Your company has enabled time tracking for your account. When active, the system will monitor:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Activity size={12} className="text-slate-600" />
                      </div>
                      <span><strong>Active Time:</strong> Measured by mouse movement and keyboard activity.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Keyboard size={12} className="text-slate-600" />
                      </div>
                      <span><strong>Activity Levels:</strong> Counts of keystrokes and mouse clicks (actual keys typed are <strong>never</strong> recorded).</span>
                    </li>
                    {settings?.screenshot_enabled && (
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Monitor size={12} className="text-slate-600" />
                        </div>
                        <span><strong>Screenshots:</strong> Captured automatically every {settings.screenshot_interval} minutes. Sensitive fields (like passwords) are blurred.</span>
                      </li>
                    )}
                  </ul>
                  <div className="bg-blue-50 p-4 rounded-2xl mt-6 border border-blue-100">
                    <p className="text-blue-800 text-xs leading-relaxed">
                      <strong>Privacy Note:</strong> Tracking only occurs when you are checked in and the tracker is active. Tracking is automatically managed based on your attendance actions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => handleConsent(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => handleConsent(true)}
                    className="flex-1 py-4 bg-blue-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    I Understand & Agree
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
