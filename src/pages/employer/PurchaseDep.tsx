import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function PurchaseDep() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Purchase Department</h1>
          <p className="text-slate-500 font-medium">Manage company purchases and inventory.</p>
        </header>

        <ModulePlaceholder 
          title="Purchase Department" 
          description="Purchase department module is under development." 
        />
      </main>
    </div>
  );
}
