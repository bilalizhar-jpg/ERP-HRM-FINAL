import { useState } from 'react';
import { 
  Clock, 
  Monitor, 
  Globe, 
  Image as ImageIcon, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  PlayCircle,
  Calendar as CalendarIcon, 
  Download,
  Layout
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

const weeklyData = [
  { day: 'Mon', productive: 7.5, unproductive: 0.5, idle: 0.5 },
  { day: 'Tue', productive: 6.8, unproductive: 1.2, idle: 0.8 },
  { day: 'Wed', productive: 8.0, unproductive: 0.2, idle: 0.3 },
  { day: 'Thu', productive: 7.2, unproductive: 0.8, idle: 0.5 },
  { day: 'Fri', productive: 6.5, unproductive: 1.5, idle: 1.0 },
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

const timelineEvents = [
  { id: 1, time: '09:00 AM', title: 'Clocked In', type: 'start', duration: '', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, time: '09:15 AM', title: 'Productive Session', desc: 'VS Code, Terminal', type: 'productive', duration: '1h 45m', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 3, time: '11:00 AM', title: 'Idle', desc: 'No keyboard/mouse activity', type: 'idle', duration: '15m', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 4, time: '11:15 AM', title: 'Unproductive', desc: 'YouTube, Spotify', type: 'unproductive', duration: '20m', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 5, time: '11:35 AM', title: 'Productive Session', desc: 'Chrome (github.com), Slack', type: 'productive', duration: '1h 25m', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 6, time: '01:00 PM', title: 'Clocked Out (Lunch)', type: 'end', duration: '', icon: PlayCircle, color: 'text-slate-500', bg: 'bg-slate-50' },
];

const timeLogs = [
  { date: '2026-03-29', firstActivity: '09:00 AM', lastActivity: '05:30 PM', totalTime: '8h 30m', activeTime: '7h 15m', productivity: 85 },
  { date: '2026-03-28', firstActivity: '08:45 AM', lastActivity: '05:00 PM', totalTime: '8h 15m', activeTime: '7h 30m', productivity: 92 },
  { date: '2026-03-27', firstActivity: '09:15 AM', lastActivity: '06:00 PM', totalTime: '8h 45m', activeTime: '6h 45m', productivity: 78 },
  { date: '2026-03-26', firstActivity: '09:00 AM', lastActivity: '05:00 PM', totalTime: '8h 00m', activeTime: '7h 00m', productivity: 88 },
  { date: '2026-03-25', firstActivity: '08:50 AM', lastActivity: '05:10 PM', totalTime: '8h 20m', activeTime: '7h 40m', productivity: 95 },
];

const mockScreenshots = [
  { id: 1, time: '10:15 AM', app: 'VS Code', url: 'https://picsum.photos/seed/code1/400/250' },
  { id: 2, time: '10:25 AM', app: 'Chrome (GitHub)', url: 'https://picsum.photos/seed/github/400/250' },
  { id: 3, time: '10:35 AM', app: 'Slack', url: 'https://picsum.photos/seed/slack/400/250' },
  { id: 4, time: '11:15 AM', app: 'YouTube', url: 'https://picsum.photos/seed/youtube/400/250' },
  { id: 5, time: '11:45 AM', app: 'VS Code', url: 'https://picsum.photos/seed/code2/400/250' },
  { id: 6, time: '12:15 PM', app: 'Terminal', url: 'https://picsum.photos/seed/terminal/400/250' },
];

export default function EmployeeMonitoring() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('Today');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'activity', label: 'Activity', icon: Monitor },
    { id: 'logs', label: 'Time Logs', icon: CalendarIcon },
    { id: 'screenshots', label: 'Screenshots', icon: ImageIcon },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Productivity</h1>
          <p className="text-slate-500">View your activity, time logs, and productivity insights</p>
        </div>
        <div className="flex items-center gap-4">
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
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Privacy & Transparency Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0 mt-0.5">
          <Info size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Transparency & Privacy Note</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Your employer is currently tracking your <strong>active time, application usage, and website visits</strong> during your work hours to help measure productivity. Screenshots are <strong>enabled</strong> and taken periodically. This data is only recorded while you are clocked in. You have full access to view everything that is being recorded below.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-slate-200 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
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
                    <Coffee size={24} />
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Idle Time</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">1h 30m</p>
                <p className="text-xs font-bold text-rose-600 mt-2">18% of total time</p>
              </div>

              <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-white/80 text-sm font-bold uppercase tracking-wider">Productivity</h3>
                </div>
                <p className="text-3xl font-bold text-white">88%</p>
                <p className="text-xs font-bold text-blue-100 mt-2">Excellent performance</p>
              </div>
            </div>

            {/* Productivity Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Weekly Productivity Trend</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-500">Productive</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-medium text-slate-500">Unproductive</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium text-slate-500">Idle</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="productive" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Productive (h)" />
                    <Bar dataKey="unproductive" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} name="Unproductive (h)" />
                    <Bar dataKey="idle" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Idle (h)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Today's Activity Timeline</h3>
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative pl-8">
                  <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full ${event.bg} ${event.color} border-4 border-white flex items-center justify-center`}>
                    <event.icon size={14} />
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900">{event.title}</h4>
                      <span className="text-xs font-bold text-slate-400">{event.time}</span>
                    </div>
                    {event.desc && <p className="text-sm text-slate-600 mb-2">{event.desc}</p>}
                    {event.duration && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500">
                        <Clock size={12} />
                        {event.duration}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
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
                        {appUsageData.map((app) => (
                          <Cell key={`cell-${app.name}`} fill={app.color} />
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
                        {websiteUsageData.map((site) => (
                          <Cell key={`cell-${site.name}`} fill={site.color} />
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
        )}

        {/* TIME LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Daily Time Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">First Activity</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Active Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Productivity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timeLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{log.date}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{log.firstActivity}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{log.lastActivity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{log.totalTime}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{log.activeTime}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${log.productivity > 90 ? 'text-emerald-600' : log.productivity > 80 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {log.productivity}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCREENSHOTS TAB */}
        {activeTab === 'screenshots' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Recent Screenshots</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
                <Info size={16} className="text-blue-500" />
                Screenshots are taken every 10 minutes while active.
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockScreenshots.map((shot) => (
                <div key={shot.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img 
                      src={shot.url} 
                      alt={`Screenshot at ${shot.time}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" />
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{shot.time}</p>
                      <p className="text-xs text-slate-500">{shot.app}</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
