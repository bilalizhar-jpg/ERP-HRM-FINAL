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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State to hold selected company ID for each module row
  const [rowCompanies, setRowCompanies] = useState<Record<string, number>>({});

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

          // Initialize row selections (default to first company if exists)
          const initialRowComps: Record<string, number> = {};
          const defaultCompId = compData.length > 0 ? compData[0].id : 0;
          modules.forEach(mod => {
            initialRowComps[mod] = defaultCompId;
          });
          setRowCompanies(initialRowComps);

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

  const handleCompanyChange = (module: string, companyId: number) => {
    setRowCompanies(prev => ({
      ...prev,
      [module]: companyId
    }));
  };

  const handlePermissionChange = (module: string, companyId: number, granted: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [companyId]: granted
      }
    }));
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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Shield className="text-blue-600" size={32} />
                Employer Panel Permissions
              </h1>
              <p className="text-slate-500 mt-2">Manage module access and restrictions for different companies</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving || companies.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {companies.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No companies registered yet. Please add a company first.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 w-1/4">Module Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 w-1/4">Select Company</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 w-1/4">Access Granted</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 w-1/4">Access Restricted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredModules.map((module) => {
                      const currentCompanyId = rowCompanies[module];
                      const isGranted = permissions[module]?.[currentCompanyId] ?? true;

                      return (
                        <tr key={module} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-900">{module}</td>
                          <td className="py-4 px-6">
                            <select 
                              className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                              value={currentCompanyId}
                              onChange={(e) => handleCompanyChange(module, parseInt(e.target.value))}
                            >
                              {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <label className="inline-flex items-center justify-center w-full cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="radio" 
                                  name={`access-${module}`} 
                                  className="peer sr-only"
                                  checked={isGranted}
                                  onChange={() => handlePermissionChange(module, currentCompanyId, true)}
                                />
                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                                  {isGranted && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </div>
                              </div>
                            </label>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <label className="inline-flex items-center justify-center w-full cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="radio" 
                                  name={`access-${module}`} 
                                  className="peer sr-only"
                                  checked={!isGranted}
                                  onChange={() => handlePermissionChange(module, currentCompanyId, false)}
                                />
                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-red-600 peer-checked:bg-red-600 transition-all flex items-center justify-center">
                                  {!isGranted && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </div>
                              </div>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
