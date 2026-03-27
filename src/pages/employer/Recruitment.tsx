import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Recruitment() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Recruitment</h1>
          <p className="text-slate-500 font-medium">Manage job postings and applicant tracking.</p>
        </header>

        <ModulePlaceholder 
          title="Recruitment" 
          description="Job postings, applicant tracking, and recruitment processes are managed by employers." 
        />
      </main>
    </div>
  );
}
