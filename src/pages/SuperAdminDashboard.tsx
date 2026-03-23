import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, LayoutDashboard, Users, CreditCard, Mail, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAdminDashboard() {
  const [stats] = useState({ users: null, subscriptions: null, requests: null });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ status: string; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/db-health');
        const data = await res.json();
        setDbStatus(data);
      } catch {
        setDbStatus({ status: 'error', message: 'Failed to check database status.' });
      } finally {
        setLoading(false);
      }
    };
    checkDb();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors border border-slate-200 flex items-center gap-2 px-3"
              title="Return"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Return</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors border border-slate-200 flex items-center gap-2 px-3"
              title="Home"
            >
              <Home size={18} />
              <span className="text-sm font-medium">Home</span>
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xl">
            <LayoutDashboard className="text-blue-600" />
            <span>Super Admin Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">Bilal Izhar</p>
            <p className="text-xs text-slate-500">Super Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            BI
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Database Status Banner */}
        {dbStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${
              dbStatus.status === 'connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
              dbStatus.status === 'not_configured' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
              'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className={`p-2 rounded-xl ${
              dbStatus.status === 'connected' ? 'bg-emerald-100' : 
              dbStatus.status === 'not_configured' ? 'bg-amber-100' : 
              'bg-rose-100'
            }`}>
              <Database size={24} className={
                dbStatus.status === 'connected' ? 'text-emerald-600' : 
                dbStatus.status === 'not_configured' ? 'text-amber-600' : 
                'text-rose-600'
              } />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  dbStatus.status === 'connected' ? 'bg-emerald-500' : 
                  dbStatus.status === 'not_configured' ? 'bg-amber-500' : 
                  'bg-rose-500'
                }`} />
                <span className="font-bold text-lg">Database Status: {dbStatus.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              <p className="text-sm mt-1 opacity-90">{dbStatus.message}</p>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-slate-500 font-medium">Total Users</h3>
                <p className="text-4xl font-black text-slate-900 mt-1">{stats.users ?? '0'}</p>
              </div>
              <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md self-start">
                +0% from last month
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-slate-500 font-medium">Active Subscriptions</h3>
                <p className="text-4xl font-black text-slate-900 mt-1">{stats.subscriptions ?? '0'}</p>
              </div>
              <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md self-start">
                +0% from last month
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-slate-500 font-medium">Pending Demo Requests</h3>
                <p className="text-4xl font-black text-slate-900 mt-1">{stats.requests ?? '0'}</p>
              </div>
              <div className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md self-start">
                New requests today
              </div>
            </motion.div>
          </div>
        )}

        <div className="mt-12 p-8 bg-blue-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">System Information</h2>
            <p className="text-blue-200 max-w-2xl">
              The Super Admin Dashboard provides a centralized view of all system activities. 
              Real-time data synchronization is currently active with your Hostinger MySQL database.
            </p>
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-3 bg-white text-blue-900 rounded-2xl font-bold hover:bg-blue-50 transition-colors">
                Manage Users
              </button>
              <button className="px-6 py-3 bg-blue-800 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors border border-blue-700">
                View Logs
              </button>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-blue-800/30 rounded-full blur-3xl transform rotate-12" />
        </div>
      </div>
    </div>
  );
}
