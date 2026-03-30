import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { AttendanceRecord } from '../../types';

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number | null;
  initialData?: AttendanceRecord;
}

interface Employee {
  id: number;
  name: string;
}

export default function AddAttendanceModal({ isOpen, onClose, companyId, initialData }: AddAttendanceModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '09:00',
    check_out: '18:00',
    break_in: '',
    break_out: '',
    is_late: false,
    status: 'Present'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        employee_id: initialData.employee_id.toString(),
        date: initialData.date,
        check_in: initialData.check_in || '09:00',
        check_out: initialData.check_out || '18:00',
        break_in: initialData.break_in || '',
        break_out: initialData.break_out || '',
        is_late: !!initialData.is_late,
        status: initialData.status || 'Present'
      });
    } else {
      setFormData({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        check_in: '09:00',
        check_out: '18:00',
        break_in: '',
        break_out: '',
        is_late: false,
        status: 'Present'
      });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen && companyId) {
      setLoading(true);
      fetchWithRetry(`/api/employees?company_id=${companyId}`)
        .then(res => res.json())
        .then(data => {
          setEmployees(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching employees:", err);
          setLoading(false);
        });
    }
  }, [isOpen, companyId]);

  const handleSubmit = async () => {
    if (!formData.employee_id) {
      alert("Please select an employee");
      return;
    }
    setSubmitting(true);
    try {
      const url = initialData ? `/api/attendance/${initialData.id}` : '/api/attendance';
      const method = initialData ? 'PUT' : 'POST';
      
      const res = await fetchWithRetry(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          company_id: companyId
        })
      });
      if (res.ok) {
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || `Failed to ${initialData ? 'update' : 'add'} attendance`);
      }
    } catch (error) {
      console.error(`Error ${initialData ? 'updating' : 'adding'} attendance:`, error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <X className="cursor-pointer" onClick={onClose} size={20} /> {initialData ? 'Edit Attendance' : 'Add New Attendance'}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Employee *</label>
            <div className="flex gap-2">
              <select 
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                disabled={loading || !!initialData}
              >
                <option value="">{loading ? 'Loading...' : 'Select Employee...'}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Date *</label>
            <div className="relative">
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Clock In Time *</label>
            <div className="relative">
              <input 
                type="time" 
                value={formData.check_in}
                onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Clock Out Time *</label>
            <div className="relative">
              <input 
                type="time" 
                value={formData.check_out}
                onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Break In Time</label>
            <div className="relative">
              <input 
                type="time" 
                value={formData.break_in}
                onChange={(e) => setFormData({ ...formData, break_in: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Break Out Time</label>
            <div className="relative">
              <input 
                type="time" 
                value={formData.break_out}
                onChange={(e) => setFormData({ ...formData, break_out: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Is Late</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setFormData({ ...formData, is_late: true })}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold ${formData.is_late ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >Yes</button>
              <button 
                onClick={() => setFormData({ ...formData, is_late: false })}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold ${!formData.is_late ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >No</button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Status *</label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="px-6 py-2 bg-indigo-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={14} />}
            {submitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update' : 'Create')}
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">Cancel</button>
        </div>
      </div>
    </div>
  );
}
