import React, { useState, useEffect, useCallback } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { 
  Settings, Plus, Calendar, Search, Download, FileSpreadsheet, FileText, XCircle, ArrowRight, User, Clock, AlertCircle, TrendingUp, CalendarDays, Check, Camera
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Employee {
  id: number;
  name: string;
  employee_id: string;
  department: string;
  designation: string;
}

interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  emp_code: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  break_time: number;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day' | 'Not Marked' | 'On Break' | 'Checked-Out';
  is_late: boolean;
  working_hours: number;
  overtime_hours: number;
  selfie_url?: string | null;
  created_at?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  break_duration_minutes?: number;
}

interface AttendanceModuleProps {
  companyId: number;
}

export default function AttendanceModule({ companyId }: AttendanceModuleProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Attendance form');
  
  // Form State
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    break_time: 0,
    status: 'Present',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);

  // Config
  const OFFICE_START_TIME = '09:00';
  const STANDARD_WORKING_HOURS = 8;

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/employees?company_id=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [companyId]);

  const fetchDailyAttendance = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?company_id=${companyId}&date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchMonthlyAttendance = useCallback(async (month: string) => {
    setLoading(true);
    try {
      // Get first and last day of the month
      const [year, m] = month.split('-');
      const start = `${year}-${m}-01`;
      const lastDay = new Date(parseInt(year), parseInt(m), 0).getDate();
      const end = `${year}-${m}-${lastDay}`;
      
      const res = await fetch(`/api/attendance?company_id=${companyId}&start=${start}&end=${end}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
      }
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyAttendance(selectedDate);
    } else if (activeTab === 'monthly' || activeTab === 'report') {
      fetchMonthlyAttendance(monthFilter);
    }
  }, [activeTab, selectedDate, monthFilter, fetchDailyAttendance, fetchMonthlyAttendance]);

  const calculateHours = (checkIn: string, checkOut: string, breakMins: number) => {
    if (!checkIn || !checkOut) return { workingHours: 0, overtime: 0, isLate: false };
    
    const inTime = new Date(`2000-01-01T${checkIn}`);
    const outTime = new Date(`2000-01-01T${checkOut}`);
    const startTime = new Date(`2000-01-01T${OFFICE_START_TIME}`);
    
    const diffMs = outTime.getTime() - inTime.getTime();
    const diffMins = Math.floor(diffMs / 60000) - breakMins;
    const workingHours = Math.max(0, diffMins / 60);
    
    const isLate = inTime.getTime() > startTime.getTime();
    const overtime = Math.max(0, workingHours - STANDARD_WORKING_HOURS);
    
    return {
      workingHours: Number(workingHours.toFixed(2)),
      overtime: Number(overtime.toFixed(2)),
      isLate
    };
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const { workingHours, overtime, isLate } = calculateHours(formData.check_in, formData.check_out, Number(formData.break_time));
      
      const payload = {
        ...formData,
        company_id: companyId,
        is_late: isLate,
        working_hours: workingHours,
        overtime_hours: overtime
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Refresh data
        if (activeTab === 'daily') {
          fetchDailyAttendance(selectedDate);
        } else {
          fetchMonthlyAttendance(monthFilter);
        }
        // Reset form
        setFormData({
          employee_id: '',
          date: new Date().toISOString().split('T')[0],
          check_in: '',
          check_out: '',
          break_time: 0,
          status: 'Present',
        });
      } else {
        alert("Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Error saving attendance");
    } finally {
      setFormLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Employee', 'Date', 'Status', 'Check In', 'Check Out', 'Break (mins)', 'Working Hours', 'Late'];
    const csvContent = [
      headers.join(','),
      ...attendanceData.map(row => [
        `"${row.employee_name}"`,
        row.date.split('T')[0],
        row.status,
        row.check_in || '-',
        row.check_out || '-',
        row.break_time,
        row.working_hours,
        row.is_late ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${activeTab === 'daily' ? selectedDate : monthFilter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const data = attendanceData.map(r => ({
      'Employee': r.employee_name,
      'Code': r.emp_code,
      'Date': r.date.split('T')[0],
      'Check In': r.check_in || '',
      'Check Out': r.check_out || '',
      'Status': r.status,
      'Late': r.is_late ? 'Yes' : 'No',
      'Working Hours': r.working_hours,
      'Overtime': r.overtime_hours
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${activeTab === 'daily' ? selectedDate : monthFilter}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.text(`Attendance Report - ${activeTab === 'daily' ? selectedDate : monthFilter}`, 14, 15);
    
    const tableColumn = ['Employee', 'Code', 'Date', 'Check In', 'Check Out', 'Status', 'Hours'];
    const tableRows = attendanceData.map(r => [
      r.employee_name,
      r.emp_code,
      r.date.split('T')[0],
      r.check_in || '-',
      r.check_out || '-',
      r.status,
      r.working_hours
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`attendance_${activeTab === 'daily' ? selectedDate : monthFilter}.pdf`);
  };

  // Merge employees with attendance data for daily view
  const dailyAttendanceView = employees.map(emp => {
    const records = attendanceData.filter(a => a.employee_id === emp.id);
    if (records.length > 0) {
      const sortedByCreated = [...records].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      const sortedByCheckIn = [...records].filter(r => r.check_in_time).sort((a, b) => new Date(a.check_in_time!).getTime() - new Date(b.check_in_time!).getTime());
      const sortedByCheckOut = [...records].filter(r => r.check_out_time).sort((a, b) => new Date(b.check_out_time!).getTime() - new Date(a.check_out_time!).getTime());

      return {
        ...sortedByCreated[0],
        working_hours: records.reduce((sum, r) => sum + Number(r.working_hours || 0), 0),
        break_duration_minutes: records.reduce((sum, r) => sum + Number(r.break_duration_minutes || 0), 0),
        status: sortedByCreated[0].status,
        check_in_time: sortedByCheckIn.length > 0 ? sortedByCheckIn[0].check_in_time : null,
        check_out_time: sortedByCheckOut.length > 0 ? sortedByCheckOut[sortedByCheckOut.length - 1].check_out_time : null,
      };
    }
    
    // Return a dummy record for missing attendance
    return {
      id: `missing-${emp.id}`,
      employee_id: emp.id,
      employee_name: emp.name,
      emp_code: emp.employee_id,
      date: selectedDate,
      check_in: null,
      check_out: null,
      break_time: 0,
      status: 'Not Marked',
      is_late: false,
      working_hours: 0,
      overtime_hours: 0,
      selfie_url: null
    };
  });

  // Calculate working days in the selected month
  const getWorkingDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    let days = 0;
    while (date.getMonth() === parseInt(month) - 1) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) { // Exclude Sunday (0) and Saturday (6)
        days++;
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const workingDaysInMonth = getWorkingDaysInMonth(monthFilter);

  // Calculate Employee Working Hours Summary
  const employeeHoursSummary = employees.map(emp => {
    const empRecords = attendanceData.filter(a => a.employee_id === emp.id);
    const totalHours = empRecords.reduce((sum, r) => sum + Number(r.working_hours || 0), 0);
    const totalOvertime = empRecords.reduce((sum, r) => sum + Number(r.overtime_hours || 0), 0);
    const daysPresent = empRecords.filter(r => r.status === 'Present').length;
    const daysAbsent = empRecords.filter(r => r.status === 'Absent').length;
    const daysLeave = empRecords.filter(r => r.status === 'Leave').length;
    const daysHalfDay = empRecords.filter(r => r.status === 'Half Day').length;
    const daysMarked = daysPresent + daysAbsent + daysLeave + daysHalfDay;
    const missingDays = Math.max(0, workingDaysInMonth - daysMarked);

    return {
      id: emp.id,
      name: emp.name,
      code: emp.employee_id,
      totalHours: totalHours.toFixed(2),
      totalOvertime: totalOvertime.toFixed(2),
      daysPresent,
      missingDays
    };
  });
  // Monthly Summary Calculations
  const monthlySummary = employees.map(emp => {
    const empRecords = attendanceData.filter(a => a.employee_id === emp.id);
    return {
      employee: emp.name,
      present: empRecords.filter(a => a.status === 'Present').length,
      absent: empRecords.filter(a => a.status === 'Absent').length,
      leave: empRecords.filter(a => a.status === 'Leave').length,
      late: empRecords.filter(a => a.is_late).length,
      totalHours: empRecords.reduce((sum, a) => sum + Number(a.working_hours), 0).toFixed(2)
    };
  });

  return (
    <div className="space-y-10">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Attendance Protocol</h1>
          <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Monitor and manage workforce presence</p>
          
          <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {['Attendance form', 'Daily status', 'Monthly attendance', 'Working hours report', 'Missing attendance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Calendar size={14} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            {activeTab === 'daily' || activeTab === 'Attendance form' || activeTab === 'Daily status' ? (
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full sm:w-48"
              />
            ) : (
              <input 
                type="month" 
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full sm:w-48"
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={exportToCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white border border-slate-100 text-slate-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group"
              title="Export CSV"
            >
              <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              CSV
            </button>
            <button 
              onClick={exportToExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white border border-slate-100 text-emerald-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm group"
              title="Export Excel"
            >
              <FileSpreadsheet size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              Excel
            </button>
            <button 
              onClick={exportToPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white border border-slate-100 text-rose-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm group"
              title="Export PDF"
            >
              <FileText size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-50 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Synchronizing Data...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Attendance form */}
          {activeTab === 'Attendance form' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-end bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Manual Entry</h2>
                  <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Log attendance records manually</p>
                </div>
                <div className="flex gap-4">
                  <button className="flex items-center gap-3 px-6 py-4 bg-white text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100 shadow-sm">
                    <Settings size={14} strokeWidth={3} />
                    Configuration
                  </button>
                  <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group">
                    <Plus size={14} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                    Bulk Import
                  </button>
                </div>
              </div>

              <div className="p-10">
                <form onSubmit={handleSubmit} className="max-w-4xl space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <User size={12} className="text-blue-500" />
                        Target Employee
                      </label>
                      <select 
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleFormChange}
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                      >
                        <option value="">Select Employee Profile</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} — {emp.employee_id}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <CalendarDays size={12} className="text-blue-500" />
                        Log Date
                      </label>
                      <input 
                        type="date" 
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={12} className="text-emerald-500" />
                        Check-In Time
                      </label>
                      <input 
                        type="time" 
                        name="check_in"
                        value={formData.check_in}
                        onChange={handleFormChange}
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={12} className="text-rose-500" />
                        Check-Out Time
                      </label>
                      <input 
                        type="time" 
                        name="check_out"
                        value={formData.check_out}
                        onChange={handleFormChange}
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <AlertCircle size={14} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Fields marked with * are mandatory for system integrity</p>
                    </div>
                    <button 
                      type="submit"
                      disabled={formLoading}
                      className="px-12 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-3 group"
                    >
                      {formLoading ? 'Processing...' : 'Commit Record'}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Daily status */}
          {activeTab === 'Daily status' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-end bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Daily Status</h2>
                  <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Real-time presence monitoring</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search Workforce..." 
                      className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-72 transition-all shadow-sm" 
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24">SL</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Login</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logout</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyAttendanceView.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-10 py-20 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-4">
                              <Search size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No records found for this date</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dailyAttendanceView.map((record, index) => (
                        <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-10 py-8 text-xs text-slate-400 font-black">{(index + 1).toString().padStart(2, '0')}</td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px] border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                {record.employee_name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{record.employee_name}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{record.emp_code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{record.check_in || '—'}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{record.check_out || '—'}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                              {record.working_hours}H
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border shadow-sm ${
                              record.status === 'Present' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : record.status === 'Absent'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex justify-end gap-2">
                              {record.selfie_url && (
                                <button 
                                  onClick={() => setSelectedSelfie(record.selfie_url!)}
                                  className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100 hover:border-blue-600 shadow-sm"
                                  title="View Verification Selfie"
                                >
                                  <Camera size={14} strokeWidth={2.5} />
                                </button>
                              )}
                              <button className="w-10 h-10 bg-white text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all border border-slate-100 hover:border-slate-900 shadow-sm">
                                <Settings size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly attendance */}
          {activeTab === 'Monthly attendance' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-end bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Monthly Summary</h2>
                  <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Aggregate performance for {monthFilter}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Present</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Absent</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Leaves</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Late Days</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlySummary.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-10 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No aggregate data available</td>
                      </tr>
                    ) : (
                      monthlySummary.map((summary, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-10 py-8">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{summary.employee}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-emerald-600 font-black text-xs">{summary.present}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-rose-600 font-black text-xs">{summary.absent}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-amber-600 font-black text-xs">{summary.leave}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-slate-400 font-black text-xs">{summary.late}</span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                              {summary.totalHours}H
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Working hours report */}
          {activeTab === 'Working hours report' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Hours Trend</h3>
                      <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-[0.3em]">Visualizing workforce productivity</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceData.reduce((acc: { date: string; hours: number }[], curr) => {
                        const date = curr.date.split('T')[0];
                        const existing = acc.find(item => item.date === date);
                        if (existing) {
                          existing.hours += Number(curr.working_hours);
                        } else {
                          acc.push({ date, hours: Number(curr.working_hours) });
                        }
                        return acc;
                      }, []).sort((a, b) => a.date.localeCompare(b.date))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '1rem', 
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '10px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="hours" 
                          stroke="#3b82f6" 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} 
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-10 text-center">Metrics</h3>
                  <div className="space-y-6">
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Working Days</span>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">{workingDaysInMonth}</span>
                    </div>
                    <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 group hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all duration-500">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-2">Total Logged</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-blue-600 tracking-tighter">
                          {attendanceData.reduce((sum, r) => sum + Number(r.working_hours || 0), 0).toFixed(0)}
                        </span>
                        <span className="text-xl font-black text-blue-400 uppercase tracking-tighter">HRS</span>
                      </div>
                    </div>
                    <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 group hover:bg-white hover:shadow-xl hover:shadow-amber-100 transition-all duration-500">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] block mb-2">Overtime</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-amber-600 tracking-tighter">
                          {attendanceData.reduce((sum, r) => sum + Number(r.overtime_hours || 0), 0).toFixed(0)}
                        </span>
                        <span className="text-xl font-black text-amber-400 uppercase tracking-tighter">HRS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Breakdown</h2>
                  <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Individual performance metrics</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Days Present</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Missing Days</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Hours</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Overtime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employeeHoursSummary.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-10 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No breakdown data available</td>
                        </tr>
                      ) : (
                        employeeHoursSummary.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-10 py-8">
                              <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{emp.name}</div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{emp.code}</div>
                            </td>
                            <td className="px-10 py-8">
                              <span className="text-emerald-600 font-black text-xs">{emp.daysPresent}</span>
                            </td>
                            <td className="px-10 py-8">
                              {emp.missingDays > 0 ? (
                                <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100">{emp.missingDays} Days</span>
                              ) : (
                                <span className="text-slate-300 font-black text-xs">—</span>
                              )}
                            </td>
                            <td className="px-10 py-8">
                              <span className="text-slate-700 font-black text-xs">{emp.totalHours}H</span>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                {emp.totalOvertime > "0.00" ? `${emp.totalOvertime}H` : '0H'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Missing attendance */}
          {activeTab === 'Missing attendance' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              {dailyAttendanceView.filter(r => r.status === 'Not Marked').length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-8">
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">Perfect Compliance</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">All workforce records are synchronized and up to date</p>
                </div>
              ) : (
                <>
                  <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Missing Records</h2>
                    <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.3em]">Workforce members with pending attendance logs</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dailyAttendanceView.filter(r => r.status === 'Not Marked').map((record) => {
                          const emp = employees.find(e => e.id === record.employee_id);
                          return (
                            <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                              <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px] border border-slate-100 group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-100 transition-all">
                                    {record.employee_name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{record.employee_name}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{record.emp_code}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{emp?.department || '—'}</span>
                              </td>
                              <td className="px-10 py-8">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{emp?.designation || '—'}</span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <button 
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, employee_id: record.employee_id.toString() }));
                                    setActiveTab('Attendance form');
                                  }}
                                  className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100 hover:border-rose-600 shadow-sm"
                                >
                                  Mark Now
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selfie Modal */}
      {selectedSelfie && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500" onClick={() => setSelectedSelfie(null)}>
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl max-w-lg w-full relative animate-in zoom-in duration-500" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedSelfie(null)}
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl p-3 transition-all z-10 border border-white/20"
            >
              <XCircle size={24} />
            </button>
            <div className="aspect-square overflow-hidden bg-slate-900">
              <img src={selectedSelfie} alt="Attendance Selfie" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="p-10 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Verified Identity</div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Biometric Check</div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Verification Protocol</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4 leading-relaxed">Visual confirmation captured during the check-in sequence for security and audit purposes.</p>
              
              <button 
                onClick={() => setSelectedSelfie(null)}
                className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
