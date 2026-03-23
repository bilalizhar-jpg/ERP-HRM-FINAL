import { Target, Zap, BarChart3 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { icon: Target, title: 'Setup Your Organization', description: 'From initial setup to full operational automation, HRM & ERP Platform is designed to deliver value fast — with minimal disruption to your existing workflows.' },
    { icon: Zap, title: 'Automate Your Operations', description: 'Let HRM & ERP Platform handle the repetitive work. Automate HR processes, payroll runs, project assignments, CRM follow-ups, and supply chain tasks.' },
    { icon: BarChart3, title: 'Monitor & Grow', description: 'Access real-time dashboards, custom reports, and AI-powered insights that help you spot bottlenecks, recognize top performers, and scale with confidence.' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">How it Works</h2>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Up & Running in 3 Simple Steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 text-white text-2xl font-bold shadow-lg shadow-blue-200">
                0{index + 1}
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
