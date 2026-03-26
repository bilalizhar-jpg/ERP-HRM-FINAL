import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function Payroll() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Payroll</h1>
          <p className="text-slate-500 font-medium">Manage employee salaries and generate payslips.</p>
        </header>

        <ModulePlaceholder 
          title="Payroll" 
          description="Employee salaries, payroll processing, and payslip generation are managed by employers." 
        />
      </main>
    </div>
  );
}
