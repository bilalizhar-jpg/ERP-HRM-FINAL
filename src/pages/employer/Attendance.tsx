import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';

const attendanceWidgets: WidgetConfig[] = [
  {
    id: 'present-today',
    type: 'stat',
    title: 'Present Today',
    value: '1,150',
    trend: { value: 2, isPositive: true },
    icon: <UserCheck className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'absent-today',
    type: 'stat',
    title: 'Absent Today',
    value: '42',
    trend: { value: 5, isPositive: false },
    icon: <UserX className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'late-arrivals',
    type: 'stat',
    title: 'Late Arrivals',
    value: '18',
    trend: { value: 10, isPositive: false },
    icon: <Clock className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'on-leave',
    type: 'stat',
    title: 'On Leave',
    value: '38',
    icon: <AlertTriangle className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'attendance-trend',
    type: 'chart',
    title: 'Attendance Trend (Last 7 Days)',
    chartType: 'bar',
    data: [
      { name: 'Mon', present: 1180, absent: 68 },
      { name: 'Tue', present: 1200, absent: 48 },
      { name: 'Wed', present: 1195, absent: 53 },
      { name: 'Thu', present: 1210, absent: 38 },
      { name: 'Fri', present: 1150, absent: 98 },
    ],
    dataKeys: ['present', 'absent'],
    colors: ['#10b981', '#ef4444'],
    size: 'large',
  },
  {
    id: 'attendance-by-dept',
    type: 'chart',
    title: 'Attendance by Department',
    chartType: 'pie',
    data: [
      { name: 'Engineering', value: 95 },
      { name: 'Sales', value: 88 },
      { name: 'Marketing', value: 92 },
      { name: 'Support', value: 90 },
    ],
    dataKeys: ['value'],
    size: 'medium',
  },
  {
    id: 'recent-checkins',
    type: 'table',
    title: 'Recent Check-ins',
    columns: [
      { key: 'employee', label: 'Employee' },
      { key: 'time', label: 'Check-in Time' },
      { key: 'location', label: 'Location' },
      { 
        key: 'status', 
        label: 'Status',
        render: (val: string) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            val === 'On Time' ? 'bg-green-100 text-green-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {val}
          </span>
        )
      },
    ],
    data: [
      { employee: 'Sarah Connor', time: '08:55 AM', location: 'New York Office', status: 'On Time' },
      { employee: 'John Smith', time: '09:15 AM', location: 'Remote', status: 'Late' },
      { employee: 'Mike Johnson', time: '08:45 AM', location: 'London Office', status: 'On Time' },
      { employee: 'Emily Davis', time: '09:05 AM', location: 'Remote', status: 'Late' },
    ],
    size: 'full',
  }
];

export default function Attendance() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <DynamicDashboard 
          moduleName="attendance"
          title="Attendance Dashboard"
          widgets={attendanceWidgets}
        />
      </main>
    </div>
  );
}
