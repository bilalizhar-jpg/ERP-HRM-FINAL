import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Search, MousePointer2, Keyboard,
  Activity, Image as ImageIcon, X, AlertCircle, Coffee
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
  id: number;
  name: string;
  employee_id: string;
  department: string;
}

interface TimeLog {
  id: number;
  date: string;
  hour: number;
  active_minutes: number;
  idle_minutes: number;
  keystrokes: number;
  mouse_clicks: number;
}

interface Screenshot {
  id: number;
  timestamp: string;
  image_data: string;
}

interface TrackingSettings {
  is_enabled: boolean;
  screenshot_enabled: boolean;
  screenshot_interval: number;
  idle_threshold: number;
}

export default function CompanyAdminTimeTracking() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [settings, setSettings] = useState<TrackingSettings>({
    is_enabled: false,
    screenshot_enabled: false,
    screenshot_interval: 10,
    idle_threshold: 5
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'screenshots' | 'settings'>('logs');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const companyAdmin = JSON.parse(localStorage.getItem('companyAdmin') || '{}');

  useEffect(() => {
    if (!companyAdmin.id) {
      navigate('/company-admin/login');
      return;
    }
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyAdmin.id, navigate]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/employees?company_id=${companyAdmin.id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployee(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchData = useCallback(async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      // Fetch Settings
      const settingsRes = await fetch(`/api/time-tracking/settings/${companyAdmin.id}/${selectedEmployee}`);
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }

      // Fetch Logs
      const logsRes = await fetch(`/api/time-tracking/logs/${companyAdmin.id}/${selectedEmployee}?date=${selectedDate}`);
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }

      // Fetch Screenshots
      const screensRes = await fetch(`/api/time-tracking/screenshots/${companyAdmin.id}/${selectedEmployee}?date=${selectedDate}`);
      if (screensRes.ok) {
        setScreenshots(await screensRes.json());
      }
    } catch (error) {
      console.error("Error fetching time tracking data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, selectedDate, companyAdmin.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSettings = async () => {
    if (!selectedEmployee) return;
    try {
      const res = await fetch('/api/time-tracking/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyAdmin.id,
          employee_id: selectedEmployee,
          ...settings
        })
      });
      if (res.ok) {
        alert('Settings saved successfully');
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Failed to save settings');
    }
  };

  const totalActive = logs.reduce((sum, log) => sum + log.active_minutes, 0);
  const totalIdle = logs.reduce((sum, log) => sum + log.idle_minutes, 0);
  const totalKeystrokes = logs.reduce((sum, log) => sum + log.keystrokes, 0);
  const totalClicks = logs.reduce((sum, log) => sum + log.mouse_clicks, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Time Tracking</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Monitor employee activity and productivity</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedEmployee || ''}
            onChange={(e) => setSelectedEmployee(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
          >
            <option value="" disabled>Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_id})</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Time</p>
              <p className="text-2xl font-black text-slate-900">{Math.floor(totalActive / 60)}h {totalActive % 60}m</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coffee size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Idle Time</p>
              <p className="text-2xl font-black text-slate-900">{Math.floor(totalIdle / 60)}h {totalIdle % 60}m</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Keyboard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keystrokes</p>
              <p className="text-2xl font-black text-slate-900">{totalKeystrokes.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MousePointer2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mouse Clicks</p>
              <p className="text-2xl font-black text-slate-900">{totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-colors ${
              activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('screenshots')}
            className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-colors ${
              activeTab === 'screenshots' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            Screenshots
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-colors ${
              activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Activity Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  {logs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Activity size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold uppercase tracking-widest">No activity logs for this date</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Time (Hour)</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Active Min</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Idle Min</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Keystrokes</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Mouse Clicks</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Activity Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map(log => {
                            const totalMin = log.active_minutes + log.idle_minutes;
                            const activePercent = totalMin > 0 ? (log.active_minutes / totalMin) * 100 : 0;
                            return (
                              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 border-b border-slate-50">
                                  {log.hour.toString().padStart(2, '0')}:00 - {(log.hour + 1).toString().padStart(2, '0')}:00
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-emerald-600 border-b border-slate-50">{log.active_minutes}m</td>
                                <td className="px-6 py-4 text-sm font-bold text-amber-600 border-b border-slate-50">{log.idle_minutes}m</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">{log.keystrokes}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-50">{log.mouse_clicks}</td>
                                <td className="px-6 py-4 border-b border-slate-50">
                                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className={`h-2.5 rounded-full ${activePercent > 80 ? 'bg-emerald-500' : activePercent > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                      style={{ width: `${activePercent}%` }}
                                    ></div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Screenshots Tab */}
              {activeTab === 'screenshots' && (
                <div className="space-y-6">
                  {!settings.screenshot_enabled && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-800 mb-6">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Screenshots are currently disabled for this employee.</p>
                        <p className="text-xs mt-1 opacity-80">Enable them in the Settings tab to start capturing.</p>
                      </div>
                    </div>
                  )}
                  
                  {screenshots.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold uppercase tracking-widest">No screenshots for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {screenshots.map(shot => (
                        <div key={shot.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedImage(shot.image_data)}>
                          <div className="aspect-video bg-slate-100 relative">
                            <img src={shot.image_data} alt="Screenshot" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                              <Search size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="p-3 bg-white">
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                              <Clock size={12} />
                              {format(new Date(shot.timestamp), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Enable Time Tracking</h3>
                        <p className="text-xs text-slate-500 mt-1">Allow activity monitoring for this employee</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.is_enabled}
                          onChange={(e) => setSettings({...settings, is_enabled: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Enable Screenshots</h3>
                        <p className="text-xs text-slate-500 mt-1">Capture periodic screen images</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.screenshot_enabled}
                          onChange={(e) => setSettings({...settings, screenshot_enabled: e.target.checked})}
                          disabled={!settings.is_enabled}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="block font-black text-slate-900 uppercase tracking-widest text-sm mb-2">
                          Screenshot Interval (Min)
                        </label>
                        <input 
                          type="number" 
                          min="1"
                          max="60"
                          value={settings.screenshot_interval}
                          onChange={(e) => setSettings({...settings, screenshot_interval: Number(e.target.value)})}
                          disabled={!settings.screenshot_enabled}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50"
                        />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="block font-black text-slate-900 uppercase tracking-widest text-sm mb-2">
                          Idle Threshold (Min)
                        </label>
                        <input 
                          type="number" 
                          min="1"
                          max="60"
                          value={settings.idle_threshold}
                          onChange={(e) => setSettings({...settings, idle_threshold: Number(e.target.value)})}
                          disabled={!settings.is_enabled}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      onClick={handleSaveSettings}
                      className="px-8 py-4 bg-blue-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X size={20} />
              </button>
              <img src={selectedImage} alt="Full size screenshot" className="w-full h-auto max-h-[85vh] object-contain" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
