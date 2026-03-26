import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function TimeTrack() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Time Tracking</h1>
          <p className="text-slate-500 font-medium">Monitor and manage employee time logs.</p>
        </header>

        <ModulePlaceholder 
          title="Time Tracking" 
          description="Employee time logs, active timers, and project tracking are managed by employers." 
        />
      </main>
    </div>
  );
}
