import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Calendar as CalendarIcon,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const reportData = [
  { date: '2026-03-23', productive: 7.5, unproductive: 0.5, idle: 0.5 },
  { date: '2026-03-24', productive: 6.8, unproductive: 1.2, idle: 0.8 },
  { date: '2026-03-25', productive: 8.0, unproductive: 0.2, idle: 0.3 },
  { date: '2026-03-26', productive: 7.2, unproductive: 0.8, idle: 0.5 },
  { date: '2026-03-27', productive: 6.5, unproductive: 1.5, idle: 1.0 },
  { date: '2026-03-28', productive: 4.0, unproductive: 0.5, idle: 0.2 },
  { date: '2026-03-29', productive: 7.8, unproductive: 0.4, idle: 0.3 },
];

const employeeData = [
  { id: '1', name: 'John Doe', department: 'Engineering', productive: 38.5, unproductive: 2.5, idle: 4.0 },
  { id: '2', name: 'Jane Smith', department: 'Design', productive: 35.0, unproductive: 4.0, idle: 6.0 },
  { id: '3', name: 'Mike Johnson', department: 'Marketing', productive: 40.0, unproductive: 1.0, idle: 4.0 },
  { id: '4', name: 'Sarah Wilson', department: 'Engineering', productive: 42.0, unproductive: 0.5, idle: 2.5 },
];

export default function MonitoringReports() {
  const [reportType, setReportType] = useState('weekly');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monitoring Reports</h1>
          <p className="text-slate-500">Detailed productivity and activity analysis</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
            <Download size={18} />
            Download PDF
          </button>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Report Type</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['daily', 'weekly', 'monthly', 'department'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`flex-1 py-2 px-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  reportType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employee</label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option>All Employees</option>
            <option>John Doe</option>
            <option>Jane Smith</option>
            <option>Mike Johnson</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date Range</label>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <CalendarIcon size={18} className="text-slate-400" />
            <span className="text-sm text-slate-600">Mar 23 - Mar 29, 2026</span>
          </div>
        </div>

        <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Productivity Over Time */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Productivity Analysis (Hours)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-slate-500">Productive</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-slate-500">Unproductive</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-xs font-medium text-slate-500">Idle</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="productive" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="unproductive" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="idle" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Weekly Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Active Time</span>
                <span className="text-slate-900 font-bold">48h 20m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Idle Time</span>
                <span className="text-slate-900 font-bold">4h 15m</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                <span className="text-slate-900 font-bold">Avg Productivity</span>
                <span className="text-blue-600 font-bold text-lg">86.4%</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
            <h3 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-4">Top Performer</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">
                SW
              </div>
              <div>
                <p className="font-bold">Sarah Wilson</p>
                <p className="text-xs opacity-80">95% Productivity Score</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs opacity-80 italic">"Consistently high performance across all development tasks this week."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Employee Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Productive Hrs</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Unproductive Hrs</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Idle Hrs</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeData.map((emp) => {
                const total = emp.productive + emp.unproductive + emp.idle;
                const score = Math.round((emp.productive / total) * 100);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(emp.id)}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{emp.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.department}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.productive}h</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.unproductive}h</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.idle}h</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${score > 90 ? 'text-emerald-600' : score > 80 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Daily Activity Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Productive Hrs</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Unproductive Hrs</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Idle Hrs</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((day, index) => {
                const total = day.productive + day.unproductive + day.idle;
                const score = Math.round((day.productive / total) * 100);
                return (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{day.date}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{day.productive}h</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{day.unproductive}h</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{day.idle}h</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${score > 90 ? 'text-emerald-600' : score > 80 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={reportData.slice(Math.max(0, index - 3), index + 1)}>
                            <Line type="monotone" dataKey="productive" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
