import { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Menu, 
  Search,
  Upload,
  Plus,
  Edit,
  Trash2,
  Lock,
  Database,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

import SuperAdminSidebar from '../components/SuperAdminSidebar';

interface Company {
  id: number;
  name: string;
  email: string;
  mobile: string;
  unique_code: string;
  subsidiary: string;
  head_office_location: string;
  factory_location: string;
  admin_username: string;
  admin_password: string;
  logo_url: string;
  plan: string;
  status: string;
  gmail_tokens: string | null;
  created_at: string;
}

export default function ManageCompanies() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    unique_code: '',
    subsidiary: '',
    head_office_location: '',
    factory_location: '',
    admin_username: '',
    admin_password: '',
    plan: 'Basic',
    logo_url: ''
  });

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch {
      console.error("Error fetching companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Company registered successfully!\nAdmin Username: ${data.credentials.username}\nAdmin Password: ${data.credentials.password}\nUnique Code: ${data.credentials.code}`);
        setFormData({
          name: '',
          email: '',
          mobile: '',
          unique_code: '',
          subsidiary: '',
          head_office_location: '',
          factory_location: '',
          admin_username: '',
          admin_password: '',
          plan: 'Basic',
          logo_url: ''
        });
        fetchCompanies();
      } else {
        alert("Error: " + data.message);
      }
    } catch {
      alert("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectGmail = async (companyId: number) => {
    try {
      const res = await fetch(`/api/gmail/auth-url?companyId=${companyId}`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else if (data.message) {
        alert(data.message);
      } else {
        alert('Failed to get authorization URL');
      }
    } catch {
      alert('Failed to connect to the server. Please try again.');
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = async (id: number) => {
    console.log("Delete button clicked for company ID:", id);
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        const data = await res.json();
        console.log("Delete response:", data);
        if (data.success) {
          alert("Company deleted successfully!");
          fetchCompanies();
        } else {
          alert("Error: " + data.message);
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Error deleting company");
      }
    }
  };

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
                placeholder="Search companies..." 
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SYSTEM ARCHITECT</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                SA
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Register New Company Form */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-8">REGISTER NEW COMPANY</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input 
                  type="text" 
                  placeholder="Company Name" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Mobile" 
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Unique Code (Optional)" 
                  value={formData.unique_code}
                  onChange={(e) => setFormData({...formData, unique_code: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Subsidiary" 
                  value={formData.subsidiary}
                  onChange={(e) => setFormData({...formData, subsidiary: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Head Office Location" 
                  value={formData.head_office_location}
                  onChange={(e) => setFormData({...formData, head_office_location: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Factory Location" 
                  value={formData.factory_location}
                  onChange={(e) => setFormData({...formData, factory_location: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Admin Username" 
                  value={formData.admin_username}
                  onChange={(e) => setFormData({...formData, admin_username: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input 
                  type="password" 
                  placeholder="Admin Password" 
                  value={formData.admin_password}
                  onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <div className="bg-slate-50 rounded-xl px-6 py-4 flex items-center gap-3 text-slate-400 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => document.getElementById('logo-upload')?.click()}>
                  <Upload size={18} />
                  <span className="text-sm">{formData.logo_url ? 'Logo Uploaded' : 'Upload Logo'}</span>
                  <input 
                    type="file" 
                    id="logo-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, logo_url: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <select 
                  value={formData.plan}
                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={20} />
                    REGISTER COMPANY
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Registered Companies Table */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">REGISTERED COMPANIES</h2>
            </div>
            
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase text-left">
                      <th className="pb-6">LOGO</th>
                      <th className="pb-6">NAME</th>
                      <th className="pb-6">UNIQUE CODE</th>
                      <th className="pb-6">ADMIN CREDENTIALS</th>
                      <th className="pb-6">STATUS</th>
                      <th className="pb-6">GMAIL</th>
                      <th className="pb-6">EDIT COMPANY</th>
                      <th className="pb-6">MENU ACCESS</th>
                      <th className="pb-6 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">LOADING PROTOCOL</p>
                          </div>
                        </td>
                      </tr>
                    ) : companies.length > 0 ? (
                      companies.map((company) => (
                        <tr key={company.id} className="border-t border-slate-50 group hover:bg-slate-50 transition-colors">
                          <td className="py-5">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                              {company.logo_url ? (
                                <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                              ) : (
                                company.name.charAt(0)
                              )}
                            </div>
                          </td>
                          <td className="py-5">
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{company.name}</p>
                            <p className="text-[10px] text-slate-400 lowercase">{company.email}</p>
                          </td>
                          <td className="py-5 text-xs font-mono text-blue-600 font-bold">{company.unique_code}</td>
                          <td className="py-5">
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                              <span className="text-slate-400 uppercase">U:</span>
                              <span className="text-slate-900">{company.admin_username}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                              <span className="text-slate-400 uppercase">P:</span>
                              <span className="text-slate-900">••••••••</span>
                            </div>
                          </td>
                          <td className="py-5">
                            <span className={`px-2 py-1 rounded text-[9px] font-black tracking-widest ${
                              company.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {company.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-5">
                            <div className="flex items-center">
                              {company.gmail_tokens ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black tracking-wider uppercase">
                                  <Mail size={12} />
                                  CONNECTED
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleConnectGmail(company.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black tracking-wider uppercase hover:bg-blue-600 hover:text-white transition-all"
                                >
                                  <Mail size={12} />
                                  CONNECT
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-5">
                            <button 
                              onClick={() => setEditingCompany(company)}
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </td>
                          <td className="py-5">
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                              <Lock size={16} />
                            </button>
                          </td>
                          <td className="py-5 text-right">
                            <button 
                              onClick={() => handleDelete(company.id)}
                              className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-slate-50">
                        <td colSpan={9} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <Database size={48} className="text-slate-400" />
                            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">NO COMPANIES REGISTERED</p>
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
        {editingCompany && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 max-w-2xl w-full">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-8">EDIT COMPANY</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const res = await fetch(`/api/companies/${editingCompany.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingCompany)
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("Company updated successfully!");
                    setEditingCompany(null);
                    fetchCompanies();
                  } else {
                    alert("Error: " + data.message);
                  }
                } catch {
                  alert("Error updating company");
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    placeholder="Company Name" 
                    required
                    value={editingCompany.name}
                    onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    required
                    value={editingCompany.email}
                    onChange={(e) => setEditingCompany({...editingCompany, email: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Mobile" 
                    value={editingCompany.mobile}
                    onChange={(e) => setEditingCompany({...editingCompany, mobile: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Unique Code" 
                    value={editingCompany.unique_code}
                    onChange={(e) => setEditingCompany({...editingCompany, unique_code: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Subsidiary" 
                    value={editingCompany.subsidiary}
                    onChange={(e) => setEditingCompany({...editingCompany, subsidiary: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Head Office Location" 
                    value={editingCompany.head_office_location}
                    onChange={(e) => setEditingCompany({...editingCompany, head_office_location: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Factory Location" 
                    value={editingCompany.factory_location}
                    onChange={(e) => setEditingCompany({...editingCompany, factory_location: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Admin Username" 
                    value={editingCompany.admin_username}
                    onChange={(e) => setEditingCompany({...editingCompany, admin_username: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Admin Password" 
                      value={editingCompany.admin_password}
                      onChange={(e) => setEditingCompany({...editingCompany, admin_password: e.target.value})}
                      className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <select 
                    value={editingCompany.plan}
                    onChange={(e) => setEditingCompany({...editingCompany, plan: e.target.value})}
                    className="bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                  <div 
                    className="bg-slate-50 rounded-xl px-6 py-4 flex items-center gap-3 text-slate-400 cursor-pointer hover:bg-slate-100 transition-all" 
                    onClick={() => document.getElementById('edit-logo-upload')?.click()}
                  >
                    <Upload size={18} />
                    <span className="text-sm">{editingCompany.logo_url ? 'Logo Uploaded' : 'Upload Logo'}</span>
                    <input 
                      type="file" 
                      id="edit-logo-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditingCompany({...editingCompany, logo_url: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingCompany(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
