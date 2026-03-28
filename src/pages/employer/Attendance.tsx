import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import AttendanceContent from '../../components/attendance/AttendanceContent';

export default function Attendance() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className={`flex-1 overflow-y-auto ${isSuperAdminPath ? 'p-8 lg:p-12' : ''}`}>
        <AttendanceContent />
      </main>
    </div>
  );
}
