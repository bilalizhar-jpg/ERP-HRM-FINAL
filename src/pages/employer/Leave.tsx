import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Leave() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Leave Management</h1>
          <p className="text-slate-500 font-medium">Review and manage employee leave requests.</p>
        </header>

        <ModulePlaceholder 
          title="Leave Management" 
          description="Employee leave requests and approvals are managed by employers." 
        />
      </main>
    </div>
  );
}
