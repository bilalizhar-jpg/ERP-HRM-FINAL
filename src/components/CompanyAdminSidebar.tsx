import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { employerModules } from '../config/modules';

const menuItems = employerModules.map(module => ({
  ...module,
  path: module.path.replace('/super-admin/employer', '/company-admin')
}));

export default function CompanyAdminSidebar() {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const companyStr = localStorage.getItem('companyAdmin');
        if (companyStr) {
          const company = JSON.parse(companyStr);
          const res = await fetch(`/api/employer-permissions?company_id=${company.id}`);
          if (res.ok) {
            const permissions = await res.json();
            // Default to true if not explicitly restricted
            const allowed = menuItems
              .filter(item => {
                const perm = permissions.find((p: { module_name: string; is_granted: boolean }) => p.module_name === item.name);
                return perm ? Boolean(perm.is_granted) : true;
              })
              .map(item => item.name);
            setAllowedModules(allowed);
          } else {
            setAllowedModules(menuItems.map(item => item.name));
          }
        } else {
          setAllowedModules(menuItems.map(item => item.name));
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setAllowedModules(menuItems.map(item => item.name));
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev => 
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const visibleMenuItems = menuItems.filter(item => allowedModules.includes(item.name));

  if (loading) {
    return (
      <div className="w-72 bg-white border-r border-slate-200 h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col">
      <div className="p-6 sticky top-0 bg-white z-10 border-b border-slate-100">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          Employer Modules
        </h2>
      </div>
      
      <div className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const isOpen = openDropdowns.includes(item.name);
            
            return (
              <li key={item.name}>
                {item.hasDropdown ? (
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-500'} strokeWidth={2} />
                      <span className="text-sm font-bold tracking-wide">{item.name}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-500'} strokeWidth={2} />
                    <span className="text-sm font-bold tracking-wide">{item.name}</span>
                  </Link>
                )}
                
                {/* Placeholder for dropdown content */}
                {item.hasDropdown && isOpen && (
                  <ul className="mt-1 mb-2 ml-12 space-y-1">
                    <li>
                      <Link to={`${item.path}/overview`} className="block px-4 py-2 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                        Overview
                      </Link>
                    </li>
                    <li>
                      <Link to={`${item.path}/manage`} className="block px-4 py-2 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                        Manage
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
