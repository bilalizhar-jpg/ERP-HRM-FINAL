import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { Plus, Search, Maximize2, Trash2 } from 'lucide-react';
import NoticeModal from '../components/NoticeModal';

interface Notice {
  id: number;
  company_id: number;
  notice_type: string;
  description: string;
  notice_date: string;
  notice_by: string;
  attachment_url: string;
  created_at: string;
}

export default function NoticeBoard({ isAdmin = true }: { isAdmin?: boolean }) {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const [entries, setEntries] = useState('10');
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const companyAdmin = localStorage.getItem('companyAdmin');
    const employee = localStorage.getItem('employee');
    if (companyAdmin) {
      const company = JSON.parse(companyAdmin);
      setCompanyId(Number(company.id));
    } else if (employee) {
      const emp = JSON.parse(employee);
      setCompanyId(Number(emp.company_id));
    }
  }, []);

  const fetchNotices = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/notices?company_id=${companyId}`);
      if (res.ok) {
        const data: Notice[] = await res.json();
        setNotices(data);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSaveNotice = async (notice: Omit<Notice, 'id' | 'company_id' | 'created_at'>) => {
    if (!companyId) return;
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...notice, company_id: companyId })
      });
      if (res.ok) {
        fetchNotices();
      } else {
        alert('Failed to save notice');
      }
    } catch (error) {
      console.error("Error saving notice:", error);
      alert('Error saving notice');
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNotices();
      } else {
        alert('Failed to delete notice');
      }
    } catch (error) {
      console.error("Error deleting notice:", error);
      alert('Error deleting notice');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Notice Board</h1>
            <p className="text-slate-500 font-medium">Manage company announcements and notices.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
              <Maximize2 size={20} />
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Notice list</h2>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={3} />
                Add notice
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
              <span>Show</span>
              <select 
                value={entries}
                onChange={(e) => setEntries(e.target.value)}
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>entries</span>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border-none rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none w-full sm:w-64 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SL</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">NOTICE TYPE</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">DESCRIPTION</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">NOTICE DATE</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">NOTICE BY</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {notices.length > 0 ? notices.map((notice, index) => (
                  <tr key={notice.id} className="border-b border-slate-100">
                    <td className="py-4 px-4 text-sm font-bold text-slate-900">{index + 1}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-900">{notice.notice_type}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{notice.description}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{new Date(notice.notice_date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{notice.notice_by}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">
                      {isAdmin && (
                        <button onClick={() => handleDeleteNotice(notice.id)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium text-sm">
                      No notices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="text-sm font-medium text-slate-500">
              Showing 1 to {notices.length} of {notices.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-200">
                1
              </button>
              <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <NoticeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveNotice}
      />
    </div>
  );
}

