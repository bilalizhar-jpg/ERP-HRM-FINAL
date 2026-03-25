import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Designation() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Designations</h1>
          <p className="text-slate-500 font-medium">Manage company designations.</p>
        </header>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Module Managed by Employer</h2>
          <p className="text-slate-500">This module is for employer-specific data. Designations are managed directly by employers in their respective portals.</p>
        </div>
      </main>
    </div>
  );
}
