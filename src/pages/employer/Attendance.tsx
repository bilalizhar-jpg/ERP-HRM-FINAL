import { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Download, FileText, Calendar, Edit2, Trash2, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import AddAttendanceModal from '../../components/employer/AddAttendanceModal';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

interface AttendanceRecord {
  id: string;
  employee_id: number;
  employee_name: string;
  emp_code: string;
  date: string;
  check_in: string;
  check_out: string;
  break_time: string | number;
  status: string;
  is_late: boolean;
  working_hours: number;
  overtime_hours: number;
}

interface Company {
  id: number;
  name: string;
}

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const context = useOutletContext<{ company?: Company }>();
  const isAdmin = location.pathname.startsWith('/super-admin');

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

  const fetchAttendance = useCallback(async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const res = await fetchWithRetry(`/api/attendance?company_id=${selectedCompanyId}`);
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const filteredAttendance = attendance.filter(record => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Present') return record.status === 'Present';
    if (activeTab === 'On Leave') return record.status === 'On Leave';
    if (activeTab === 'Half Days') return record.status === 'Half Day';
    return true;
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <AddAttendanceModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchAttendance();
        }} 
        companyId={selectedCompanyId}
      />
      <header className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Attendance</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {isAdmin ? 'Super Admin' : 'Employer'} - Attendance - Attendance
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

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-800">
          <Plus size={16} /> Add New Attendance
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-800">
          <Upload size={16} /> Import
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-800">
          <Download size={16} /> Export
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-800">
          <FileText size={16} /> Bulk Attendance
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Select Employee</label>
            <div className="relative">
              <select className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold appearance-none">
                <option>All Employees</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Date Range</label>
            <div className="relative">
              <input type="text" placeholder="Start date - End date" className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
              <Calendar className="absolute right-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {['All', 'On Leave', 'Present', 'Half Days'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider ${activeTab === tab ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-slate-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Attendance Data...</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4"><input type="checkbox" /></th>
                <th className="p-4">Employees</th>
                <th className="p-4">Date</th>
                <th className="p-4">Clock In Time</th>
                <th className="p-4">Clock Out Time</th>
                <th className="p-4">Break Time</th>
                <th className="p-4">Total Duration</th>
                <th className="p-4">Is Late</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="p-4"><input type="checkbox" /></td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {record.employee_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-indigo-700">{record.employee_name}</p>
                        <p className="text-[10px] text-slate-500">{record.emp_code}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{record.date}</td>
                    <td className="p-4 font-bold text-slate-700">{record.check_in || '-'}</td>
                    <td className="p-4 font-bold text-slate-700">{record.check_out || '-'}</td>
                    <td className="p-4 font-bold text-slate-700">{record.break_time} mins</td>
                    <td className="p-4 font-bold text-slate-700">{record.working_hours} hrs</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${record.is_late ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {record.is_late ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded flex items-center gap-1 w-max border ${
                        record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        record.status === 'On Leave' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          record.status === 'Present' ? 'bg-emerald-500' :
                          record.status === 'On Leave' ? 'bg-orange-500' :
                          'bg-slate-500'
                        }`}></div> {record.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button className="p-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"><Edit2 size={14} /></button>
                      <button className="p-1.5 bg-rose-50 text-rose-700 rounded hover:bg-rose-100"><Trash2 size={14} /></button>
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
