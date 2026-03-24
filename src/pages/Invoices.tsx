import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Maximize2, 
  Menu, 
  Search,
  FileText,
  Link2,
  Download,
  Mail,
  Database,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceTemplate } from '../components/InvoiceTemplate';

interface Invoice {
  id: number;
  company_id: number;
  company_name: string;
  company_email: string;
  invoice_number: string;
  amount: number;
  plan: string;
  status: 'paid' | 'unpaid' | 'cancelled';
  due_date: string;
  created_at: string;
}

export default function Invoices() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        const formattedInvoices = data.map((invoice: Invoice) => ({
          ...invoice,
          amount: parseFloat(invoice.amount as unknown as string)
        }));
        setInvoices(formattedInvoices);
      }
    } catch {
      console.error("Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSendEmail = async (invoice: Invoice) => {
    setSendingId(invoice.id);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert("Error: " + data.message);
      }
    } catch {
      alert("Error sending email");
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    
    // Wait for the component to render
    setTimeout(async () => {
      const element = document.getElementById('invoice-template');
      console.log("Invoice element found:", !!element);
      if (element) {
        try {
          const canvas = await html2canvas(element, { scale: 2 });
          console.log("Canvas created:", !!canvas);
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`invoice_${invoice.invoice_number}.pdf`);
        } catch (error) {
          console.error("Error generating PDF:", error);
          alert("Error generating PDF");
        } finally {
          setSelectedInvoice(null);
        }
      } else {
        console.error("Invoice element not found");
        alert("Invoice element not found");
        setSelectedInvoice(null);
      }
    }, 1000); // Increased timeout
  };

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, path: '/super-admin/dashboard' },
    { id: 'companies', label: 'COMPANIES', icon: Building2, path: '/super-admin/companies' },
    { id: 'plans', label: 'SUBSCRIPTION PLANS', icon: CreditCard, path: '/super-admin/plans' },
    { id: 'invoice', label: 'INVOICE', icon: FileText, active: true, path: '/super-admin/invoice' },
    { id: 'connection', label: 'CONNECTION', icon: Link2, path: '/super-admin/connection' },
    { id: 'gmail', label: 'GMAIL INTEGRATION', icon: Mail, path: '/super-admin/gmail' },
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

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] px-4 mb-4 uppercase">CORE PROTOCOL</p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    item.active 
                      ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={18} className={item.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span className="text-[11px] tracking-wider uppercase">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Exit to Site
          </button>
        </div>
      </aside>

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
                placeholder="Search invoices..." 
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">FINANCE MANAGER</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                FM
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">INVOICE PROTOCOLS</h1>
              <p className="text-slate-500 font-medium mt-1">Manage and track all generated subscription invoices.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Download size={16} />
                EXPORT ALL
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">INVOICE #</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">COMPANY</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">PLAN</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">AMOUNT</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">STATUS</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">DUE DATE</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                          <p className="text-xs font-black tracking-widest uppercase text-slate-400">LOADING INVOICES</p>
                        </div>
                      </td>
                    </tr>
                  ) : invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-blue-600 font-mono tracking-wider">{invoice.invoice_number}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{invoice.company_name}</p>
                            <p className="text-[10px] text-slate-400 lowercase">{invoice.company_email}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black tracking-widest uppercase">
                            {invoice.plan}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-slate-900 tracking-tight">${invoice.amount.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             {invoice.status === 'paid' ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ecfdf5] text-[#059669] rounded-full">
                                <CheckCircle2 size={12} />
                                <span className="text-[9px] font-black tracking-widest uppercase">PAID</span>
                              </div>
                            ) : invoice.status === 'unpaid' ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fffbeb] text-[#d97706] rounded-full">
                                <Clock size={12} />
                                <span className="text-[9px] font-black tracking-widest uppercase">UNPAID</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fff1f2] text-[#e11d48] rounded-full">
                                <XCircle size={12} />
                                <span className="text-[9px] font-black tracking-widest uppercase">CANCELLED</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-slate-500">{new Date(invoice.due_date).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleSendEmail(invoice)}
                              disabled={sendingId === invoice.id}
                              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100 disabled:opacity-50"
                              title="Send Email"
                            >
                              {sendingId === invoice.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Mail size={16} />
                              )}
                            </button>
                            <button 
                              onClick={() => handleDownloadPDF(invoice)}
                              className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm shadow-slate-100"
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Database size={48} className="text-slate-400" />
                          <p className="text-xs font-black tracking-widest uppercase text-slate-400">NO INVOICES DETECTED</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Hidden Invoice Template for PDF generation */}
        {selectedInvoice && (
          <div className="fixed -left-[9999px] top-0">
            <InvoiceTemplate invoice={selectedInvoice} />
          </div>
        )}
      </main>
    </div>
  );
}
