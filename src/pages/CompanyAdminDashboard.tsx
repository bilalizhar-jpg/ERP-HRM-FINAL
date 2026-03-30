import { useState, useEffect } from 'react';
import { Settings, Users, Calendar, Clock, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { fetchWithRetry } from '../utils/fetchWithRetry';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  pendingLeaves: number;
  totalDepartments: number;
  attendanceTrend: { date: string; count: number }[];
  recentAbsentees: { id: number; name: string; designation: string; department: string }[];
}

const AttendanceChartWidget = ({ data }: { data: { date: string; count: number }[] }) => (
  <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col">
    <div className="flex justify-between items-start mb-8">
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Attendance Trend</h3>
        <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Weekly Activity</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
        <TrendingUp size={20} strokeWidth={3} />
      </div>
    </div>
    <div className="flex-1 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
            tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const AbsenteeListWidget = ({ absentees }: { absentees: { id: number; name: string; designation: string; department: string }[] }) => (
  <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col">
    <div className="flex justify-between items-start mb-8">
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Daily Exception</h3>
        <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Absent Today</p>
      </div>
      <div className="p-3 bg-red-50 rounded-2xl text-red-600">
        <AlertCircle size={20} strokeWidth={3} />
      </div>
    </div>
    <div className="space-y-4 flex-1">
      {absentees.length > 0 ? absentees.map((emp) => (
        <div key={emp.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100">
            {emp.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{emp.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.designation} • {emp.department}</p>
          </div>
        </div>
      )) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest">All employees present</p>
        </div>
      )}
    </div>
  </div>
);

const LeaveSummaryWidget = ({ pending }: { pending: number }) => (
  <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col">
    <div className="flex justify-between items-start mb-8">
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Workflow Status</h3>
        <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Leave Requests</p>
      </div>
      <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
        <Calendar size={20} strokeWidth={3} />
      </div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
      <div className="text-7xl font-black text-slate-900 tracking-tighter">{pending}</div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Pending Approvals</p>
      <button className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
        Review All
      </button>
    </div>
  </div>
);

export default function CompanyAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyStr = localStorage.getItem('companyAdmin');
        if (companyStr) {
          const company = JSON.parse(companyStr);
          
          // Fetch stats
          const statsRes = await fetchWithRetry(`/api/company-admin/dashboard-stats?company_id=${company.id}`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickStats = [
    { label: 'Total Staff', value: stats?.totalEmployees || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Present', value: stats?.presentToday || 0, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Absent', value: stats?.absentToday || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Departments', value: stats?.totalDepartments || 0, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 font-bold mt-4 uppercase tracking-[0.2em] text-xs">
            Operational Intelligence & Module Reports
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Settings size={16} strokeWidth={3} /> 
          Configure
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-3xl flex items-center justify-center`}>
              <stat.icon size={28} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AttendanceChartWidget data={stats?.attendanceTrend || []} />
        </div>
        <div>
          <LeaveSummaryWidget pending={stats?.pendingLeaves || 0} />
        </div>
        <div className="lg:col-span-3">
          <AbsenteeListWidget absentees={stats?.recentAbsentees || []} />
        </div>
      </div>
    </div>
  );
}
