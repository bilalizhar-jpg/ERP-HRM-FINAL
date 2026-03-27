import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import CompanyAdminSidebar from '../../components/CompanyAdminSidebar';
import { Upload } from 'lucide-react';
import EmployerGmailIntegration from './EmployerGmailIntegration';
import EmployerWhatsAppIntegration from './EmployerWhatsAppIntegration';

export default function Settings() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  
  const [companyProfile, setCompanyProfile] = useState({
    name: 'Acme Corp',
    website: 'https://acmecorp.com',
    email: 'support@acmecorp.com',
    phone: '+1 234 567 890',
    about: 'Tell us about your company...',
    addresses: [] as string[]
  });

  const [rules, setRules] = useState({
    activeLanguage: 'English (en)',
    activeCurrency: 'US Dollar ($)',
    taxRate: '10',
    timeZone: 'Africa/Abidjan'
  });

  type Shift = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    breakTime: number;
    gracePeriod: number;
    minWorkingHours: number;
    lateMarkRule: string;
    status: 'Active' | 'Deactive';
  };

  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', name: 'Morning', startTime: '09:00', endTime: '17:00', breakTime: 60, gracePeriod: 15, minWorkingHours: 8, lateMarkRule: '15', status: 'Active' },
    { id: '2', name: 'Evening', startTime: '14:00', endTime: '22:00', breakTime: 60, gracePeriod: 15, minWorkingHours: 8, lateMarkRule: '15', status: 'Active' },
    { id: '3', name: 'Night', startTime: '22:00', endTime: '06:00', breakTime: 60, gracePeriod: 15, minWorkingHours: 8, lateMarkRule: '15', status: 'Active' },
  ]);

  const calculateShiftMetrics = (shift: Shift) => {
    const start = new Date(`1970-01-01T${shift.startTime}:00`);
    const end = new Date(`1970-01-01T${shift.endTime}:00`);
    
    // Handle overnight shifts
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const breakHours = shift.breakTime / 60;
    const netWorkingHours = Math.max(0, durationHours - breakHours);
    const overtime = Math.max(0, netWorkingHours - shift.minWorkingHours);
    
    return {
      duration: durationHours.toFixed(2),
      netWorkingHours: netWorkingHours.toFixed(2),
      overtime: overtime.toFixed(2)
    };
  };

  const updateShift = (id: string, field: keyof Shift, value: string | number) => {
    setShifts(shifts.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/employer/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyProfile),
      });
      if (response.ok) {
        alert('Company profile saved successfully!');
      } else {
        alert('Failed to save company profile.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred while saving.');
    }
  };

  const handleSaveRules = async () => {
    try {
      const response = await fetch('/api/employer/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      if (response.ok) {
        alert('Rules saved successfully!');
      } else {
        alert('Failed to save rules.');
      }
    } catch (error) {
      console.error('Error saving rules:', error);
      alert('An error occurred while saving.');
    }
  };

  const GeneralSettingsContent = () => (
    <div className="space-y-8">
      {/* Company Profile Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Company Profile</h2>
          <button onClick={handleSaveProfile} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all">Save Changes</button>
        </div>
        
        <div className="flex items-center gap-8 mb-8">
          <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200">
            <Upload className="text-slate-400" size={24} />
          </div>
          <div>
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all">Change Logo</button>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Recommended: 200x200px</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Company Name</label>
            <input type="text" value={companyProfile.name} onChange={e => setCompanyProfile({...companyProfile, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Website</label>
            <input type="text" value={companyProfile.website} onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Email</label>
            <input type="email" value={companyProfile.email} onChange={e => setCompanyProfile({...companyProfile, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
            <input type="tel" value={companyProfile.phone} onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About Us</label>
          <textarea value={companyProfile.about} onChange={e => setCompanyProfile({...companyProfile, about: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows={4} />
        </div>
      </section>

      {/* Rules Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Business Rules</h2>
          <button onClick={handleSaveRules} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all">Save Rules</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Languages</h3>
             <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
               <option>English (en)</option>
             </select>
          </div>
          
          <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Currencies</h3>
             <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
               <option>US Dollar ($)</option>
             </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Zone</h3>
            <select value={rules.timeZone} onChange={e => setRules({...rules, timeZone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
              <option>Africa/Abidjan</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Tax Rate (%)</h3>
            <input type="number" value={rules.taxRate} onChange={e => setRules({...rules, taxRate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
          </div>
        </div>
      </section>

      {/* Working Hours Setting Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Working Hours Setting</h2>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all">Save Changes</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shifts.map((shift) => {
            const metrics = calculateShiftMetrics(shift);
            return (
              <div key={shift.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase">{shift.name} Shift</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${shift.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {shift.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Start Time</label>
                    <input type="time" value={shift.startTime} onChange={e => updateShift(shift.id, 'startTime', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">End Time</label>
                    <input type="time" value={shift.endTime} onChange={e => updateShift(shift.id, 'endTime', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Break (min)</label>
                    <input type="number" value={shift.breakTime} onChange={e => updateShift(shift.id, 'breakTime', parseInt(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Grace (min)</label>
                    <input type="number" value={shift.gracePeriod} onChange={e => updateShift(shift.id, 'gracePeriod', parseInt(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Duration</p>
                    <p className="text-sm font-black text-slate-900">{metrics.duration}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Break</p>
                    <p className="text-sm font-black text-slate-900">{shift.breakTime / 60}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Net Hours</p>
                    <p className="text-sm font-black text-emerald-600">{metrics.netWorkingHours}h</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-600">Overtime: <span className="font-black text-rose-600">{metrics.overtime}h</span></p>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Edit Settings</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath ? <SuperAdminSidebar /> : <CompanyAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {!location.pathname.includes('/gmail') && !location.pathname.includes('/whatsapp') && (
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Settings</h1>
            <p className="text-slate-500 font-medium">Configure global application settings and business rules.</p>
          </header>
        )}

        <Routes>
          <Route path="general" element={<GeneralSettingsContent />} />
          <Route path="gmail" element={<EmployerGmailIntegration />} />
          <Route path="whatsapp" element={<EmployerWhatsAppIntegration />} />
          <Route path="rules" element={<div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center"><h2 className="text-xl font-black uppercase tracking-tight mb-4">Business Rules</h2><p className="text-slate-500">Configure custom business logic and operational constraints.</p></div>} />
          <Route path="roles-permissions" element={<div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center"><h2 className="text-xl font-black uppercase tracking-tight mb-4">Roles & Permissions</h2><p className="text-slate-500">Define user roles and manage access levels across the platform.</p></div>} />
          <Route path="menu-permissions" element={<div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center"><h2 className="text-xl font-black uppercase tracking-tight mb-4">Menu Permissions</h2><p className="text-slate-500">Control sidebar menu visibility for different user roles.</p></div>} />
          <Route path="*" element={<div className="text-center p-12 bg-white rounded-2xl">Select a setting to configure</div>} />
        </Routes>
      </main>
    </div>
  );
}
