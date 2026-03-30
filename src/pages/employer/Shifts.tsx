import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, Edit2, Lock, Trash2, Sun, Moon, Users, ArrowLeft, Unlock, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import AddShiftModal from '../../components/employer/AddShiftModal';
import ShiftModal from '../../components/employer/ShiftModal';
import DeleteShiftModal from '../../components/employer/DeleteShiftModal';
import { Shift } from '../../types';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

interface Company {
  id: number;
  name: string;
}

export default function Shifts() {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useOutletContext<{ company?: Company }>();
  const isAdmin = location.pathname.startsWith('/super-admin');
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>(undefined);

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

  const fetchShifts = useCallback(async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const res = await fetchWithRetry(`/api/shifts?company_id=${selectedCompanyId}`);
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetchWithRetry(`/api/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchShifts();
    } catch (error) {
      console.error("Error toggling shift status:", error);
    }
  };

  const deleteShift = async () => {
    if (selectedShift) {
      try {
        const res = await fetchWithRetry(`/api/shifts/${selectedShift.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchShifts();
          setIsDeleteModalOpen(false);
        }
      } catch (error) {
        console.error("Error deleting shift:", error);
      }
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <AddShiftModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          fetchShifts();
        }} 
        companyId={selectedCompanyId}
      />
      <ShiftModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} shift={selectedShift} mode="view" />
      <ShiftModal isOpen={isEditModalOpen} onClose={() => {
        setIsEditModalOpen(false);
        fetchShifts();
      }} shift={selectedShift} mode="edit" />
      <DeleteShiftModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onDelete={deleteShift} shiftName={selectedShift?.name || ''} />
      
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Shifts</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              {isAdmin ? 'Super Admin' : 'Employer'} - Attendance - Shifts
            </p>
          </div>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700">
          <Plus size={16} /> Add Shift
        </button>
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

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Shifts', icon: Users, color: 'text-slate-600', value: shifts.length },
          { label: 'Active Shifts', icon: Sun, color: 'text-emerald-600', value: shifts.filter(s => s.status === 'Active').length },
          { label: 'Night Shifts', icon: Moon, color: 'text-indigo-600', value: shifts.filter(s => s.type === 'Night').length },
          { label: 'Day Shifts', icon: Sun, color: 'text-amber-500', value: shifts.filter(s => s.type === 'Day').length },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
            <stat.icon className={stat.color} size={24} />
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Shifts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.length === 0 ? (
            <div className="col-span-full p-20 text-center text-slate-400 font-bold uppercase tracking-widest">
              No shifts found
            </div>
          ) : (
            shifts.map(shift => (
              <div key={shift.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      {shift.type === 'Night' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-500" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{shift.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">{shift.type} Shift</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${shift.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{shift.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <Eye size={16} className="cursor-pointer hover:text-slate-600" onClick={() => { setSelectedShift(shift); setIsViewModalOpen(true); }} />
                    <Edit2 size={16} className="cursor-pointer hover:text-slate-600" onClick={() => { setSelectedShift(shift); setIsEditModalOpen(true); }} />
                    <div onClick={() => toggleStatus(shift.id, shift.status)} className="cursor-pointer hover:text-slate-600">
                      {shift.status === 'Active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </div>
                    <Trash2 size={16} className="cursor-pointer hover:text-rose-600" onClick={() => { setSelectedShift(shift); setIsDeleteModalOpen(true); }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div><p className="text-slate-500 font-bold">Shift Hours</p><p className="font-bold">{shift.start_time} - {shift.end_time}</p></div>
                  <div><p className="text-slate-500 font-bold">Break Duration</p><p className="font-bold">{shift.break_duration} mins</p></div>
                  <div><p className="text-slate-500 font-bold">Grace Period</p><p className="font-bold">{shift.grace_period} mins</p></div>
                </div>
                <p className="text-xs text-slate-500 font-medium">{shift.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
