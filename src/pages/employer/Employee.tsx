import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { Users, UserPlus, UserMinus, Award } from 'lucide-react';

const employeeWidgets: WidgetConfig[] = [
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
    id: 'new-hires',
    type: 'stat',
    title: 'New Hires (This Month)',
    value: '45',
    trend: { value: 8, isPositive: true },
    icon: <UserPlus className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'attrition-rate',
    type: 'stat',
    title: 'Attrition Rate',
    value: '2.4%',
    trend: { value: 0.5, isPositive: false },
    icon: <UserMinus className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'top-performers',
    type: 'stat',
    title: 'Top Performers',
    value: '156',
    icon: <Award className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'employee-growth',
    type: 'chart',
    title: 'Employee Growth',
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
    colors: ['#8b5cf6'],
    size: 'large',
  },
  {
    id: 'gender-diversity',
    type: 'chart',
    title: 'Gender Diversity',
    chartType: 'pie',
    data: [
      { name: 'Male', value: 650 },
      { name: 'Female', value: 580 },
      { name: 'Other', value: 18 },
    ],
    dataKeys: ['value'],
    colors: ['#3b82f6', '#ec4899', '#10b981'],
    size: 'medium',
  },
  {
    id: 'recent-hires',
    type: 'table',
    title: 'Recent Hires',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'department', label: 'Department' },
      { key: 'role', label: 'Role' },
      { key: 'joinDate', label: 'Join Date' },
    ],
    data: [
      { name: 'Alex Johnson', department: 'Engineering', role: 'Frontend Developer', joinDate: 'Oct 24, 2023' },
      { name: 'Maria Garcia', department: 'Sales', role: 'Account Executive', joinDate: 'Oct 22, 2023' },
      { name: 'James Wilson', department: 'Marketing', role: 'Content Strategist', joinDate: 'Oct 20, 2023' },
      { name: 'Linda Chen', department: 'Engineering', role: 'DevOps Engineer', joinDate: 'Oct 18, 2023' },
    ],
    size: 'full',
  }
];

export default function Employee() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <DynamicDashboard 
          moduleName="employee"
          title="Employees Dashboard"
          widgets={employeeWidgets}
        />
      </main>
    </div>
  );
}
