import { Outlet, Link } from 'react-router-dom';
import CompanyAdminSidebar from './CompanyAdminSidebar';
import { ArrowLeft } from 'lucide-react';

export default function CompanyAdminLayout() {
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
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
