import { Link, useLocation } from 'react-router-dom';

interface PayrollTabsProps {
  isSuperAdmin?: boolean;
}

export default function PayrollTabs({ isSuperAdmin = false }: PayrollTabsProps) {
  const location = useLocation();
  const basePath = isSuperAdmin ? '/super-admin/employer/payroll' : '/company-admin/payroll';

  const tabs = [
    { name: 'Company Payroll', path: `${basePath}/company-payroll` },
    { name: 'Salary Advance', path: `${basePath}/salary-advance` },
    { name: 'Salary Generate', path: `${basePath}/salary-generate` },
    { name: 'Manage Employee Salary', path: `${basePath}/manage-salary` },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
