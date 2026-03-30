import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import CompanyAdminSidebar from './CompanyAdminSidebar';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function CompanyAdminLayout() {
  const navigate = useNavigate();
  const companyAdminData = localStorage.getItem('companyAdmin');
  const company = companyAdminData ? JSON.parse(companyAdminData) : null;

  if (!company) {
    return <Navigate to="/company-admin" replace />;
  }

  const handleExitToSite = () => {
    localStorage.removeItem('companyAdmin');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <CompanyAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              BACK TO HOME
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExitToSite}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              <LogOut size={16} />
              EXIT TO SITE
            </button>
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {company.name?.[0] || 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ company }} />
        </main>
      </div>
    </div>
  );
}
