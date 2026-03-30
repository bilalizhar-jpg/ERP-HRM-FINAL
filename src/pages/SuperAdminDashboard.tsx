import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Maximize2, 
  Menu, 
  AlertCircle,
  Database,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { fetchWithRetry } from '../utils/fetchWithRetry';

interface Company {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCompanies: 0, activeCompanies: 0, expiredLicenses: 0 });
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [dbStatus, setDbStatus] = useState<{ 
    status: string; 
    message: string;
    tables?: string[];
    isInitialized?: boolean;
  } | null>(null);

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetchWithRetry('/api/db-health');
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data);
          
          if (data.status === 'connected' && data.isInitialized) {
            // Fetch stats and recent companies
            const [statsRes, companiesRes] = await Promise.all([
              fetchWithRetry('/api/super-admin/stats'),
              fetchWithRetry('/api/super-admin/recent-companies')
            ]);
            
            if (statsRes.ok) setStats(await statsRes.json());
            if (companiesRes.ok) setRecentCompanies(await companiesRes.json());
          }
        }
      } catch {
        setDbStatus({ status: 'error', message: 'Failed to check database status.' });
      } finally {
        setLoading(false);
      }
    };
    checkDb();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search protocol..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <Maximize2 size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">SUPER ADMIN</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SYSTEM ARCHITECT</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                SA
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Section Title */}
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-6">SUPER ADMIN OVERVIEW</p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Companies */}
              <div className="bg-white p-6 rounded-[2rem] flex items-center gap-6 shadow-xl border border-slate-100">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Building2 size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">TOTAL COMPANIES</p>
                  <p className="text-4xl font-black text-slate-900">{stats.totalCompanies}</p>
                </div>
              </div>

              {/* Active Companies */}
              <div className="bg-white p-6 rounded-[2rem] flex items-center gap-6 shadow-xl border border-slate-100">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">ACTIVE COMPANIES</p>
                  <p className="text-4xl font-black text-slate-900">{stats.activeCompanies}</p>
                </div>
              </div>

              {/* License Expired */}
              <div className="bg-white p-6 rounded-[2rem] flex items-center gap-6 shadow-xl border border-slate-100">
                <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">LICENSE EXPIRED</p>
                  <p className="text-4xl font-black text-slate-900">{stats.expiredLicenses}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Companies Section */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
            <div className="p-8 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">RECENT COMPANIES</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase">LIVE FEED</span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase text-left">
                      <th className="pb-6">COMPANY NAME</th>
                      <th className="pb-6">EMAIL</th>
                      <th className="pb-6">STATUS</th>
                      <th className="pb-6 text-right">JOINED DATE</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {recentCompanies.length > 0 ? (
                      recentCompanies.map((company) => (
                        <tr key={company.id} className="border-t border-slate-50 group hover:bg-slate-50 transition-colors">
                          <td className="py-5 text-xs font-bold text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{company.name}</td>
                          <td className="py-5 text-xs font-mono text-slate-500">{company.email}</td>
                          <td className="py-5">
                            <span className={`px-2 py-1 rounded text-[9px] font-black tracking-widest ${
                              company.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {company.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-5 text-xs font-mono text-slate-400 text-right">
                            {new Date(company.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-slate-50">
                        <td colSpan={4} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <Database size={48} className="text-slate-400" />
                            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">NO COMPANIES DETECTED</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Database Status (Floating/Bottom) */}
          {dbStatus && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-3xl border flex items-center justify-between shadow-lg ${
                dbStatus.status === 'connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${dbStatus.status === 'connected' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  <Database size={24} className={dbStatus.status === 'connected' ? 'text-emerald-600' : 'text-rose-600'} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1">Database Connectivity</p>
                  <p className="text-sm opacity-80">{dbStatus.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {dbStatus.status === 'connected' && !dbStatus.isInitialized && (
                  <button 
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const res = await fetchWithRetry('/api/init-db', { method: 'POST' });
                        const data = await res.json();
                        if (data.success) window.location.reload();
                        else alert("Failed to initialize: " + data.message);
                      } catch {
                        alert("Error initializing database");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    Initialize Protocol
                  </button>
                )}
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-white border border-current rounded-xl text-xs font-bold hover:bg-white/50 transition-all"
                >
                  Refresh
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin" />
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Synchronizing Protocol</p>
          </div>
        </div>
      )}
    </div>
  );
}
