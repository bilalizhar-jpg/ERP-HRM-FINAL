import { CheckCircle2 } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    '40% reduction in operational costs',
    'Deploy in under 2 weeks',
    'No hidden fees, transparent pricing',
    'Dedicated onboarding & 24/7 support',
  ];

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-6">Everything your team needs, nothing they don't</h2>
            <p className="text-xl text-slate-400 mb-8">Replace a fragmented stack of tools with one unified system. HRM & ERP Platform connects your teams, automates repetitive work, and surfaces insights that drive better business outcomes.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-900/20">
              Explore Features
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-6 bg-slate-800 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
            <div className="p-6 bg-slate-800 rounded-xl">
              <div className="text-4xl font-bold text-blue-400 mb-1">40%</div>
              <div className="text-sm text-slate-400">Cost Reduction</div>
              <div className="text-xs text-slate-500">Average across clients</div>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl">
              <div className="text-4xl font-bold text-blue-400 mb-1">3x</div>
              <div className="text-sm text-slate-400">Faster Operations</div>
              <div className="text-xs text-slate-500">With workflow automation</div>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl">
              <div className="text-4xl font-bold text-blue-400 mb-1">99.9%</div>
              <div className="text-sm text-slate-400">System Uptime</div>
              <div className="text-xs text-slate-500">SLA guaranteed</div>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl">
              <div className="text-4xl font-bold text-blue-400 mb-1">2 Weeks</div>
              <div className="text-sm text-slate-400">Go-Live Time</div>
              <div className="text-xs text-slate-500">Full implementation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
