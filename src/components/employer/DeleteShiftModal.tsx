interface DeleteShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  shiftName: string;
}

export default function DeleteShiftModal({ isOpen, onClose, onDelete, shiftName }: DeleteShiftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4">Delete shift</h2>
        <p className="text-xs font-bold text-slate-600 mb-6">Are you sure you want to delete {shiftName}? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50">Cancel</button>
          <button onClick={onDelete} className="px-6 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </div>
  );
}
