import { useState } from 'react';
import { Save, Send, FileText } from 'lucide-react';

interface RequestedItem {
  id: string;
  name: string;
  qty: number;
  reason: string;
}

export default function EmployeeAssetPage() {
  const [items, setItems] = useState<RequestedItem[]>([{ id: '1', name: '', qty: 1, reason: '' }]);
  const [status] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', qty: 1, reason: '' }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof RequestedItem, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <FileText className="text-slate-800" />
          <h1 className="text-2xl font-bold text-slate-800">Request</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors">
            <Save className="w-4 h-4 mr-2" /> Save Request
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Send className="w-4 h-4 mr-2" /> Send to HR
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">STATIONERY & COMPUTER ITEM REQUEST</h2>
        <p className="text-slate-500 text-center mb-8">Submit your request for office supplies or technical equipment</p>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Employee Information</h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Employee Name</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Employee ID</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Department</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Request Details</h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Request Date</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Priority</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option>Normal</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">HR Email (Recipient)</label>
              <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" defaultValue="hr@company.com" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Requested Items</h3>
            <button onClick={addItem} className="text-indigo-600 font-bold flex items-center text-sm hover:text-indigo-700">
              + Add Item
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Item Name / Category</th>
                <th className="px-4 py-3 w-20 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Description / Reason</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-4 py-3"><input type="text" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Wireless Keyboard" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} /></td>
                  <td className="px-4 py-3"><input type="number" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value))} /></td>
                  <td className="px-4 py-3"><input type="text" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Reason for request..." value={item.reason} onChange={(e) => updateItem(item.id, 'reason', e.target.value)} /></td>
                  <td className="px-4 py-3"><button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500">🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-sm mt-8">
          <span className="font-bold text-slate-600 uppercase text-xs">Status:</span>
          <span className={`px-3 py-1 rounded-full font-bold text-xs ${status === 'Pending' ? 'bg-amber-100 text-amber-700' : status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 italic">Note: Once submitted, the HR department will review your request and you will receive an email notification regarding the approval status.</p>
      </div>
    </div>
  );
}
