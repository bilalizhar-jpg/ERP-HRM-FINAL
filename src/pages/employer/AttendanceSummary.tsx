import { useState, useEffect, useCallback, ReactNode } from 'react';
import { ChevronDown, Loader2, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { AttendanceRecord } from '../../types';

interface Employee {
  id: number;
  name: string;
  designation: string;
  emp_code: string;
  attendance: Record<string, string>;
}

interface Company {
  id: number;
  name: string;
}

const statusIcons: Record<string, ReactNode> = {
  Present: <span className="text-emerald-600 font-bold">✓</span>,
  Absent: <span className="text-rose-600 font-bold">×</span>,
  'On Leave': <span className="text-orange-500 font-bold">🚗</span>,
  'Half Day': <span className="text-rose-500 font-bold">★</span>,
  Holiday: <span className="text-emerald-800 font-bold">📅</span>,
};

export default function AttendanceSummary() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const context = useOutletContext<{ company?: Company }>();
  const isAdmin = location.pathname.startsWith('/super-admin');

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  useEffect(() => {
    if (isAdmin) {
      fetchWithRetry('/api/companies')
        .then(res => res.json())
        .then(data => {
          setCompanies(data);
          if (data.length > 0) setSelectedCompanyId(data[0].id);
        });
    } else if (context?.company) {
      setSelectedCompanyId(context.company.id);
    }
  }, [isAdmin, context]);

  const fetchData = useCallback(async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const start = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const end = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      
      const [empRes, attRes] = await Promise.all([
        fetchWithRetry(`/api/employees?company_id=${selectedCompanyId}`),
        fetchWithRetry(`/api/attendance?company_id=${selectedCompanyId}&start=${start}&end=${end}`)
      ]);

      if (empRes.ok && attRes.ok) {
        const empData = await empRes.json();
        const attData = await attRes.json();

        const processedEmployees = empData.map((emp: Employee) => {
          const empAttendance: Record<string, string> = {};
          attData.filter((a: AttendanceRecord) => a.employee_id === emp.id).forEach((a: AttendanceRecord) => {
            const day = parseInt(a.date.split('-')[2]);
            empAttendance[day] = a.status;
          });
          return {
            ...emp,
            attendance: empAttendance
          };
        });
        setEmployees(processedEmployees);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, selectedMonth, selectedYear, daysInMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Attendance Summary</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {isAdmin ? 'Super Admin' : 'Employer'} - Attendance - Attendance Summary
          </p>
        </div>
      </header>

      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-2 block">Select Company</label>
          <select 
            className="w-full max-w-md py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCompanyId || ''}
            onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-wrap gap-4 items-center mb-6 text-[10px] font-bold text-slate-600 uppercase">
          <span className="flex items-center gap-1 text-rose-500">★ Half Day</span>
          <span className="flex items-center gap-1 text-rose-600">× Absent</span>
          <span className="flex items-center gap-1 text-orange-500">🚗 On Leave</span>
          <span className="flex items-center gap-1 text-emerald-600">✓ Present</span>
          <span className="flex items-center gap-1 text-emerald-800">📅 Holiday</span>
        </div>

        <div className="flex gap-4">
          <div className="relative w-40">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold appearance-none"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-slate-400" size={16} />
          </div>
          <div className="relative w-40">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold appearance-none"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Summary...</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4 min-w-[200px]">Employees</th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th key={i} className="p-2 text-center w-8 border-l border-slate-200">{String(i + 1).padStart(2, '0')}</th>
                ))}
                <th className="p-4 border-l border-slate-200">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 2} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {emp.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-indigo-700">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.emp_code}</p>
                      </div>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const status = emp.attendance[day];
                      return (
                        <td key={i} className="p-2 text-center border-l border-slate-100">
                          {status ? statusIcons[status] || '-' : '-'}
                        </td>
                      );
                    })}
                    <td className="p-4 font-bold text-slate-700 text-center border-l border-slate-100">
                      {Object.values(emp.attendance).filter(s => s === 'Present').length}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
