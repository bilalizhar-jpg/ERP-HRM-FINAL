import { Users, UserPlus, DollarSign, Briefcase, BarChart3, Truck } from 'lucide-react';

export default function CoreModules() {
  const modules = [
    { icon: Users, title: 'HRM', description: 'Human Resource Management', details: ['Employee Management', 'Attendance Tracking', 'Time Tracking', 'Leave Management', 'Awards & Recognition', 'Org Chart'] },
    { icon: UserPlus, title: 'Recruitment', description: 'Applicant Tracking System', details: ['Applicant Tracking', 'Candidate Database', 'Job Posting', 'Onboarding'] },
    { icon: DollarSign, title: 'Payroll & Finance', description: 'Financial Management', details: ['Payroll Processing', 'Salary Management', 'Invoice Generation', 'Account Management', 'Tax Reports', 'Expense Tracking'] },
    { icon: Briefcase, title: 'Project Management', description: 'Task & Team Collaboration', details: ['Task Tracking', 'Team Collaboration', 'Performance Analytics', 'Gantt Charts', 'Milestone Tracking', 'Resource Allocation'] },
    { icon: BarChart3, title: 'CRM & Marketing', description: 'Customer Relationship', details: ['Sales Pipeline', 'Campaign Tracking', 'Client Database', 'Lead Scoring', 'Email Automation', 'Analytics & Reports'] },
    { icon: Truck, title: 'Supply Chain', description: 'Procurement & Logistics', details: ['Procurement', 'Vendor Management', 'Supply Tracking', 'Inventory Control', 'Purchase Orders', 'Delivery Tracking'] },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Core Modules</h2>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Every Module Your Business Needs</p>
          <p className="mt-4 text-xl text-slate-600">Six powerful, deeply integrated modules working together as one seamless system — from hiring to finance to customer success.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <div key={index} className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <module.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{module.title}</h3>
                  <p className="text-sm text-slate-500">{module.description}</p>
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                {module.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    {detail}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center gap-2">
                Explore Module →
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-200">
            View All Modules →
          </button>
        </div>
      </div>
    </section>
  );
}
