import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { Users, Briefcase, Clock, DollarSign } from 'lucide-react';

const dashboardWidgets: WidgetConfig[] = [
  {
    id: 'total-employees',
    type: 'stat',
    title: 'Total Employees',
    value: '1,248',
    trend: { value: 12, isPositive: true },
    icon: <Users className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'active-projects',
    type: 'stat',
    title: 'Active Projects',
    value: '42',
    trend: { value: 5, isPositive: true },
    icon: <Briefcase className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'avg-attendance',
    type: 'stat',
    title: 'Avg. Attendance',
    value: '94%',
    trend: { value: 2, isPositive: false },
    icon: <Clock className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'monthly-payroll',
    type: 'stat',
    title: 'Monthly Payroll',
    value: '$452k',
    trend: { value: 8, isPositive: true },
    icon: <DollarSign className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'headcount-trend',
    type: 'chart',
    title: 'Headcount Trend',
    chartType: 'area',
    data: [
      { name: 'Jan', count: 1100 },
      { name: 'Feb', count: 1150 },
      { name: 'Mar', count: 1180 },
      { name: 'Apr', count: 1200 },
      { name: 'May', count: 1220 },
      { name: 'Jun', count: 1248 },
    ],
    dataKeys: ['count'],
    size: 'medium',
  },
  {
    id: 'department-distribution',
    type: 'chart',
    title: 'Department Distribution',
    chartType: 'pie',
    data: [
      { name: 'Engineering', value: 400 },
      { name: 'Sales', value: 300 },
      { name: 'Marketing', value: 200 },
      { name: 'Support', value: 150 },
      { name: 'HR', value: 50 },
      { name: 'Finance', value: 148 },
    ],
    dataKeys: ['value'],
    size: 'medium',
  },
  {
    id: 'recent-activities',
    type: 'table',
    title: 'Recent Activities',
    columns: [
      { key: 'user', label: 'User' },
      { key: 'action', label: 'Action' },
      { key: 'time', label: 'Time' },
      { 
        key: 'status', 
        label: 'Status',
        render: (val: string) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            val === 'Completed' ? 'bg-green-100 text-green-800' : 
            val === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {val}
          </span>
        )
      },
    ],
    data: [
      { user: 'Sarah Connor', action: 'Approved Payroll', time: '10 mins ago', status: 'Completed' },
      { user: 'John Smith', action: 'Added New Employee', time: '1 hour ago', status: 'Completed' },
      { user: 'Mike Johnson', action: 'Requested Leave', time: '2 hours ago', status: 'Pending' },
      { user: 'Emily Davis', action: 'Updated Project Status', time: '3 hours ago', status: 'Completed' },
    ],
    size: 'full',
  }
];

export default function EmployerDashboard() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <DynamicDashboard 
          moduleName="main-dashboard"
          title="Employer Dashboard"
          widgets={dashboardWidgets}
        />
      </main>
    </div>
  );
}
