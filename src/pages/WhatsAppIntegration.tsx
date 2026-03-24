import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Maximize2, 
  Search,
  Mail,
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

interface Company {
  id: number;
  name: string;
  gmail_tokens: string | null;
}

interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'connecting';
  qr: string | null;
}

export default function WhatsAppIntegration() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from ERP Platform!');
  const [isSending, setIsSending] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
        if (data.length > 0) setSelectedCompany(data[0]);
      }
    } catch (error) {
      console.error("Error fetching companies", error);
    }
  };

  const fetchStatus = useCallback(async () => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/whatsapp/status?companyId=${selectedCompany.id}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching status", error);
    }
  }, [selectedCompany]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedCompany) {
      fetchStatus();
      interval = setInterval(fetchStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [selectedCompany, fetchStatus]);

  const handleConnect = async () => {
    if (!selectedCompany) {
      alert('Please select a company first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id })
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
    if (!selectedCompany) return;
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id })
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
    if (!selectedCompany || !testNumber || !testMessage) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompany.id,
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

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, path: '/super-admin/dashboard' },
    { id: 'companies', label: 'COMPANIES', icon: Building2, path: '/super-admin/companies' },
    { id: 'plans', label: 'SUBSCRIPTION PLANS', icon: CreditCard, path: '/super-admin/plans' },
    { id: 'invoice', label: 'INVOICE', icon: FileText, path: '/super-admin/invoice' },
    { id: 'connection', label: 'CONNECTION', icon: Link2, path: '/super-admin/connection' },
    { id: 'gmail', label: 'GMAIL INTEGRATION', icon: Mail, path: '/super-admin/gmail' },
    { id: 'whatsapp', label: 'WHATSAPP INTEGRATION', icon: MessageSquare, active: true, path: '/super-admin/whatsapp' },
    { id: 'permissions', label: 'EMPLOYER PANEL PERMISSIONS', icon: ShieldCheck, path: '/super-admin/permissions' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-40">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Shield size={22} />
          </div>
          <span className="font-black text-xl tracking-tight uppercase">SUPER ADMIN</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                item.active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={20} />
              <span className="tracking-wide">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">WHATSAPP INTEGRATION</h1>
            <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">MULTI-TENANT COMMUNICATION PROTOCOL</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              className="bg-white border-none rounded-xl px-6 py-3 text-slate-900 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
              value={selectedCompany?.id || ''}
              onChange={(e) => setSelectedCompany(companies.find(c => c.id === Number(e.target.value)) || null)}
            >
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
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
                  <p className="text-lg font-black text-slate-900 uppercase">{selectedCompany?.name || '---'}</p>
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
      </main>
    </div>
  );
}

const FileText = ({ size, className }: { size?: number, className?: string }) => <FileTextIcon size={size} className={className} />;
const Link2 = ({ size, className }: { size?: number, className?: string }) => <Link2Icon size={size} className={className} />;

import { FileText as FileTextIcon, Link2 as Link2Icon } from 'lucide-react';
