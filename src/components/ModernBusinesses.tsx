import { Cloud, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export default function ModernBusinesses() {
  const features = [
    { icon: Cloud, title: 'Cloud-Based', description: 'Access your ERP from anywhere, anytime. No infrastructure costs, automatic updates, and 99.9% uptime SLA guaranteed.' },
    { icon: ShieldCheck, title: 'Enterprise Secure', description: 'Bank-grade encryption, SOC 2 Type II certified, role-based access control, and GDPR/HIPAA compliance built-in.' },
    { icon: Zap, title: 'Infinitely Scalable', description: 'Start with 5 users or 5,000. HRM & ERP Platform scales with your growth without performance degradation or re-implementation.' },
    { icon: BarChart3, title: 'Real-Time Analytics', description: 'Live dashboards, predictive insights, and customizable reports give you the data you need to make faster decisions.' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">About HRM & ERP Platform</h2>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Built for Modern, Growing Businesses</p>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">HRM & ERP Platform is a comprehensive, cloud-based ERP that integrates every department — HR, finance, projects, sales, and supply chain — into one intelligent platform. Real-time analytics and automation help you move faster, reduce costs, and grow with confidence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
