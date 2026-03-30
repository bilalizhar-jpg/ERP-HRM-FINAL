import { useState, useEffect, useCallback } from 'react';
import { Coffee, LogOut, Download } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Employee, AttendanceRecord } from '../../types';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { format } from 'date-fns';

interface ShiftInfo {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  break_time: number;
}

export default function EmployeeAttendance() {
  const [status, setStatus] = useState('Clocked Out');
  const [loading, setLoading] = useState(true);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [shift, setShift] = useState<ShiftInfo | null>(null);
  const { employee } = useOutletContext<{ employee: Employee | null }>();

  const fetchAttendanceData = useCallback(async () => {
    if (!employee?.id) return;
    try {
      const url = `/api/employee/dashboard/stats?employee_id=${employee.id}&company_id=${employee.company_id}`;
      const res = await fetchWithRetry(url, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceList(data.attendanceList || []);
        setShift(data.shift || null);
        
        // Determine current status based on today's attendance
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = data.attendanceList?.find((a: any) => a.date_str === todayStr || a.date.startsWith(todayStr));
        
        if (todayRecord) {
          if (todayRecord.check_out) {
            setStatus('Clocked Out');
          } else if (todayRecord.status === 'On Break') {
            setStatus('On Break');
          } else {
            setStatus('Clocked In');
          }
        } else {
          setStatus('Clocked Out');
        }
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  }, [employee?.id, employee?.company_id]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const handleAttendanceAction = async (action: 'Clock In' | 'Clock Out' | 'On Break' | 'Break Out') => {
    if (!employee?.id) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceList.find((a: any) => a.date_str === todayStr || a.date.startsWith(todayStr));
    
    let checkIn = todayRecord?.check_in;
    let checkOut = todayRecord?.check_out;
    let newStatus = action === 'Break Out' ? 'Present' : action === 'On Break' ? 'On Break' : action === 'Clock In' ? 'Present' : 'Present';
    
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (action === 'Clock In') {
      // Use shift start time if available, otherwise current time
      checkIn = shift?.start_time ? shift.start_time.substring(0, 5) : currentTimeStr;
    } else if (action === 'Clock Out') {
      checkOut = currentTimeStr;
    }

    try {
      const res = await fetchWithRetry('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: employee.company_id,
          employee_id: employee.id,
          shift_id: shift?.id || null,
          date: todayStr,
          check_in: checkIn,
          check_out: checkOut,
          status: newStatus,
        })
      });
      
      if (res.ok) {
        setStatus(action === 'Break Out' ? 'Clocked In' : action);
        fetchAttendanceData();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  if (!employee || loading) {
    return <div className="p-8">Loading employee data...</div>;
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Attendance</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-black text-slate-900">{employee?.name || 'Employee'}</p>
            <p className="text-xs text-slate-500">{employee?.designation || 'Staff'}</p>
          </div>
          <img 
            src={employee?.profile_picture || '/default-avatar.png'} 
            alt={employee?.name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Attendance Tracker */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-sm font-black text-slate-900 uppercase mb-6">Attendance Tracker</h2>
        <div className="flex items-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Current Status</p>
            <p className="text-lg font-black text-indigo-700">{status}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleAttendanceAction('Clock In')} 
              disabled={status !== 'Clocked Out'}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-emerald-700 disabled:opacity-50"
            >
              Clock In
            </button>
            <button 
              onClick={() => handleAttendanceAction('On Break')} 
              disabled={status !== 'Clocked In'}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase hover:bg-amber-600 disabled:opacity-50"
            >
              <Coffee size={16} />
            </button>
            <button 
              onClick={() => handleAttendanceAction('Break Out')} 
              disabled={status !== 'On Break'}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-indigo-700 disabled:opacity-50"
            >
              Break Out
            </button>
            <button 
              onClick={() => handleAttendanceAction('Clock Out')} 
              disabled={status === 'Clocked Out'}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-rose-700 disabled:opacity-50"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-600">
          Assigned Shift: <span className="text-indigo-600">{shift ? `${shift.name} (${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)})` : 'No Shift Assigned'}</span>
        </div>
      </div>

      {/* Attendance Reports Placeholder */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-slate-900 uppercase">Attendance Reports</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase hover:bg-slate-200">
            <Download size={16} /> Download Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Clock In</th>
                <th className="p-2">Clock Out</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceList.map((record: any, index: number) => (
                <tr key={index}>
                  <td className="p-2">{record.date_str || format(new Date(record.date), 'yyyy-MM-dd')}</td>
                  <td className="p-2">{record.check_in || '-'}</td>
                  <td className="p-2">{record.check_out || '-'}</td>
                  <td className="p-2 text-emerald-600 font-bold">{record.status}</td>
                </tr>
              ))}
              {attendanceList.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
