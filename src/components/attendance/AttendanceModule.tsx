import React, { useState, useEffect, useCallback } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, Download, Plus, FileSpreadsheet, FileText
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'report'>('daily');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
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
      try {
        const res = await fetch(`/api/employees?company_id=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
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
        setShowForm(false);
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
  const totalPresent = attendanceData.filter(a => a.status === 'Present').length;
  const totalAbsent = attendanceData.filter(a => a.status === 'Absent').length;
  const totalLeave = attendanceData.filter(a => a.status === 'Leave').length;
  const totalLate = attendanceData.filter(a => a.is_late).length;
  const totalMissing = employees.length - attendanceData.length;

  const pieData = [
    { name: 'Present', value: totalPresent, color: '#10b981' },
    { name: 'Absent', value: totalAbsent, color: '#ef4444' },
    { name: 'Leave', value: totalLeave, color: '#f59e0b' },
    { name: 'Not Marked', value: totalMissing, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'On Time', count: totalPresent - totalLate },
    { name: 'Late', count: totalLate }
  ];

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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daily Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly View
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Working Hours
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'daily' ? (
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          ) : (
            <input 
              type="month" 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          )}
          
          <div className="flex items-center gap-2">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              title="Export CSV"
            >
              <Download size={16} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-white border border-slate-200 text-emerald-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors"
              title="Export Excel"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-white border border-slate-200 text-rose-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-rose-50 transition-colors"
              title="Export PDF"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={16} />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Daily Dashboard */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Present</p>
                    <h3 className="text-2xl font-black text-slate-900">{totalPresent}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Absent</p>
                    <h3 className="text-2xl font-black text-slate-900">{totalAbsent}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Late</p>
                    <h3 className="text-2xl font-black text-slate-900">{totalLate}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">On Leave</p>
                    <h3 className="text-2xl font-black text-slate-900">{totalLeave}</h3>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Attendance Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Punctuality</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Daily Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Check In</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Check Out</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Selfie</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Late</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyAttendanceView.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">No employees found.</td>
                        </tr>
                      ) : (
                        dailyAttendanceView.map((record) => (
                          <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{record.employee_name}</div>
                              <div className="text-xs text-slate-500">{record.emp_code}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                                record.status === 'Absent' ? 'bg-rose-50 text-rose-600' : 
                                record.status === 'Not Marked' ? 'bg-slate-100 text-slate-500' :
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600">{record.check_in || '-'}</td>
                            <td className="py-4 px-6 text-sm text-slate-600">{record.check_out || '-'}</td>
                            <td className="py-4 px-6">
                              {record.selfie_url ? (
                                <button 
                                  onClick={() => setSelectedSelfie(record.selfie_url || null)}
                                  className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-widest"
                                >
                                  View
                                </button>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {record.is_late ? (
                                <span className="text-rose-600 font-bold text-sm">Yes</span>
                              ) : (
                                <span className="text-slate-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-slate-700">{record.working_hours}h</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Monthly View */}
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Monthly Summary ({monthFilter})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Present</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Absent</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Leaves</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Late Days</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySummary.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">No employees found.</td>
                        </tr>
                      ) : (
                        monthlySummary.map((summary, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-900">{summary.employee}</td>
                            <td className="py-4 px-6 text-emerald-600 font-bold">{summary.present}</td>
                            <td className="py-4 px-6 text-rose-600 font-bold">{summary.absent}</td>
                            <td className="py-4 px-6 text-amber-600 font-bold">{summary.leave}</td>
                            <td className="py-4 px-6 text-slate-600">{summary.late}</td>
                            <td className="py-4 px-6 text-blue-600 font-bold">{summary.totalHours}h</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Working Hours Report */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Working Hours Trend</h3>
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Month Summary</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500 uppercase">Working Days</span>
                      <span className="text-xl font-black text-slate-900">{workingDaysInMonth}</span>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl flex justify-between items-center">
                      <span className="text-sm font-bold text-blue-600 uppercase">Total Logged Hours</span>
                      <span className="text-xl font-black text-blue-700">
                        {attendanceData.reduce((sum, r) => sum + Number(r.working_hours || 0), 0).toFixed(0)}h
                      </span>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl flex justify-between items-center">
                      <span className="text-sm font-bold text-amber-600 uppercase">Total Overtime</span>
                      <span className="text-xl font-black text-amber-700">
                        {attendanceData.reduce((sum, r) => sum + Number(r.overtime_hours || 0), 0).toFixed(0)}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Employee Hours Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Days Present</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Missing Days</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hours</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Overtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeHoursSummary.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">No employees found.</td>
                        </tr>
                      ) : (
                        employeeHoursSummary.map((emp) => (
                          <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{emp.name}</div>
                              <div className="text-xs text-slate-500">{emp.code}</div>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-emerald-600">{emp.daysPresent}</td>
                            <td className="py-4 px-6">
                              {emp.missingDays > 0 ? (
                                <span className="text-rose-600 font-bold text-sm bg-rose-50 px-2 py-1 rounded-md">{emp.missingDays}</span>
                              ) : (
                                <span className="text-slate-400 text-sm">0</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-slate-700">{emp.totalHours}h</td>
                            <td className="py-4 px-6 text-sm font-bold text-amber-600">{emp.totalOvertime > "0.00" ? `${emp.totalOvertime}h` : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Manual Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mark Attendance</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee</label>
                <select 
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              {formData.status !== 'Absent' && formData.status !== 'Leave' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check In</label>
                      <input 
                        type="time" 
                        name="check_in"
                        value={formData.check_in}
                        onChange={handleFormChange}
                        required={formData.status === 'Present'}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check Out</label>
                      <input 
                        type="time" 
                        name="check_out"
                        value={formData.check_out}
                        onChange={handleFormChange}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Break Time (Minutes)</label>
                    <input 
                      type="number" 
                      name="break_time"
                      value={formData.break_time}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-black tracking-widest uppercase rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {formLoading ? 'SAVING...' : 'SAVE RECORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selfie Modal */}
      {selectedSelfie && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={() => setSelectedSelfie(null)}>
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedSelfie(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2 transition-colors z-10"
            >
              <XCircle size={24} />
            </button>
            <img src={selectedSelfie} alt="Attendance Selfie" className="w-full h-auto" referrerPolicy="no-referrer" />
            <div className="p-6 bg-white">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Attendance Verification</h3>
              <p className="text-slate-500 text-sm mt-1">Selfie captured during check-in for identity verification.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
