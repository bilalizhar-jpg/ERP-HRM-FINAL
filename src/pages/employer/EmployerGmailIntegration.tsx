import { useState, useEffect } from 'react';
import { 
  Mail, 
  Shield, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  XCircle,
  Settings as SettingsIcon,
  Save,
  Loader2
} from 'lucide-react';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

interface SmtpSettings {
  host: string;
  port: string;
  user: string;
  pass: string;
  secure: boolean;
  fromEmail: string;
  fromName: string;
}

export default function EmployerGmailIntegration() {
  const [gmailStatus, setGmailStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    host: '',
    port: '587',
    user: '',
    pass: '',
    secure: false,
    fromEmail: '',
    fromName: ''
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    const companyAdmin = localStorage.getItem('companyAdmin');
    if (companyAdmin) {
      const company = JSON.parse(companyAdmin);
      setCompanyId(company.id);
      setCompanyName(company.name);
      fetchStatus(company.id);
      fetchSmtpSettings(company.id);
    }
  }, []);

  const fetchStatus = async (id: string) => {
    try {
      const res = await fetchWithRetry(`/api/gmail/status?companyId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setGmailStatus(data.connected ? 'connected' : 'disconnected');
        setGmailEmail(data.email);
      }
    } catch (error) {
      console.error("Error fetching status", error);
      setGmailStatus('disconnected');
    }
  };

  const fetchSmtpSettings = async (id: string) => {
    try {
      const res = await fetchWithRetry(`/api/smtp/settings?companyId=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSmtpSettings(data);
        }
      }
    } catch (error) {
      console.error("Error fetching SMTP settings", error);
    }
  };

  const handleGmailConnect = async () => {
    if (!companyId) return;
    try {
      const res = await fetchWithRetry(`/api/gmail/auth-url?companyId=${companyId}&source=employer`);
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error connecting Gmail", error);
    }
  };

  const handleGmailDisconnect = async () => {
    if (!companyId) return;
    if (!confirm('Are you sure you want to disconnect Gmail?')) return;
    try {
      const res = await fetchWithRetry('/api/gmail/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      if (res.ok) {
        fetchStatus(companyId);
      }
    } catch (error) {
      console.error("Error disconnecting Gmail", error);
    }
  };

  const handleSaveSmtp = async () => {
    if (!companyId) return;
    setIsSavingSmtp(true);
    try {
      const res = await fetchWithRetry('/api/smtp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          settings: smtpSettings
        })
      });
      if (res.ok) {
        alert('SMTP settings saved successfully!');
      } else {
        alert('Failed to save SMTP settings.');
      }
    } catch (error) {
      console.error("Error saving SMTP settings", error);
      alert('An error occurred while saving.');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    try {
      const res = await fetchWithRetry('/api/smtp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpSettings)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Test email sent successfully! Please check your inbox.');
      } else {
        alert('Failed to send test email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error testing SMTP", error);
      alert('An error occurred while testing.');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  return (
    <div className="p-0">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">GMAIL & SMTP INTEGRATION</h1>
          <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">CONFIGURE CORPORATE COMMUNICATION PROTOCOLS</p>
        </div>
        <div className="bg-white rounded-xl px-6 py-3 text-slate-900 text-sm font-black shadow-sm border border-slate-100 uppercase tracking-tight">
          {companyName || '---'}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gmail Status Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            {gmailStatus === 'connected' ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                <CheckCircle2 size={14} />
                ACTIVE PROTOCOL
              </div>
            ) : gmailStatus === 'loading' ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                SYNCING...
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                <XCircle size={14} />
                INACTIVE
              </div>
            )}
          </div>

          <div className="flex items-start gap-8 mb-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
              gmailStatus === 'connected' ? 'bg-blue-600 shadow-blue-200 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              <Mail size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">GMAIL INTEGRATION</h2>
              <p className="text-slate-400 text-sm font-medium max-w-md">
                Connect your corporate Gmail account to enable automated email notifications, recruitment communications, and payroll delivery.
              </p>
            </div>
          </div>

          {gmailStatus === 'connected' && (
            <div className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CONNECTED ACCOUNT</p>
              <p className="text-lg font-black text-slate-900 uppercase">{gmailEmail}</p>
            </div>
          )}

          <div className="flex gap-4">
            {gmailStatus === 'connected' ? (
              <button 
                onClick={handleGmailDisconnect}
                className="flex-1 py-5 bg-rose-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} /> DISCONNECT ACCOUNT
              </button>
            ) : (
              <button 
                onClick={handleGmailConnect}
                disabled={gmailStatus === 'loading'}
                className="flex-1 py-5 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Shield size={20} /> AUTHORIZE GMAIL ACCESS
              </button>
            )}
          </div>
        </div>

        {/* SMTP Settings Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <SettingsIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">SMTP SETTINGS</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OFFICE EMAIL CONFIGURATION</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">SMTP HOST</label>
                <input 
                  type="text" 
                  placeholder="smtp.gmail.com"
                  value={smtpSettings.host || ''}
                  onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">SMTP PORT</label>
                <input 
                  type="text" 
                  placeholder="587"
                  value={smtpSettings.port || ''}
                  onChange={(e) => setSmtpSettings({...smtpSettings, port: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">USERNAME</label>
                <input 
                  type="text" 
                  placeholder="your-email@company.com"
                  value={smtpSettings.user || ''}
                  onChange={(e) => setSmtpSettings({...smtpSettings, user: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PASSWORD</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={smtpSettings.pass || ''}
                  onChange={(e) => setSmtpSettings({...smtpSettings, pass: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">SENDER EMAIL</label>
                <input 
                  type="email" 
                  placeholder="noreply@company.com"
                  value={smtpSettings.fromEmail || ''}
                  onChange={(e) => setSmtpSettings({...smtpSettings, fromEmail: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">SENDER NAME</label>
                <input 
                  type="text" 
                  placeholder="Acme Corp HR"
                  value={smtpSettings.fromName || ''}
                  onChange={(e) => setSmtpSettings({...smtpSettings, fromName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-4">
              <input 
                type="checkbox" 
                id="secure"
                checked={smtpSettings.secure}
                onChange={(e) => setSmtpSettings({...smtpSettings, secure: e.target.checked})}
                className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="secure" className="text-xs font-black text-slate-600 uppercase tracking-wider">USE SECURE CONNECTION (SSL/TLS)</label>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleSaveSmtp}
                disabled={isSavingSmtp}
                className="flex-1 py-4 bg-slate-900 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {isSavingSmtp ? <Loader2 className="animate-spin" /> : <><Save size={18} /> SAVE PROTOCOL</>}
              </button>
              <button 
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="flex-1 py-4 bg-white border-2 border-slate-900 text-slate-900 font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                {isTestingSmtp ? <Loader2 className="animate-spin" /> : <><Send size={18} /> TEST CONNECTION</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
