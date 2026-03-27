import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Maximize2, 
  Menu, 
  Search,
  FileText,
  Mail,
  RefreshCw,
  Send,
  FileSpreadsheet,
  Bell,
  History
} from 'lucide-react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

export default function GmailIntegration() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [emailsSentToday, setEmailsSentToday] = useState(0);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingSmtpTest, setIsSendingSmtpTest] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);

  // SMTP State
  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '587',
    user: '',
    password: '',
    encryption: 'tls', // 'none', 'ssl', 'tls'
    fromEmail: '',
    fromName: 'ERP System'
  });

  useEffect(() => {
    fetchStatus();
    fetchSmtpSettings('global');
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/gmail/status');
      const data = await res.json();
      setStatus(data.connected ? 'connected' : 'disconnected');
      setLastSync(data.lastSync);
      setEmailsSentToday(data.sentToday || 0);
    } catch {
      setStatus('disconnected');
    }
  };

  const fetchSmtpSettings = async (companyId: string) => {
    try {
      const res = await fetch(`/api/smtp/settings?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSmtpSettings(data);
        } else {
          setSmtpSettings({
            host: '',
            port: '587',
            user: '',
            password: '',
            encryption: 'tls',
            fromEmail: '',
            fromName: 'ERP System'
          });
        }
      }
    } catch (error) {
      console.error("Error fetching SMTP settings:", error);
    }
  };

  const handleSaveSmtp = async () => {
    setIsSavingSmtp(true);
    try {
      const res = await fetch('/api/smtp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'global',
          settings: smtpSettings
        })
      });
      if (res.ok) {
        alert('SMTP settings saved successfully!');
      } else {
        alert('Failed to save SMTP settings');
      }
    } catch (error) {
      console.error("Error saving SMTP settings:", error);
      alert('Error saving SMTP settings');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendSmtpTest = async () => {
    setIsSendingSmtpTest(true);
    try {
      const res = await fetch('/api/smtp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpSettings)
      });
      const data = await res.json();
      if (data.success) {
        alert('SMTP test email sent successfully!');
      } else {
        alert('Failed to send SMTP test email: ' + data.message);
      }
    } catch (error) {
      console.error("Error sending SMTP test email:", error);
      alert('Error sending SMTP test email');
    } finally {
      setIsSendingSmtpTest(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/gmail/auth-url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.message) {
        alert(data.message);
      } else {
        alert('Failed to get authorization URL');
      }
    } catch {
      alert('Failed to connect to the server. Please try again.');
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const res = await fetch('/api/gmail/send-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Test email sent successfully!');
        fetchStatus();
      } else {
        alert('Failed to send test email: ' + data.message);
      }
    } catch {
      alert('Error sending test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const features = [
    { name: 'Send Emails', icon: Mail, description: 'Automated system communications' },
    { name: 'Send Invoices', icon: FileText, description: 'Direct billing to clients' },
    { name: 'Send Payroll Slips', icon: FileSpreadsheet, description: 'Secure employee payroll delivery' },
    { name: 'Employee Notifications', icon: Bell, description: 'Internal system alerts' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search protocol..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <Maximize2 size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">SUPER ADMIN</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">NETWORK ARCHITECT</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                NA
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">GMAIL INTEGRATION</h1>
            <p className="text-slate-500 font-medium mt-1">Configure and monitor Google Mail protocol for system communications.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                    <Mail size={32} />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${
                    status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 
                    status === 'loading' ? 'bg-slate-50 text-slate-400' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      status === 'connected' ? 'bg-emerald-600' : 
                      status === 'loading' ? 'bg-slate-400 animate-pulse' : 'bg-rose-600'
                    }`} />
                    {status.toUpperCase()}
                  </div>
                </div>

                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Gmail Status</h2>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  {status === 'connected' 
                    ? 'System is currently authorized to send emails via Gmail API.' 
                    : 'Authorize the system to use your Gmail account for automated protocols.'}
                </p>

                <div className="space-y-4">
                  {status === 'connected' ? (
                    <>
                      <button 
                        onClick={handleSendTestEmail}
                        disabled={isSendingTest}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                      >
                        {isSendingTest ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                        Send Test Email
                      </button>
                      <button 
                        onClick={handleConnect}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        <RefreshCw size={16} />
                        Reconnect Account
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleConnect}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      <Mail size={16} />
                      Connect Gmail
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">PROTOCOL METRICS</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <History size={18} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Sync Time</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{lastSync || 'NEVER'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <Send size={18} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Emails Sent Today</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{emailsSentToday}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="lg:col-span-2 space-y-8">
              {/* SMTP Settings Card */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">SMTP Settings</h2>
                    <p className="text-slate-500 text-sm font-medium">Configure custom SMTP server for system-wide communications.</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Send size={24} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                    <input 
                      type="text" 
                      placeholder="smtp.example.com"
                      value={smtpSettings.host}
                      onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Port</label>
                    <input 
                      type="text" 
                      placeholder="587"
                      value={smtpSettings.port}
                      onChange={(e) => setSmtpSettings({...smtpSettings, port: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Username</label>
                    <input 
                      type="text" 
                      placeholder="user@example.com"
                      value={smtpSettings.user}
                      onChange={(e) => setSmtpSettings({...smtpSettings, user: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={smtpSettings.password}
                      onChange={(e) => setSmtpSettings({...smtpSettings, password: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encryption</label>
                    <select 
                      value={smtpSettings.encryption}
                      onChange={(e) => setSmtpSettings({...smtpSettings, encryption: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase appearance-none"
                    >
                      <option value="none">None</option>
                      <option value="ssl">SSL</option>
                      <option value="tls">TLS</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Email</label>
                    <input 
                      type="email" 
                      placeholder="noreply@example.com"
                      value={smtpSettings.fromEmail}
                      onChange={(e) => setSmtpSettings({...smtpSettings, fromEmail: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={handleSaveSmtp}
                    disabled={isSavingSmtp}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {isSavingSmtp ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Save SMTP Settings
                  </button>
                  <button 
                    onClick={handleSendSmtpTest}
                    disabled={isSendingSmtpTest}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                  >
                    {isSendingSmtpTest ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    Test SMTP Connection
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">System Features</h2>
                <p className="text-slate-500 text-sm font-medium mb-8">The following system modules will utilize the Gmail protocol once connected.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature) => (
                    <div key={feature.name} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm mb-4 transition-colors">
                        <feature.icon size={24} />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">{feature.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{feature.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">Security Protocol</h5>
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                      Integration uses OAuth 2.0 standard. Access is limited to sending emails only. Your credentials are never stored on our servers; only encrypted access tokens are used.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
