import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Assets() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Asset Management</h1>
          <p className="text-slate-500 font-medium">Track and manage company equipment assigned to employees.</p>
        </header>

        <ModulePlaceholder 
          title="Asset Management" 
          description="Company equipment, inventory, and asset assignments are managed by employers." 
        />
      </main>
    </div>
  );
}
