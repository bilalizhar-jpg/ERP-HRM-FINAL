import { Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a14] text-slate-400 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-1">
            <div className="text-xl font-extrabold text-white tracking-tighter mb-6">
              <Link to="/">multifunctional<span className="text-blue-500">HRM-ERP</span></Link>
            </div>
            <p className="text-sm mb-6 leading-relaxed">
              Manage HR, payroll, projects, CRM, finance, supply chain, and medical transcription from one intelligent dashboard.
            </p>
            <div className="space-y-2 text-sm">
              <p>info@inforesumeedge.com</p>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><Twitter className="w-4 h-4 text-white" /></a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><Linkedin className="w-4 h-4 text-white" /></a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><Github className="w-4 h-4 text-white" /></a>
            </div>
          </div>

          {[
            {
              title: 'Features',
              links: ['HRM', 'Recruitment', 'Payroll & Finance', 'Project Management', 'CRM & Marketing', 'Supply Chain', 'Medical Transcription']
            },
            {
              title: 'Industries',
              links: ['Corporate', 'IT & Software', 'Healthcare', 'Manufacturing', 'Agencies', 'Retail & E-Commerce', 'Startups & SMEs']
            },
            {
              title: 'Pricing',
              links: ['Starter Plan', 'Professional Plan', 'Enterprise Plan', 'Custom Quote', 'Compare Plans', 'Free Trial']
            },
            {
              title: 'Support',
              links: [
                { name: 'Documentation', to: '#' },
                { name: 'Help Center', to: '#' },
                { name: 'API Reference', to: '#' },
                { name: 'Status Page', to: '#' },
                { name: 'Community Forum', to: '#' },
                { name: 'Contact Us', to: '/contact-us' },
                { name: 'Privacy Policy', to: '/privacy-policy' }
              ]
            }
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-6">{section.title}</h4>
              <ul className="space-y-4 text-sm">
                {section.links.map(link => (
                  <li key={typeof link === 'string' ? link : link.name}>
                    {typeof link === 'string' ? (
                      <a href="#" className="hover:text-white">{link}</a>
                    ) : (
                      <Link to={link.to} className="hover:text-white">{link.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
