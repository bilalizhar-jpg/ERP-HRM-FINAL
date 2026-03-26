import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const leaveWidgets: WidgetConfig[] = [
  {
    id: 'pending-requests',
    type: 'stat',
    title: 'Pending Requests',
    value: '24',
    trend: { value: 5, isPositive: false },
    icon: <Clock className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'approved-leaves',
    type: 'stat',
    title: 'Approved (This Month)',
    value: '156',
    trend: { value: 12, isPositive: true },
    icon: <CheckCircle className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'rejected-leaves',
    type: 'stat',
    title: 'Rejected (This Month)',
    value: '12',
    icon: <XCircle className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'upcoming-leaves',
    type: 'stat',
    title: 'Upcoming Leaves',
    value: '45',
    icon: <Calendar className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'leave-types',
    type: 'chart',
    title: 'Leave Types Distribution',
    chartType: 'pie',
    data: [
      { name: 'Annual Leave', value: 450 },
      { name: 'Sick Leave', value: 200 },
      { name: 'Maternity/Paternity', value: 50 },
      { name: 'Unpaid Leave', value: 30 },
    ],
    dataKeys: ['value'],
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
    size: 'medium',
  },
  {
    id: 'leave-trend',
    type: 'chart',
    title: 'Leave Trend (Last 6 Months)',
    chartType: 'bar',
    data: [
      { name: 'May', taken: 120 },
      { name: 'Jun', taken: 150 },
      { name: 'Jul', taken: 200 },
      { name: 'Aug', taken: 180 },
      { name: 'Sep', taken: 140 },
      { name: 'Oct', taken: 156 },
    ],
    dataKeys: ['taken'],
    colors: ['#8b5cf6'],
    size: 'large',
  },
  {
    id: 'recent-leave-requests',
    type: 'table',
    title: 'Recent Leave Requests',
    columns: [
      { key: 'employee', label: 'Employee' },
      { key: 'type', label: 'Leave Type' },
      { key: 'duration', label: 'Duration' },
      { 
        key: 'status', 
        label: 'Status',
        render: (val: string) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            val === 'Approved' ? 'bg-green-100 text-green-800' : 
            val === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {val}
          </span>
        )
      },
    ],
    data: [
      { employee: 'Sarah Connor', type: 'Annual Leave', duration: 'Oct 28 - Nov 5', status: 'Pending' },
      { employee: 'John Smith', type: 'Sick Leave', duration: 'Oct 25 - Oct 26', status: 'Approved' },
      { employee: 'Mike Johnson', type: 'Unpaid Leave', duration: 'Nov 1 - Nov 2', status: 'Pending' },
      { employee: 'Emily Davis', type: 'Annual Leave', duration: 'Dec 20 - Jan 2', status: 'Approved' },
    ],
    size: 'full',
  }
];

export default function Leave() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <DynamicDashboard 
          moduleName="leave"
          title="Leave Management Dashboard"
          widgets={leaveWidgets}
        />
      </main>
    </div>
  );
}
