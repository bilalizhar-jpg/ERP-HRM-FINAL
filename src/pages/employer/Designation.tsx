import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Designation() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Designations</h1>
          <p className="text-slate-500 font-medium">Manage company designations.</p>
        </header>

        <ModulePlaceholder 
          title="Designations" 
          description="Company designations are managed by employers." 
        />
      </main>
    </div>
  );
}
