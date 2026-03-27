import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  Link2, 
  Mail, 
  MessageSquare,
  ChevronDown,
  LogOut
} from 'lucide-react';

import { employerModules, SubItem } from '../config/modules';

export default function SuperAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev => 
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const handleExitToSite = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem('superAdmin');
    navigate('/');
  };

  const coreMenuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, path: '/super-admin/dashboard' },
    { id: 'companies', label: 'COMPANIES', icon: Building2, path: '/super-admin/companies' },
    { id: 'plans', label: 'SUBSCRIPTION PLANS', icon: CreditCard, path: '/super-admin/plans' },
    { id: 'invoice', label: 'INVOICE', icon: FileText, path: '/super-admin/invoice' },
    { id: 'connection', label: 'CONNECTION', icon: Link2, path: '/super-admin/connection' },
    { id: 'gmail', label: 'GMAIL INTEGRATION', icon: Mail, path: '/super-admin/gmail' },
    { id: 'whatsapp', label: 'WHATSAPP INTEGRATION', icon: MessageSquare, path: '/super-admin/whatsapp' },
    { id: 'permissions', label: 'EMPLOYER PANEL PERMISSIONS', icon: ShieldCheck, path: '/super-admin/permissions' },
  ];

  return (
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
            {coreMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span className="text-[11px] tracking-wider uppercase">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] px-4 mb-4 uppercase">EMPLOYES RULES</p>
          <nav className="space-y-1">
            {employerModules.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const isOpen = openDropdowns.includes(item.name);
              
              return (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' 
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                        <span className="text-[11px] tracking-wider uppercase">{item.name}</span>
                      </div>
                      <ChevronDown 
                        size={14} 
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' 
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                      <span className="text-[11px] tracking-wider uppercase">{item.name}</span>
                    </button>
                  )}
                  
                  {item.hasDropdown && isOpen && (
                    <ul className="mt-1 mb-2 ml-10 space-y-1 border-l border-slate-100">
                      {item.subItems ? (
                        item.subItems.map((subItem: SubItem) => {
                          const subPath = `${item.path}${subItem.path}`;
                          return (
                            <li key={subItem.name}>
                              <button 
                                onClick={() => navigate(subPath)} 
                                className="w-full text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors font-bold"
                              >
                                {subItem.name}
                              </button>
                            </li>
                          );
                        })
                      ) : (
                        <>
                          <li>
                            <button onClick={() => navigate(`${item.path}/overview`)} className="w-full text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors font-bold">
                              Overview
                            </button>
                          </li>
                          <li>
                            <button onClick={() => navigate(`${item.path}/manage`)} className="w-full text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors font-bold">
                              Manage
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleExitToSite}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <LogOut size={16} />
          EXIT TO SITE
        </button>
      </div>
    </aside>
  );
}
