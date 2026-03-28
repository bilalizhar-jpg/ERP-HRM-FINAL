import { X, Calendar as CalendarIcon } from 'lucide-react';

interface AddSalaryAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSalaryAdvanceModal({ isOpen, onClose }: AddSalaryAdvanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Add salary advance</h2>
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
              Employee <span className="text-rose-500">*</span>
            </label>
            <div className="md:col-span-2">
              <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                <option value="">Select employee</option>
                <option value="1">Honorato Imogene Curry Terry</option>
                <option value="2">Maisha Lucy Zamora Gonzales</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-slate-700">
              Amount <span className="text-rose-500">*</span>
            </label>
            <div className="md:col-span-2">
              <input 
                type="number" 
                placeholder="Amount"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Salary Month */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-slate-700">
              Salary month <span className="text-rose-500">*</span>
            </label>
            <div className="md:col-span-2 relative">
              <input 
                type="month" 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Is Active */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <label className="text-sm font-bold text-slate-700 pt-1">
              Is active <span className="text-rose-500">*</span>
            </label>
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="radio" name="status" className="peer sr-only" defaultChecked />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="radio" name="status" className="peer sr-only" />
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
