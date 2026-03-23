import { motion } from 'framer-motion';
import { LayoutGrid, BarChart3, Users, ShieldCheck, Briefcase, Zap } from 'lucide-react';

const features = [
  { icon: LayoutGrid, title: 'Unified Dashboard', description: 'Manage all your business operations from a single, intuitive interface.' },
  { icon: BarChart3, title: 'Real-time Analytics', description: 'Make data-driven decisions with live insights and automated reporting.' },
  { icon: Users, title: 'HR Management', description: 'Streamline onboarding, payroll, and performance tracking.' },
  { icon: ShieldCheck, title: 'Enterprise Security', description: 'Protect your sensitive business data with industry-leading security protocols.' },
  { icon: Briefcase, title: 'Project Management', description: 'Track projects, tasks, and resources efficiently.' },
  { icon: Zap, title: 'Workflow Automation', description: 'Automate repetitive tasks to save time and reduce errors.' },
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Features</h2>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Everything you need to scale</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow shadow-slate-200/50"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
