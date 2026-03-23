import { Award, Target, Star, Smile } from 'lucide-react';

export default function PerformanceRewards() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Performance & Rewards</h2>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Empower Your People to Perform at Their Best</p>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">A complete performance management suite that aligns individual goals with company objectives, recognizes achievement, and drives a high-performance culture.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Target, title: 'Performance Tracking', description: 'Set KPIs, track OKRs, and measure individual and team performance with real-time progress indicators and automated reminders.' },
            { icon: Star, title: 'Performance Evaluations', description: '360-degree feedback, peer reviews, manager feedback, and self-evaluations with configurable rubrics and scoring.' },
            { icon: Award, title: 'Rewards Management', description: 'Automate rewards for milestone achievements, performance targets, and tenure milestones. Custom reward tiers and budgets.' },
            { icon: Smile, title: 'Recognition Programs', description: 'Peer-to-peer recognition, shoutouts, and public recognition boards that boost engagement and retention across teams.' },
          ].map((item, index) => (
            <div key={index} className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <item.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
