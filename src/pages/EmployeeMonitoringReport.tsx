import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Monitor, 
  Globe, 
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const timelineData = [
  { time: '09:00', productive: 45, unproductive: 5, idle: 10 },
  { time: '10:00', productive: 50, unproductive: 0, idle: 10 },
  { time: '11:00', productive: 30, unproductive: 15, idle: 15 },
  { time: '12:00', productive: 10, unproductive: 20, idle: 30 },
  { time: '13:00', productive: 55, unproductive: 0, idle: 5 },
  { time: '14:00', productive: 40, unproductive: 10, idle: 10 },
  { time: '15:00', productive: 45, unproductive: 5, idle: 10 },
  { time: '16:00', productive: 35, unproductive: 15, idle: 10 },
];

const appUsageData = [
  { name: 'VS Code', value: 45, color: '#3b82f6' },
  { name: 'Slack', value: 25, color: '#10b981' },
  { name: 'Chrome', value: 20, color: '#f59e0b' },
  { name: 'Spotify', value: 10, color: '#ef4444' },
];

const websiteUsageData = [
  { name: 'github.com', value: 40, color: '#3b82f6' },
  { name: 'stackoverflow.com', value: 30, color: '#10b981' },
  { name: 'youtube.com', value: 20, color: '#ef4444' },
  { name: 'google.com', value: 10, color: '#f59e0b' },
];

export default function EmployeeMonitoringReport({ isEmployeePortal = false }: { isEmployeePortal?: boolean }) {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('Today');

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        {!isEmployeePortal && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEmployeePortal ? 'My Productivity Report' : 'Employee Detailed Report'}
          </h1>
          <p className="text-slate-500">
            {isEmployeePortal ? 'View your activity and productivity insights' : `Detailed activity analysis for Employee #${employeeId || 'Selected'}`}
          </p>
        </div>
        <div className="ml-auto flex gap-4">
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Clock size={24} />
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Time</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">8h 45m</p>
          <p className="text-xs font-bold text-emerald-600 mt-2">+15m from yesterday</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Monitor size={24} />
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Time</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">7h 15m</p>
          <p className="text-xs font-bold text-emerald-600 mt-2">82% of total time</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock size={24} />
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Idle Time</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">1h 30m</p>
          <p className="text-xs font-bold text-rose-600 mt-2">18% of total time</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl text-white">
              <Monitor size={24} />
            </div>
            <h3 className="text-white/80 text-sm font-bold uppercase tracking-wider">Productivity</h3>
          </div>
          <p className="text-3xl font-bold text-white">88%</p>
          <p className="text-xs font-bold text-blue-100 mt-2">Excellent performance</p>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Activity Timeline</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="productive" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Productive (m)" />
              <Bar dataKey="unproductive" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} name="Unproductive (m)" />
              <Bar dataKey="idle" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Idle (m)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* App Usage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Monitor size={20} className="text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">Application Usage</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-4">
              {appUsageData.map((app, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: app.color }} />
                    <span className="text-sm font-bold text-slate-700">{app.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{app.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Website Usage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Globe size={20} className="text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">Website Usage</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={websiteUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {websiteUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-4">
              {websiteUsageData.map((site, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: site.color }} />
                    <span className="text-sm font-bold text-slate-700">{site.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{site.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
