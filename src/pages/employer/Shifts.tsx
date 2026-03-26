import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Shifts() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Shift Management</h1>
          <p className="text-slate-500 font-medium">Create and assign work shifts to employees.</p>
        </header>

        <ModulePlaceholder 
          title="Shift Management" 
          description="Employee work shifts, schedules, and assignments are managed by employers." 
        />
      </main>
    </div>
  );
}
