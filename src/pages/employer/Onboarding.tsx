import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Onboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Onboarding</h1>
          <p className="text-slate-500 font-medium">Manage employee onboarding processes.</p>
        </header>

        <ModulePlaceholder 
          title="Onboarding" 
          description="Employee onboarding module is under development." 
        />
      </main>
    </div>
  );
}
