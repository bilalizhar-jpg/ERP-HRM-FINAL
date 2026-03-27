import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Performance() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Performance</h1>
          <p className="text-slate-500 font-medium">Evaluate and track employee performance metrics.</p>
        </header>

        <ModulePlaceholder 
          title="Performance" 
          description="Employee performance evaluations, metrics, and reviews are managed by employers." 
        />
      </main>
    </div>
  );
}
