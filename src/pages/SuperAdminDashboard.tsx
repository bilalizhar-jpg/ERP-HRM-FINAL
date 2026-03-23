import { useState, useEffect } from 'react';

export default function SuperAdminDashboard() {
  const [stats] = useState({ users: null, subscriptions: null, requests: null });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/db-health');
        const data = await res.json();
        setDbStatus(data);
      } catch (error) {
        setDbStatus({ status: 'error', message: 'Failed to check database status.' });
      } finally {
        setLoading(false);
      }
    };
    checkDb();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      
      {dbStatus && (
        <div className={`mb-6 p-4 rounded-xl border ${
          dbStatus.status === 'connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
          dbStatus.status === 'not_configured' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
          'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              dbStatus.status === 'connected' ? 'bg-emerald-500' : 
              dbStatus.status === 'not_configured' ? 'bg-amber-500' : 
              'bg-rose-500'
            }`} />
            <span className="font-semibold">Database Status: {dbStatus.status.replace('_', ' ').toUpperCase()}</span>
          </div>
          <p className="text-sm mt-1 opacity-80">{dbStatus.message}</p>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">Total Users</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.users ?? 'N/A'}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">Active Subscriptions</h3>
            <p className="text-4xl font-bold text-emerald-600 mt-2">{stats.subscriptions ?? 'N/A'}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">Pending Demo Requests</h3>
            <p className="text-4xl font-bold text-amber-600 mt-2">{stats.requests ?? 'N/A'}</p>
          </div>
        </div>
      )}
      <p className="mt-8 text-slate-500 text-sm">
        Note: Real-time data connection to the database is required to populate these statistics.
      </p>
    </div>
  );
}
