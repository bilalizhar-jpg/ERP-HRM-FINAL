import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Monitor, 
  TrendingUp, 
  AlertCircle, 
  Search,
  Download,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Clock,
  Camera,
  Layout,
  Globe,
  MousePointer,
  Keyboard,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const employeeStats = [
  { id: 1, name: 'John Doe', department: 'Engineering', activeTime: '7h 45m', productivity: 92, status: 'Active', idleTime: '15m' },
  { id: 2, name: 'Jane Smith', department: 'Design', activeTime: '6h 30m', productivity: 85, status: 'Active', idleTime: '45m' },
  { id: 3, name: 'Mike Johnson', department: 'Marketing', activeTime: '4h 15m', productivity: 65, status: 'Idle', idleTime: '2h 10m' },
  { id: 4, name: 'Sarah Wilson', department: 'Engineering', activeTime: '8h 00m', productivity: 98, status: 'Active', idleTime: '5m' },
];

const departmentData = [
  { name: 'Engineering', productivity: 94 },
  { name: 'Design', productivity: 88 },
  { name: 'Marketing', productivity: 72 },
  { name: 'Sales', productivity: 81 },
  { name: 'HR', productivity: 90 },
];

interface ProductivityRule {
  id?: number;
  company_id: number;
  name: string;
  activity_type: string;
  is_productive: boolean;
}

export default function AdminMonitoringDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    idle_threshold_minutes: 5,
    screenshot_enabled: true,
    screenshot_interval_minutes: 10,
    track_apps: true,
    track_internet: true,
    track_mouse_clicks: true,
    track_keyboard_activity: true,
    track_location: true
  });
  const [classifications, setClassifications] = useState<ProductivityRule[]>([]);
  const [newRule, setNewRule] = useState<Omit<ProductivityRule, 'id' | 'company_id'>>({ name: '', activity_type: 'app', is_productive: true });
  const [editingRule, setEditingRule] = useState<ProductivityRule | null>(null);
  const [loading, setLoading] = useState(false);

  const companyData = JSON.parse(localStorage.getItem('companyAdmin') || '{}');
  const companyId = companyData.id;

  const fetchSettings = useCallback(async () => {
    if (!companyId) return;
    try {
      const response = await fetch(`/api/monitoring/company-settings/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [companyId]);

  const fetchClassifications = useCallback(async () => {
    if (!companyId) return;
    try {
      const response = await fetch(`/api/monitoring/classifications/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setClassifications(data);
      }
    } catch (error) {
      console.error('Error fetching classifications:', error);
    }
  }, [companyId]);

  useEffect(() => {
    if (showSettings && companyId) {
      fetchSettings();
      fetchClassifications();
    }
  }, [showSettings, companyId, fetchSettings, fetchClassifications]);

  const saveSettings = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/monitoring/company-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, company_id: companyId })
      });
      if (response.ok) {
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    if (!newRule.name || !companyId) return;
    try {
      const response = await fetch('/api/monitoring/classifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRule, company_id: companyId })
      });
      if (response.ok) {
        fetchClassifications();
        setNewRule({ name: '', activity_type: 'app', is_productive: true });
      }
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const updateRule = async (rule: ProductivityRule) => {
    try {
      const response = await fetch('/api/monitoring/classifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, company_id: companyId })
      });
      if (response.ok) {
        fetchClassifications();
        setEditingRule(null);
      }
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const toggleRuleStatus = async (rule: ProductivityRule) => {
    const updatedRule = { ...rule, is_productive: !rule.is_productive };
    try {
      const response = await fetch('/api/monitoring/classifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedRule, company_id: companyId })
      });
      if (response.ok) {
        fetchClassifications();
      }
    } catch (error) {
      console.error('Error toggling rule status:', error);
    }
  };

  const preloadDefaults = async () => {
    if (!companyId) return;
    const defaults = [
      { name: 'Slack', activity_type: 'app', is_productive: true },
      { name: 'VS Code', activity_type: 'app', is_productive: true },
      { name: 'Zoom', activity_type: 'app', is_productive: true },
      { name: 'Microsoft Teams', activity_type: 'app', is_productive: true },
      { name: 'Trello', activity_type: 'app', is_productive: true },
      { name: 'Jira', activity_type: 'app', is_productive: true },
      { name: 'github.com', activity_type: 'website', is_productive: true },
      { name: 'stackoverflow.com', activity_type: 'website', is_productive: true },
      { name: 'google.com', activity_type: 'website', is_productive: true },
      { name: 'linkedin.com', activity_type: 'website', is_productive: true },
      { name: 'Spotify', activity_type: 'app', is_productive: false },
      { name: 'Steam', activity_type: 'app', is_productive: false },
      { name: 'Discord', activity_type: 'app', is_productive: false },
      { name: 'facebook.com', activity_type: 'website', is_productive: false },
      { name: 'youtube.com', activity_type: 'website', is_productive: false },
      { name: 'netflix.com', activity_type: 'website', is_productive: false },
      { name: 'twitter.com', activity_type: 'website', is_productive: false },
      { name: 'reddit.com', activity_type: 'website', is_productive: false },
    ];

    setLoading(true);
    try {
      for (const rule of defaults) {
        await fetch('/api/monitoring/classifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...rule, company_id: companyId })
        });
      }
      fetchClassifications();
    } catch (error) {
      console.error('Error preloading defaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (id: number) => {
    try {
      const response = await fetch(`/api/monitoring/classifications/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchClassifications();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Monitoring Dashboard</h1>
          <p className="text-slate-500">Company-wide productivity and activity overview</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
            <Download size={18} />
            Export Reports
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Settings size={18} />
            Monitoring Settings
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Monitoring Settings</h2>
                  <p className="text-sm text-slate-500">Configure tracking rules for the entire company</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* General Tracking Settings */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Clock size={16} />
                        Time & Activity
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Idle Time Threshold (Minutes)</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={settings.idle_threshold_minutes}
                            onChange={(e) => setSettings({...settings, idle_threshold_minutes: parseInt(e.target.value)})}
                          />
                          <p className="text-xs text-slate-400 mt-1 text-italic">Time after which an employee is marked as idle</p>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                              <Camera size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">Screenshots</p>
                              <p className="text-xs text-slate-500">Capture random screenshots</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSettings({...settings, screenshot_enabled: !settings.screenshot_enabled})}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.screenshot_enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.screenshot_enabled ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>

                        {settings.screenshot_enabled && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pl-4 border-l-2 border-blue-100"
                          >
                            <label className="block text-sm font-medium text-slate-700 mb-2">Screenshot Interval (Minutes)</label>
                            <input 
                              type="number" 
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                              value={settings.screenshot_interval_minutes}
                              onChange={(e) => setSettings({...settings, screenshot_interval_minutes: parseInt(e.target.value)})}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Layout size={16} />
                        Tracking Modules
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { key: 'track_apps', label: 'Application Tracking', icon: Layout, desc: 'Track active window names' },
                          { key: 'track_internet', label: 'Internet Usage', icon: Globe, desc: 'Track visited URLs' },
                          { key: 'track_mouse_clicks', label: 'Mouse Activity', icon: MousePointer, desc: 'Track click frequency' },
                          { key: 'track_keyboard_activity', label: 'Keyboard Activity', icon: Keyboard, desc: 'Track keystroke frequency' },
                          { key: 'track_location', label: 'Location Tracking', icon: MapPin, desc: 'Track IP-based location' },
                        ].map((module) => (
                          <div key={module.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                                <module.icon size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{module.label}</p>
                                <p className="text-xs text-slate-500">{module.desc}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setSettings({...settings, [module.key]: !settings[module.key as keyof typeof settings]})}
                              className={`w-12 h-6 rounded-full transition-colors relative ${settings[module.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[module.key as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Productivity Rules */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Productivity Rules
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add New Rule</p>
                          {classifications.length === 0 && (
                            <button 
                              onClick={preloadDefaults}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1"
                            >
                              <Plus size={12} />
                              Preload Defaults
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="App or Website name..."
                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={editingRule ? editingRule.name : newRule.name}
                            onChange={(e) => editingRule ? setEditingRule({...editingRule, name: e.target.value}) : setNewRule({...newRule, name: e.target.value})}
                          />
                          <select 
                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
                            value={editingRule ? editingRule.activity_type : newRule.activity_type}
                            onChange={(e) => editingRule ? setEditingRule({...editingRule, activity_type: e.target.value}) : setNewRule({...newRule, activity_type: e.target.value})}
                          >
                            <option value="app">App</option>
                            <option value="website">Web</option>
                          </select>
                          <button 
                            onClick={editingRule ? () => updateRule(editingRule) : addRule}
                            className={`p-2 rounded-xl text-white transition-all shadow-md active:scale-95 ${editingRule ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
                          >
                            {editingRule ? <Check size={20} /> : <Plus size={20} />}
                          </button>
                          {editingRule && (
                            <button 
                              onClick={() => setEditingRule(null)}
                              className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input 
                                type="radio" 
                                name="productivity_status"
                                checked={editingRule ? editingRule.is_productive : newRule.is_productive} 
                                onChange={() => editingRule ? setEditingRule({...editingRule, is_productive: true}) : setNewRule({...newRule, is_productive: true})}
                                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                              />
                            </div>
                            <span className={`text-xs font-bold transition-colors ${ (editingRule ? editingRule.is_productive : newRule.is_productive) ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>Productive</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input 
                                type="radio" 
                                name="productivity_status"
                                checked={editingRule ? !editingRule.is_productive : !newRule.is_productive} 
                                onChange={() => editingRule ? setEditingRule({...editingRule, is_productive: false}) : setNewRule({...newRule, is_productive: false})}
                                className="w-4 h-4 text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                              />
                            </div>
                            <span className={`text-xs font-bold transition-colors ${ !(editingRule ? editingRule.is_productive : newRule.is_productive) ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'}`}>Unproductive</span>
                          </label>
                        </div>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 text-slate-500 text-left sticky top-0 border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-widest">Name</th>
                              <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-widest text-center">Type</th>
                              <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-widest text-center">Status</th>
                              <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {classifications.map((rule) => (
                              <tr key={rule.id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-700">{rule.name}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200">
                                    {rule.activity_type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button 
                                    onClick={() => toggleRuleStatus(rule)}
                                    className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95 border ${rule.is_productive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
                                  >
                                    {rule.is_productive ? 'Productive' : 'Unproductive'}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button 
                                      onClick={() => setEditingRule(rule)}
                                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                      title="Edit Rule"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => rule.id && deleteRule(rule.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                      title="Delete Rule"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {classifications.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-6 py-16 text-center">
                                  <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-300">
                                      <Layout size={32} />
                                    </div>
                                    <p className="text-slate-500 font-bold text-sm">No productivity rules defined yet.</p>
                                    <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                                      Define which applications and websites are considered productive for your team.
                                    </p>
                                    <button 
                                      onClick={preloadDefaults}
                                      className="mt-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                                    >
                                      Preload Common Rules
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveSettings}
                  disabled={loading}
                  className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (
                    <>
                      <Check size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Stats */}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <ArrowUpRight size={14} />
              12%
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">Total Monitored</h3>
          <p className="text-2xl font-bold text-slate-900">124 Employees</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <ArrowUpRight size={14} />
              3.4%
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">Avg Productivity</h3>
          <p className="text-2xl font-bold text-slate-900">84.2%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div className="flex items-center gap-1 text-rose-600 text-xs font-bold">
              <ArrowDownRight size={14} />
              2.1%
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">Idle Time Avg</h3>
          <p className="text-2xl font-bold text-slate-900">42m / day</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Monitor size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">Active Now</h3>
          <p className="text-2xl font-bold text-slate-900">98 / 124</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Department Productivity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Department Productivity Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="productivity" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Activity Distribution</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">Productive Time</span>
                <span className="text-slate-900 font-bold">78%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '78%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">Neutral Time</span>
                <span className="text-slate-900 font-bold">15%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '15%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">Unproductive Time</span>
                <span className="text-slate-900 font-bold">7%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: '7%' }} />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Unproductive Apps</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Facebook</span>
                <span className="text-xs font-bold text-rose-600">12.4 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">YouTube</span>
                <span className="text-xs font-bold text-rose-600">8.2 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Twitter</span>
                <span className="text-xs font-bold text-rose-600">5.1 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">Employee Activity Overview</h3>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search employee..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option>All Departments</option>
              <option>Development</option>
              <option>Design</option>
              <option>Marketing</option>
              <option>HR</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Productivity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Active Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Idle Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeStats.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${emp.productivity > 90 ? 'bg-emerald-500' : emp.productivity > 80 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                          style={{ width: `${emp.productivity}%` }} 
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{emp.productivity}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">{emp.activeTime}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{emp.idleTime}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        emp.status === 'active' ? 'bg-emerald-500' : 
                        emp.status === 'idle' ? 'bg-amber-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-xs font-bold text-slate-600 capitalize">{emp.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 5 of 124 employees</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Previous</button>
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
