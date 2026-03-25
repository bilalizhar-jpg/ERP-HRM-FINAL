import { useState, useEffect } from 'react';
import DesignationModule from '../components/department/DesignationModule';

export default function CompanyAdminDesignation() {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">Designations</h1>
        <p className="text-slate-500 font-medium">Manage your company's designations.</p>
      </header>

      <DesignationModule companyId={companyId} />
    </div>
  );
}
