import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

interface ItemRequest {
  id: string;
  employee: string;
  items: string;
  requestDate: string;
}

const initialRequests: ItemRequest[] = [];

export default function ItemRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const filteredRequests = initialRequests.filter(req =>
    req.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.items.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Item Request Received</h1>
          <p className="text-slate-500 text-sm">Dashboard - Assets - Item Request Received</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-end mb-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Request Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{req.employee}</td>
                    <td className="px-6 py-4 text-slate-600">{req.items}</td>
                    <td className="px-6 py-4 text-slate-600">{req.requestDate}</td>
                    <td className="px-6 py-4 text-right">...</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No pending requests received.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
