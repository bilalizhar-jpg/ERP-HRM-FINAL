import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { Settings, Plus, Search, FileText, FileSpreadsheet, BarChart3, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Attendance() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const [activeTab, setActiveTab] = useState('Working hours report');
  const tabs = ['Attendance form', 'Daily status', 'Monthly attendance', 'Working hours report', 'Missing attendance'];

  const trendData = [
    { name: 'Mon', hours: 8.5 },
    { name: 'Tue', hours: 9.0 },
    { name: 'Wed', hours: 8.0 },
    { name: 'Thu', hours: 9.5 },
    { name: 'Fri', hours: 8.8 },
    { name: 'Sat', hours: 4.0 },
    { name: 'Sun', hours: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Attendance</h1>
          <p className="text-slate-500 font-medium">Manage and track employee attendance records.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Content based on activeTab */}
        {activeTab === 'Attendance form' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Take attendance</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">
                  <Settings size={14} />
                  Custom field
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all">
                  <Plus size={14} />
                  Bulk insert
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Employee *</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Select one</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Time *</label>
                  <div className="relative">
                    <input type="datetime-local" className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all">
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Daily status' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Daily attendance status</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200">
                  <Settings size={16} />
                  Custom field
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all">
                  <FileSpreadsheet size={16} />
                  Excel
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all">
                  <FileText size={16} />
                  PDF
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Search Employee</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search employee..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custom Range</label>
                <div className="flex items-center gap-2">
                  <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold" />
                  <span className="text-slate-400">-</span>
                  <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold" />
                </div>
              </div>
              <div className="flex items-end">
                <button className="w-full px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-6">SL</th>
                    <th className="p-6">Employee Name</th>
                    <th className="p-6">Login Time</th>
                    <th className="p-6">Logout Time</th>
                    <th className="p-6">Working Hours</th>
                    <th className="p-6">Date</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">No attendance records found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Monthly attendance' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Monthly attendance report</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200">
                  <Settings size={16} />
                  Custom field
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all">
                  <FileSpreadsheet size={16} />
                  Excel
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all">
                  <FileText size={16} />
                  PDF
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Search Employee</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Type employee name..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Month</label>
                <input type="month" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="flex items-end">
                <button className="w-full px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Generate Report
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-6">Employee</th>
                    <th className="p-6">Total Days</th>
                    <th className="p-6">Present</th>
                    <th className="p-6">Absent</th>
                    <th className="p-6">Leave</th>
                    <th className="p-6">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">No records found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Working hours report' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Working hours report</h2>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200">
                    <Settings size={16} />
                    Custom field
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all">
                    <FileSpreadsheet size={16} />
                    Excel
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all">
                    <FileText size={16} />
                    PDF
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Employee</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>All Employees</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Report Type</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Daily</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Date/Month</label>
                  <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                    View Report
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Working Hours Trend */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-8 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" /> Working Hours Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Working Hours Details */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-8">Working Hours Details</h3>
                {[
                  { label: 'TOTAL HOURS (THIS WEEK)', value: '43.8 Hours', color: 'bg-emerald-50 text-emerald-700' },
                  { label: 'AVERAGE DAILY HOURS', value: '8.76 Hours', color: 'bg-blue-50 text-blue-700' },
                  { label: 'OVERTIME HOURS', value: '3.8 Hours', color: 'bg-amber-50 text-amber-700' },
                  { label: 'SHORTFALL HOURS', value: '0.0 Hours', color: 'bg-red-50 text-red-700' },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between p-6 rounded-2xl ${item.color}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    <span className="text-lg font-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Missing attendance' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Missing attendance report</h2>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200">
                <Settings size={16} />
                Custom field
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <CalendarDays className="text-slate-300" size={48} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-2">No missing attendance records found</h3>
              <p className="text-slate-500 font-medium">All employee attendance records are up to date.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
