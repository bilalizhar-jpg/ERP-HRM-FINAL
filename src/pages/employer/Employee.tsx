import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import EmployeeModule from '../../components/employee/EmployeeModule';

export default function Employee() {
  // In a real app, you would get the company ID from the context or URL
  // For now, we'll assume company ID 1 for super admin testing
  const companyId = 1;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <EmployeeModule companyId={companyId} />
      </main>
    </div>
  );
}
