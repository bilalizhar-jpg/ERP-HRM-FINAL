import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Printer, Search, Edit2, Trash2, Eye, Laptop, Users, Archive, Wrench } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import AssetModal from '../../components/employer/AssetModal';

interface Asset {
  id: string;
  name: string;
  assignedTo: string;
  assignDate: string;
  purchaseDate: string;
  status: 'Available' | 'Assigned' | 'Maintenance';
  returnDate: string;
  remarks: string;
}

const initialAssets: Asset[] = [
  { id: '1', name: 'Laptop A', assignedTo: 'John Doe', assignDate: '2023-10-01', purchaseDate: '2023-01-01', status: 'Assigned', returnDate: '-', remarks: 'None' },
  { id: '2', name: 'Projector B', assignedTo: '-', assignDate: '-', purchaseDate: '2023-02-01', status: 'Available', returnDate: '-', remarks: 'None' },
];

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: 'TOTAL ASSETS', value: assets.length, icon: Laptop, color: 'bg-blue-600' },
    { title: 'IN USE', value: assets.filter(a => a.status === 'Assigned').length, icon: Users, color: 'bg-emerald-600' },
    { title: 'IN STOCK', value: assets.filter(a => a.status === 'Available').length, icon: Archive, color: 'bg-amber-500' },
    { title: 'UNDER REPAIR', value: assets.filter(a => a.status === 'Maintenance').length, icon: Wrench, color: 'bg-red-600' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Company Asset Management</h1>
          <div className="flex gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Add New Asset
            </button>
            <button className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Printer className="w-4 h-4 mr-2" /> Print Inventory
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by asset name, serial, or employee..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded text-sm">CSV</button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded text-sm">Excel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded text-sm">PDF</button>
              <button className="flex items-center px-4 py-2 border border-slate-300 rounded text-sm text-slate-700">
                <Archive className="w-4 h-4 mr-2" /> Filter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                {['Se No', 'Asset', 'Assigned to Employee', 'Assign Date', 'New', 'Used', 'Purchase Date', 'Status', 'Return Date', 'Action', 'Remarks'].map(h => (
                  <th key={h} className="px-4 py-4 border-r last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, i) => (
                <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">{i + 1}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{asset.name}</td>
                  <td className="px-4 py-4">{asset.assignedTo}</td>
                  <td className="px-4 py-4">{asset.assignDate}</td>
                  <td className="px-4 py-4">-</td>
                  <td className="px-4 py-4">-</td>
                  <td className="px-4 py-4">{asset.purchaseDate}</td>
                  <td className="px-4 py-4">{asset.status}</td>
                  <td className="px-4 py-4">{asset.returnDate}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 bg-indigo-700 text-white rounded"><Eye className="w-3 h-3" /></button>
                      <button className="p-1.5 bg-indigo-700 text-white rounded"><Edit2 className="w-3 h-3" /></button>
                      <button className="p-1.5 bg-indigo-700 text-white rounded"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                  <td className="px-4 py-4">{asset.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <AssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Asset"
        onSave={(data) => setAssets([...assets, { id: Date.now().toString(), ...data, assignedTo: '-', assignDate: '-', returnDate: '-', remarks: '-' } as Asset])}
      />
    </div>
  );
}
