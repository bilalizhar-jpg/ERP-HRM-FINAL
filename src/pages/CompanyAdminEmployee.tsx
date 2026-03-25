import { useState, useEffect } from 'react';
import EmployeeModule from '../components/employee/EmployeeModule';

export default function CompanyAdminEmployee() {
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const companyStr = localStorage.getItem('companyAdmin');
    if (companyStr) {
      const company = JSON.parse(companyStr);
      setCompanyId(company.id);
    }
  }, []);

  if (!companyId) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeModule companyId={companyId} />
    </div>
  );
}
