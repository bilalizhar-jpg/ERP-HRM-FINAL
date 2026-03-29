import { useState } from 'react';
import { X } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialData?: { name: string; status: 'Available' | 'Assigned' | 'Maintenance'; purchaseDate: string };
  onSave: (data: { name: string; status: 'Available' | 'Assigned' | 'Maintenance'; purchaseDate: string }) => void;
}

export default function AssetModal({ isOpen, onClose, title, initialData, onSave }: AssetModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [status, setStatus] = useState<'Available' | 'Assigned' | 'Maintenance'>(initialData?.status || 'Available');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Asset Name *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter Asset Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Available' | 'Assigned' | 'Maintenance')}
            >
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => { onSave({ name, status, purchaseDate }); onClose(); }}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {title.includes('Edit') ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
