import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import EmployeeSidebar from '../../components/EmployeeSidebar';
import ChatSystem from '../../components/messaging/ChatSystem';

export default function Message() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const isEmployeePath = location.pathname.startsWith('/employee');

  return (
    <div className="h-screen bg-[#f8f9fa] flex overflow-hidden">
      {isSuperAdminPath && <SuperAdminSidebar />}
      {isEmployeePath && <EmployeeSidebar />}
      
      <main className="flex-1 flex flex-col overflow-hidden p-6 lg:p-8">
        <header className="mb-6 shrink-0">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">Communication Hub</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Real-time collaboration and messaging.</p>
        </header>

        <div className="flex-1 min-h-0">
          <ChatSystem />
        </div>
      </main>
    </div>
  );
}
