import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { Clock, MousePointer2, Keyboard, Activity, Loader2 } from 'lucide-react';

export default function TimeTrack() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<{
    id: number,
    employee_name: string,
    date: string,
    total_active_minutes: number,
    total_idle_minutes: number,
    total_keystrokes: number,
    total_mouse_clicks: number
  }[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const companyAdmin = localStorage.getItem('companyAdmin');
    if (companyAdmin) {
      const company = JSON.parse(companyAdmin);
      setCompanyId(company.id);
    }
  }, []);

  const fetchReport = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/time-tracking/report/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching time tracking report:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Calculate stats from report data
  const totalActiveMinutes = reportData.reduce((acc, curr) => acc + (Number(curr.total_active_minutes) || 0), 0);
  const totalIdleMinutes = reportData.reduce((acc, curr) => acc + (Number(curr.total_idle_minutes) || 0), 0);
  const totalKeystrokes = reportData.reduce((acc, curr) => acc + (Number(curr.total_keystrokes) || 0), 0);
  const totalMouseClicks = reportData.reduce((acc, curr) => acc + (Number(curr.total_mouse_clicks) || 0), 0);

  const avgActiveMinutes = reportData.length > 0 ? totalActiveMinutes / reportData.length : 0;
  const avgIdleMinutes = reportData.length > 0 ? totalIdleMinutes / reportData.length : 0;

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  };

  const timeTrackWidgets: WidgetConfig[] = [
    {
      id: 'active-time',
      type: 'stat',
      title: 'Avg. Active Time',
      value: formatDuration(avgActiveMinutes),
      icon: <Clock className="w-6 h-6" />,
      size: 'small',
    },
    {
      id: 'idle-time',
      type: 'stat',
      title: 'Avg. Idle Time',
      value: formatDuration(avgIdleMinutes),
      icon: <Activity className="w-6 h-6" />,
      size: 'small',
    },
    {
      id: 'mouse-clicks',
      type: 'stat',
      title: 'Total Mouse Clicks',
      value: totalMouseClicks.toLocaleString(),
      icon: <MousePointer2 className="w-6 h-6" />,
      size: 'small',
    },
    {
      id: 'keystrokes',
      type: 'stat',
      title: 'Total Keystrokes',
      value: totalKeystrokes.toLocaleString(),
      icon: <Keyboard className="w-6 h-6" />,
      size: 'small',
    },
    {
      id: 'activity-graph',
      type: 'chart',
      title: 'Activity Graph',
      chartType: 'line',
      data: reportData.slice(0, 7).reverse().map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        active: Number((item.total_active_minutes / 60).toFixed(1)),
        idle: Number((item.total_idle_minutes / 60).toFixed(1)),
      })),
      dataKeys: ['active', 'idle'],
      colors: ['#10b981', '#ef4444'],
      size: 'large',
    },
    {
      id: 'productivity-by-employee',
      type: 'chart',
      title: 'Activity by Employee (Hours)',
      chartType: 'bar',
      data: Array.from(new Set(reportData.map(r => r.employee_name))).map(name => {
        const employeeLogs = reportData.filter(r => r.employee_name === name);
        const totalActive = employeeLogs.reduce((acc, curr) => acc + (Number(curr.total_active_minutes) || 0), 0);
        return {
          name,
          hours: Number((totalActive / 60).toFixed(1))
        };
      }),
      dataKeys: ['hours'],
      colors: ['#3b82f6'],
      size: 'medium',
    },
    {
      id: 'recent-time-logs',
      type: 'table',
      title: 'Recent Time Logs',
      columns: [
        { key: 'employee_name', label: 'Employee' },
        { key: 'date', label: 'Date', render: (val: unknown) => new Date(val as string | number | Date).toLocaleDateString() },
        { key: 'total_active_minutes', label: 'Active', render: (val: unknown) => formatDuration(Number(val)) },
        { key: 'total_idle_minutes', label: 'Idle', render: (val: unknown) => formatDuration(Number(val)) },
        { key: 'total_keystrokes', label: 'Keystrokes' },
        { key: 'total_mouse_clicks', label: 'Clicks' },
      ],
      data: reportData.slice(0, 10),
      size: 'full',
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking Dashboard</h1>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
        </div>

        <DynamicDashboard 
          moduleName="time-track"
          title=""
          widgets={timeTrackWidgets}
        />
      </main>
    </div>
  );
}
