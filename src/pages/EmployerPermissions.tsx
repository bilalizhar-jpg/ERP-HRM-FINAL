import { useState, useEffect } from 'react';
import { Shield, Search, Save, Loader2 } from 'lucide-react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { employerModules } from '../config/modules';

interface Company {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  company_id: number;
  module_name: string;
  is_granted: boolean;
}

const modules = employerModules.map(m => m.name);

export default function EmployerPermissions() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State to hold permissions: { moduleName: { companyId: isGranted } }
  const [permissions, setPermissions] = useState<Record<string, Record<number, boolean>>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, permRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/employer-permissions')
        ]);

        if (compRes.ok && permRes.ok) {
          const compData: Company[] = await compRes.json();
          const permData: Permission[] = await permRes.json();

          setCompanies(compData);
          if (compData.length > 0) {
            setSelectedCompanyId(compData[0].id);
          }

          // Initialize permissions state
          const initialPerms: Record<string, Record<number, boolean>> = {};
          modules.forEach(mod => {
            initialPerms[mod] = {};
            compData.forEach(comp => {
              // Default to true (granted) if not explicitly set in DB
              const dbPerm = permData.find(p => p.module_name === mod && p.company_id === comp.id);
              initialPerms[mod][comp.id] = dbPerm ? Boolean(dbPerm.is_granted) : true;
            });
          });
          setPermissions(initialPerms);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePermissionChange = (module: string, granted: boolean) => {
    if (selectedCompanyId === null) return;
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [selectedCompanyId]: granted
      }
    }));
  };

  const handleBulkAction = (granted: boolean) => {
    if (selectedCompanyId === null) return;
    const updatedPerms = { ...permissions };
    modules.forEach(mod => {
      updatedPerms[mod] = {
        ...updatedPerms[mod],
        [selectedCompanyId]: granted
      };
    });
    setPermissions(updatedPerms);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Flatten permissions state into array for API
      const payload: { company_id: number; module_name: string; is_granted: boolean }[] = [];
      
      Object.entries(permissions).forEach(([moduleName, companyPerms]) => {
        Object.entries(companyPerms).forEach(([companyIdStr, isGranted]) => {
          payload.push({
            company_id: parseInt(companyIdStr),
            module_name: moduleName,
            is_granted: isGranted
          });
        });
      });

      const res = await fetch('/api/employer-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: payload })
      });

      if (res.ok) {
        alert('Permissions saved successfully!');
      } else {
        alert('Failed to save permissions.');
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const filteredModules = modules.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex">
        <SuperAdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                  <Shield size={32} />
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase">
                  Employer <span className="text-blue-600">Permissions</span>
                </h1>
              </div>
              <p className="text-slate-500 font-medium text-lg max-w-2xl">
                Configure module accessibility across your entire company network. Toggle permissions with precision.
              </p>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={saving || companies.length === 0}
              className="group relative px-10 py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-blue-600 transition-all duration-500 shadow-2xl hover:shadow-blue-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3">
                {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} className="group-hover:scale-110 transition-transform duration-500" />}
                <span className="text-sm tracking-[0.2em] uppercase">{saving ? 'Processing...' : 'Save Protocol'}</span>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Target Company Selection</label>
                <select 
                  className="w-full max-w-xl py-5 px-8 rounded-[1.5rem] border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-black tracking-widest bg-white uppercase appearance-none cursor-pointer hover:border-slate-200 transition-all shadow-sm"
                  value={selectedCompanyId || ''}
                  onChange={(e) => setSelectedCompanyId(parseInt(e.target.value))}
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={() => handleBulkAction(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-emerald-500 hover:text-white transition-all duration-300"
                >
                  Grant All Access
                </button>
                <button 
                  onClick={() => handleBulkAction(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  Restrict All Access
                </button>
              </div>
            </div>

            <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="SEARCH MODULES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase border border-blue-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {filteredModules.length} Modules Found
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {companies.length === 0 ? (
                <div className="p-24 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Shield className="text-slate-200" size={48} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-2">No Companies Detected</h3>
                  <p className="text-slate-500 font-medium">Please register a company in the core protocol first.</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="text-left py-8 px-10 font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Module Identity</th>
                      <th className="text-center py-8 px-10 font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Authorization Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredModules.map((module) => {
                      const isGranted = selectedCompanyId !== null ? (permissions[module]?.[selectedCompanyId] ?? true) : true;

                      return (
                        <tr key={module} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="py-8 px-10">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isGranted ? 'bg-blue-50 text-blue-600 group-hover:scale-110' : 'bg-slate-100 text-slate-400 opacity-50'}`}>
                                <Shield size={20} />
                              </div>
                              <div>
                                <span className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-1">{module}</span>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Module</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-8 px-10">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => handlePermissionChange(module, true)}
                                className={`flex-1 max-w-[160px] py-4 rounded-2xl text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 border-2 ${
                                  isGranted 
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                Access Granted
                              </button>
                              <button
                                onClick={() => handlePermissionChange(module, false)}
                                className={`flex-1 max-w-[160px] py-4 rounded-2xl text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 border-2 ${
                                  !isGranted 
                                    ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                Access Restricted
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="mt-12 p-10 bg-blue-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center">
                <Shield size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Security Protocol</h3>
                <p className="text-blue-100 font-medium max-w-md">
                  All permission changes are logged and applied instantly to the employer portal. Ensure accuracy before saving.
                </p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving || companies.length === 0}
              className="px-12 py-5 bg-white text-blue-600 font-black rounded-[2rem] hover:bg-blue-50 transition-all duration-300 shadow-xl text-sm tracking-widest uppercase disabled:opacity-50"
            >
              Commit Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
