import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import AssetTypeModal from '../../components/employer/AssetTypeModal';

interface AssetType {
  id: string;
  name: string;
}

const initialAssetTypes: AssetType[] = [
  { id: '1', name: 'Projector' },
  { id: '2', name: 'Printer' },
  { id: '3', name: 'Software License' },
];

export default function AssetTypes() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(initialAssetTypes);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAssetType, setEditingAssetType] = useState<AssetType | null>(null);
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const filteredAssetTypes = assetTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: { name: string }) => {
    setAssetTypes([...assetTypes, { id: Date.now().toString(), ...data }]);
  };

  const handleEdit = (id: string, data: { name: string }) => {
    setAssetTypes(assetTypes.map(a => a.id === id ? { id, ...data } : a));
  };

  const handleDelete = (id: string) => {
    setAssetTypes(assetTypes.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Asset Types</h1>
          <p className="text-slate-500 font-medium">Manage different types of company assets.</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Asset Type
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search By Name"
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssetTypes.map((type) => (
                <tr key={type.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{type.name}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingAssetType(type)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(type.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <AssetTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Asset Type"
        onSave={handleAdd}
      />
      {editingAssetType && (
        <AssetTypeModal
          isOpen={!!editingAssetType}
          onClose={() => setEditingAssetType(null)}
          title="Edit Asset Type"
          initialData={editingAssetType}
          onSave={(data) => handleEdit(editingAssetType.id, data)}
        />
      )}
    </div>
  );
}
