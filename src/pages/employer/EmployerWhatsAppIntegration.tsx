import { useState, useEffect, useCallback } from 'react';
import { 
  Maximize2, 
  Search,
  MessageSquare,
  QrCode,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';

interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'connecting';
  qr: string | null;
}

export default function EmployerWhatsAppIntegration() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from ERP Platform!');
  const [isSending, setIsSending] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  // Attendance Alert Settings State
  const [officeTime, setOfficeTime] = useState('09:00');
  const [graceTime, setGraceTime] = useState('09:15');
  const [triggerTime, setTriggerTime] = useState('09:16');
  const [messageTemplate, setMessageTemplate] = useState('Dear {{employee_name}}, you have not marked your attendance. Please mark it immediately.');
  const [isActive, setIsActive] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const companyAdmin = localStorage.getItem('companyAdmin');
    if (companyAdmin) {
      const company = JSON.parse(companyAdmin);
      setCompanyId(Number(company.id));
      setCompanyName(company.name);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/whatsapp/status?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching status", error);
    }
  }, [companyId]);

  const fetchAttendanceSettings = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/whatsapp/attendance-settings?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setOfficeTime(data.office_time ? data.office_time.substring(0, 5) : '09:00');
          setGraceTime(data.grace_time ? data.grace_time.substring(0, 5) : '09:15');
          setTriggerTime(data.trigger_time ? data.trigger_time.substring(0, 5) : '09:16');
          setMessageTemplate(data.message_template || 'Dear {{employee_name}}, you have not marked your attendance. Please mark it immediately.');
          setIsActive(Boolean(data.is_active));
        }
      }
    } catch (error) {
      console.error("Error fetching attendance settings", error);
    }
  }, [companyId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (companyId) {
      fetchStatus();
      fetchAttendanceSettings();
      interval = setInterval(fetchStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [companyId, fetchStatus, fetchAttendanceSettings]);

  const handleSaveSettings = async () => {
    if (!companyId) return;
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/whatsapp/attendance-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          office_time: officeTime,
          grace_time: graceTime,
          trigger_time: triggerTime,
          message_template: messageTemplate,
          is_active: isActive
        })
      });
      if (res.ok) {
        alert('Attendance alert settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error("Error saving settings", error);
      alert('Error saving settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleConnect = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      if (res.ok) {
        fetchStatus();
      } else {
        const data = await res.json();
        alert('Failed to initialize connection: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error connecting", error);
      alert('Network error while connecting to WhatsApp service');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!companyId) return;
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (error) {
      console.error("Error disconnecting", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!companyId || !testNumber || !testMessage) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          to_number: testNumber,
          message: testMessage
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Message sent successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error("Error sending message", error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-0">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">WHATSAPP INTEGRATION</h1>
          <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">CORPORATE COMMUNICATION PROTOCOL</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-xl px-6 py-3 text-slate-900 text-sm font-black shadow-sm border border-slate-100 uppercase tracking-tight">
            {companyName || '---'}
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <Search size={20} />
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <Maximize2 size={20} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              {status?.status === 'connected' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                  <CheckCircle2 size={14} />
                  ACTIVE CONNECTION
                </div>
              ) : status?.status === 'connecting' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">
                  <RefreshCw size={14} className="animate-spin" />
                  INITIALIZING...
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                  <XCircle size={14} />
                  DISCONNECTED
                </div>
              )}
            </div>

            <div className="flex items-start gap-8 mb-10">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
                status?.status === 'connected' ? 'bg-emerald-600 shadow-emerald-200 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <MessageSquare size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">WHATSAPP STATUS</h2>
                <p className="text-slate-400 text-sm font-medium max-w-md">
                  Connect your WhatsApp account to send automated invoices, payroll slips, and employee notifications directly to their phones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CURRENT COMPANY</p>
                <p className="text-lg font-black text-slate-900 uppercase">{companyName || '---'}</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MESSAGES SENT TODAY</p>
                <p className="text-lg font-black text-slate-900 uppercase">0</p>
              </div>
            </div>

            <div className="flex gap-4">
              {status?.status === 'connected' ? (
                <button 
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="flex-1 py-5 bg-rose-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Trash2 size={20} /> DISCONNECT ACCOUNT</>}
                </button>
              ) : (
                <button 
                  onClick={handleConnect}
                  disabled={loading || status?.status === 'connecting'}
                  className="flex-1 py-5 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><QrCode size={20} /> GENERATE QR CODE</>}
                </button>
              )}
            </div>
          </div>

          {/* Test Message Card */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">SEND TEST MESSAGE</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PHONE NUMBER (WITH COUNTRY CODE)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 923001234567"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">MESSAGE CONTENT</label>
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={handleSendTest}
                disabled={isSending || status?.status !== 'connected'}
                className={`w-full py-5 font-black text-sm tracking-widest uppercase rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  status?.status === 'connected' 
                    ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200' 
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {isSending ? <Loader2 className="animate-spin" /> : <><Send size={20} /> DISPATCH TEST PROTOCOL</>}
              </button>
            </div>
          </div>

          {/* Attendance Alert Settings Card */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">ATTENDANCE ALERT RULES</h2>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isActive ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isActive ? 'ACTIVE' : 'DISABLED'}
                </div>
              </label>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">OFFICE TIME</label>
                  <input 
                    type="time" 
                    value={officeTime}
                    onChange={(e) => setOfficeTime(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">GRACE TIME</label>
                  <input 
                    type="time" 
                    value={graceTime}
                    onChange={(e) => setGraceTime(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">TRIGGER TIME</label>
                  <input 
                    type="time" 
                    value={triggerTime}
                    onChange={(e) => setTriggerTime(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">MESSAGE TEMPLATE</label>
                <textarea 
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all resize-none"
                />
                <p className="text-[10px] text-slate-400 ml-4">Available variables: <span className="font-bold text-blue-600">{"{{employee_name}}"}</span></p>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="w-full py-5 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isSavingSettings ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> SAVE ALERT RULES</>}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 flex flex-col items-center text-center h-full">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">QR AUTHENTICATION</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">SCAN TO LINK DEVICE</p>
            
            <div className="w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-10 relative overflow-hidden group">
              {status?.qr ? (
                <img src={status.qr} alt="WhatsApp QR Code" className="w-full h-full p-8" />
              ) : status?.status === 'connected' ? (
                <div className="flex flex-col items-center gap-4 text-emerald-600">
                  <CheckCircle2 size={64} />
                  <p className="font-black text-sm uppercase tracking-widest">DEVICE LINKED</p>
                </div>
              ) : status?.status === 'connecting' ? (
                <div className="flex flex-col items-center gap-4 text-blue-600">
                  <Loader2 size={64} className="animate-spin" />
                  <p className="font-black text-sm uppercase tracking-widest">GENERATING QR...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-300">
                  <QrCode size={64} />
                  <p className="font-black text-sm uppercase tracking-widest">READY TO CONNECT</p>
                </div>
              )}
            </div>

            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3 text-left p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  <AlertCircle size={16} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  Open WhatsApp on your phone, tap Menu or Settings and select Linked Devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
