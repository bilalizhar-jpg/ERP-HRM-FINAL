import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DynamicDashboard, WidgetConfig } from '../../components/dashboard/DynamicDashboard';
import { Clock, MousePointer2, Keyboard, Activity, Loader2, Settings as SettingsIcon, Save, UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';

interface TimeTrackingSetting {
  company_id: number;
  employee_id: number;
  employee_name?: string;
  status: 'active' | 'deactive';
  auto_mode: 'on' | 'off';
}

interface Employee {
  id: number;
  name: string;
}

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settingsList, setSettingsList] = useState<TimeTrackingSetting[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'deactive'>('deactive');
  const [autoMode, setAutoMode] = useState<'on' | 'off'>('off');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const companyAdmin = localStorage.getItem('companyAdmin');
    if (companyAdmin) {
      const company = JSON.parse(companyAdmin);
      setCompanyId(company.id);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    if (!companyId) return;
    try {
      const response = await fetch(`/api/employees?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, [companyId]);

  const fetchSettingsList = useCallback(async () => {
    if (!companyId) return;
    try {
      const response = await fetch(`/api/time-tracking/settings/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setSettingsList(data);
      }
    } catch (error) {
      console.error('Error fetching settings list:', error);
    }
  }, [companyId]);

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
    if (companyId) {
      fetchReport();
      fetchEmployees();
      fetchSettingsList();
    }
  }, [companyId, fetchReport, fetchEmployees, fetchSettingsList]);

  const handleSaveSettings = async () => {
    if (!companyId || !selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/time-tracking/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: parseInt(companyId),
          employee_id: parseInt(selectedEmployeeId),
          status,
          auto_mode: autoMode,
          is_enabled: status === 'active'
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully');
        fetchSettingsList();
        // Reset form
        setSelectedEmployeeId('');
        setStatus('deactive');
        setAutoMode('off');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              {showSettings ? 'View Dashboard' : 'Tracking Rules'}
            </button>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
          </div>
        </div>

        {showSettings ? (
          <div className="space-y-8">
            {/* Add Rule Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Add Time Tracking Rule</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                  <select 
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setStatus('active')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Active
                    </button>
                    <button 
                      onClick={() => setStatus('deactive')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'deactive' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Deactive
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto Mode</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setAutoMode('on')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${autoMode === 'on' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Auto ON
                    </button>
                    <button 
                      onClick={() => setAutoMode('off')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${autoMode === 'off' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Auto OFF
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Rule
                  </button>
                </div>
              </div>
            </div>

            {/* Rules List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Configured Rules</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Employee</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Tracking Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {settingsList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">No rules configured yet.</td>
                      </tr>
                    ) : (
                      settingsList.map((setting, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900">{setting.employee_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${setting.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {setting.status === 'active' ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                              {setting.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${setting.auto_mode === 'on' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {setting.auto_mode === 'on' ? 'Automatic' : 'Manual'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <DynamicDashboard 
            moduleName="time-track"
            title=""
            widgets={timeTrackWidgets}
          />
        )}
      </main>
    </div>
  );
}
