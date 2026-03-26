import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { Clock, MousePointer2, Keyboard, Activity } from 'lucide-react';

const timeTrackWidgets: WidgetConfig[] = [
  {
    id: 'active-time',
    type: 'stat',
    title: 'Avg. Active Time',
    value: '6h 45m',
    trend: { value: 5, isPositive: true },
    icon: <Clock className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'idle-time',
    type: 'stat',
    title: 'Avg. Idle Time',
    value: '1h 15m',
    trend: { value: 12, isPositive: false },
    icon: <Activity className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'mouse-clicks',
    type: 'stat',
    title: 'Total Mouse Clicks',
    value: '12,450',
    icon: <MousePointer2 className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'keystrokes',
    type: 'stat',
    title: 'Total Keystrokes',
    value: '45,200',
    icon: <Keyboard className="w-6 h-6" />,
    size: 'small',
  },
  {
    id: 'activity-graph',
    type: 'chart',
    title: 'Activity Graph',
    chartType: 'line',
    data: [
      { name: 'Mon', active: 7, idle: 1 },
      { name: 'Tue', active: 6.5, idle: 1.5 },
      { name: 'Wed', active: 7.2, idle: 0.8 },
      { name: 'Thu', active: 6.8, idle: 1.2 },
      { name: 'Fri', active: 6.5, idle: 1.5 },
    ],
    dataKeys: ['active', 'idle'],
    colors: ['#10b981', '#ef4444'],
    size: 'large',
  },
  {
    id: 'productivity-score',
    type: 'chart',
    title: 'Productivity Score',
    chartType: 'bar',
    data: [
      { name: 'Engineering', score: 85 },
      { name: 'Sales', score: 92 },
      { name: 'Marketing', score: 78 },
      { name: 'Support', score: 88 },
    ],
    dataKeys: ['score'],
    colors: ['#3b82f6'],
    size: 'medium',
  },
  {
    id: 'recent-time-logs',
    type: 'table',
    title: 'Recent Time Logs',
    columns: [
      { key: 'employee', label: 'Employee' },
      { key: 'project', label: 'Project' },
      { key: 'duration', label: 'Duration' },
      { 
        key: 'status', 
        label: 'Status',
        render: (val: string) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            val === 'Active' ? 'bg-green-100 text-green-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {val}
          </span>
        )
      },
    ],
    data: [
      { employee: 'Sarah Connor', project: 'Website Redesign', duration: '2h 15m', status: 'Active' },
      { employee: 'John Smith', project: 'API Integration', duration: '4h 30m', status: 'Completed' },
      { employee: 'Mike Johnson', project: 'Client Meeting', duration: '1h 0m', status: 'Completed' },
    ],
    size: 'full',
  }
];

export default function TimeTrack() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <DynamicDashboard 
          moduleName="time-track"
          title="Time Tracking Dashboard"
          widgets={timeTrackWidgets}
        />
      </main>
    </div>
  );
}
