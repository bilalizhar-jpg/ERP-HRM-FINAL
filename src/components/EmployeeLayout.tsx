import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EmployeeSidebar from './EmployeeSidebar';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Employee } from '../types';
import { fetchWithRetry } from '../utils/fetchWithRetry';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {
    if (!employeeId || employeeId === 'undefined' || employeeId === 'null') {
      setLoading(false);
      return;
    }

    fetchWithRetry(`/api/employees/${employeeId}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch employee: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setEmployee(data.employee);
        } else if (data.id) {
          setEmployee(data); // Fallback if it returns the object directly
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching employee:', err);
        setLoading(false);
      });
  }, [employeeId]);

  if (!employeeId || employeeId === 'undefined' || employeeId === 'null') {
    return <Navigate to="/employee/login" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!employee) {
    return <Navigate to="/employee/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('employeeId');
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
                {employee?.name?.charAt(0) || 'E'}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <Outlet context={{ employee }} />
          </main>
        </div>
      </div>
  );
}
