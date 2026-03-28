import { X } from 'lucide-react';

interface EditSalaryAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    name: string;
    amount: string;
    month: string;
    status: string;
  } | null;
}

export default function EditSalaryAdvanceModal({ isOpen, onClose, data }: EditSalaryAdvanceModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Edit salary advance</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Employee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-slate-700">
              Employee
            </label>
            <div className="md:col-span-2">
              <input 
                type="text" 
                value={data.name}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-slate-700">
              Amount
            </label>
            <div className="md:col-span-2">
              <input 
                type="text" 
                defaultValue={data.amount}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Salary Month */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-slate-700">
              Salary month
            </label>
            <div className="md:col-span-2">
              <input 
                type="text" 
                value={data.month}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-bold text-slate-700 pt-1">
              Is active
            </label>
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="radio" name="edit-status" className="peer sr-only" defaultChecked={data.status === 'Active'} />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="radio" name="edit-status" className="peer sr-only" defaultChecked={data.status === 'Inactive'} />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Inactive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98]"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
