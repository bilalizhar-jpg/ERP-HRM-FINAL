import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 relative">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        BACK TO HOME
      </Link>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">EMPLOYEE DASHBOARD</h1>
      <p className="text-slate-500 font-medium mt-2">Welcome to your employee dashboard.</p>
    </div>
  );
}
