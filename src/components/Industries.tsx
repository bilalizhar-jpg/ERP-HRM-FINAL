import { Building2, Code, Stethoscope, Factory, Briefcase, ShoppingCart, Rocket } from 'lucide-react';

export default function Industries() {
  const industries = [
    { icon: Building2, title: 'Corporate' },
    { icon: Code, title: 'IT & Software' },
    { icon: Stethoscope, title: 'Healthcare' },
    { icon: Factory, title: 'Manufacturing' },
    { icon: Briefcase, title: 'Agencies' },
    { icon: ShoppingCart, title: 'Retail & E-Commerce' },
    { icon: Rocket, title: 'Startups & SMEs' },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Industries We Serve</h2>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Trusted Across Every Industry</p>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">HRM & ERP Platform is flexible enough to adapt to any industry's workflows, compliance requirements, and operational complexity.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {industries.map((industry, index) => (
            <div key={index} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <industry.icon className="w-10 h-10 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900">{industry.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
