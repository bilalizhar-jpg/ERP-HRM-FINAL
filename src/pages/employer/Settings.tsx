import { Settings as SettingsIcon, Shield, Bell, User, Globe } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function Settings() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <SuperAdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Employer Settings</h1>
          <p className="text-slate-500 font-medium">Configure company preferences and system settings.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {[
              { label: 'General Settings', icon: SettingsIcon, active: true },
              { label: 'Security & Privacy', icon: Shield, active: false },
              { label: 'Notifications', icon: Bell, active: false },
              { label: 'User Management', icon: User, active: false },
              { label: 'Integrations', icon: Globe, active: false },
            ].map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <item.icon size={20} />
                <span className="tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">General Settings</h2>
              
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    defaultValue="Acme Corp" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support Email</label>
                  <input 
                    type="email" 
                    defaultValue="support@acmecorp.com" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timezone</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all appearance-none cursor-pointer">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button type="button" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
