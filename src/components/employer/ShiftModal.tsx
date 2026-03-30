import { useState, useEffect } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';
import { Shift } from '../../types';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift?: Shift;
  mode: 'view' | 'edit';
}

export default function ShiftModal({ isOpen, onClose, shift, mode }: ShiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '09:00',
    end_time: '18:00',
    break_duration: 60,
    grace_period: 15,
    type: 'Day',
    status: 'Active'
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || '',
        description: shift.description || '',
        start_time: shift.start_time || '09:00',
        end_time: shift.end_time || '18:00',
        break_duration: shift.break_duration || 60,
        grace_period: shift.grace_period || 15,
        type: shift.type || 'Day',
        status: shift.status || 'Active'
      });
    }
  }, [shift]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSubmit = async () => {
    if (!shift) return;
    setLoading(true);
    try {
      const res = await fetchWithRetry(`/api/shifts/${shift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating shift:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">
            {isView ? 'View Shift' : 'Edit Shift'}
          </h2>
          <X className="cursor-pointer text-slate-500" onClick={onClose} size={20} />
        </div>

        <div className="space-y-4 mb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Shift Name *</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isView}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
            <textarea 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold h-20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isView}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Start Time *</label>
              <div className="relative">
                <input 
                  type="time" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  disabled={isView}
                />
                <Clock className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">End Time *</label>
              <div className="relative">
                <input 
                  type="time" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  disabled={isView}
                />
                <Clock className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Break Duration (minutes) *</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              value={formData.break_duration}
              onChange={(e) => setFormData({ ...formData, break_duration: Number(e.target.value) })}
              disabled={isView}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Grace Period (minutes) *</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              value={formData.grace_period}
              onChange={(e) => setFormData({ ...formData, grace_period: Number(e.target.value) })}
              disabled={isView}
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-4 h-4"
              checked={formData.type === 'Night'}
              onChange={(e) => setFormData({ ...formData, type: e.target.checked ? 'Night' : 'Day' })}
              disabled={isView}
            />
            <label className="text-xs font-bold text-slate-700">Night Shift</label>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={isView}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50">
            {isView ? 'Close' : 'Cancel'}
          </button>
          {!isView && (
            <button 
              onClick={handleSubmit} 
              disabled={loading || !formData.name}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
