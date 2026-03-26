import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Reports() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium">Generate and view detailed reports on company metrics.</p>
        </header>

        <ModulePlaceholder 
          title="Reports & Analytics" 
          description="Detailed reports, analytics, and company metrics are managed by employers." 
        />
      </main>
    </div>
  );
}
