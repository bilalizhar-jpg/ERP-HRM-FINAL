import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, expense: 2400, profit: 1600 },
  { name: 'Feb', revenue: 3000, expense: 1398, profit: 1602 },
  { name: 'Mar', revenue: 2000, expense: 9800, profit: -7800 },
  { name: 'Apr', revenue: 2780, expense: 3908, profit: -1128 },
  { name: 'May', revenue: 1890, expense: 4800, profit: -2910 },
  { name: 'Jun', revenue: 2390, expense: 3800, profit: -1410 },
];

export default function ReportingAnalytics() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Reporting & Analytics</h2>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Data-Driven Insights Across Every Department</p>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">Interactive dashboards and customizable reports give leadership and managers the visibility they need to make confident decisions, fast.</p>
        </div>
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Revenue, Expenses & Profit</h3>
          </div>
          <div className="h-80 bg-white rounded-xl border border-slate-200 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              { label: 'Revenue', value: '$1.2M' },
              { label: 'Expense', value: '$800K' },
              { label: 'Profit', value: '$400K' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
