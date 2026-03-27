import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  LogOut, 
  CalendarOff, 
  Bell, 
  DollarSign, 
  Laptop, 
  MessageSquare 
} from 'lucide-react';

export default function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('employee');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/employee/attendance', icon: CalendarCheck },
    { name: 'Leaves', path: '/employee/leaves', icon: CalendarOff },
    { name: 'Notice Board', path: '/employee/notice-board', icon: Bell },
    { name: 'Payroll', path: '/employee/payroll', icon: DollarSign },
    { name: 'Asset', path: '/employee/assets', icon: Laptop },
    { name: 'Message', path: '/employee/message', icon: MessageSquare },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col">
      <div className="p-6 sticky top-0 bg-white z-10 border-b border-slate-100">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          Employee Portal
        </h2>
      </div>
      
      <div className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-500'} strokeWidth={2} />
                  <span className="text-sm font-bold tracking-wide">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-bold tracking-wide"
        >
          <LogOut size={20} strokeWidth={2} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
