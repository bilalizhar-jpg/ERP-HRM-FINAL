import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const employeeData = localStorage.getItem('employee');

  if (!employeeData) {
    return <Navigate to="/employee/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('employee');
    navigate('/');
  };
  return (
      <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
        <EmployeeSidebar />
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
                onClick={handleLogout}
                className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold text-sm transition-colors"
              >
                <LogOut size={16} />
                LOGOUT
              </button>
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                E
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
