import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Training() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Training & Development</h1>
          <p className="text-slate-500 font-medium">Manage employee training programs and certifications.</p>
        </header>

        <ModulePlaceholder 
          title="Training & Development" 
          description="Employee training programs, courses, and certifications are managed by employers." 
        />
      </main>
    </div>
  );
}
