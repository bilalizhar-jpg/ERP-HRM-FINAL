import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import DesignationModule from '../../components/department/DesignationModule';

export default function Designation() {
  // In a real app, you would get the company ID from the context or URL
  // For now, we'll assume company ID 1 for super admin testing
  const companyId = 1;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Designations</h1>
          <p className="text-slate-500 font-medium">Manage company designations.</p>
        </header>

        <DesignationModule companyId={companyId} />
      </main>
    </div>
  );
}
