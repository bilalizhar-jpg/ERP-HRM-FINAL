import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { Upload, MapPin, Edit2, Trash2 } from 'lucide-react';

export default function Settings() {
  const location = useLocation();
  const isCompanyAdmin = location.pathname.startsWith('/company-admin');
  
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
    <>
      {/* Company Profile Section */}
      <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 mb-12">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6">Company Profile</h2>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
            <Upload className="text-slate-400" />
          </div>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">Change Logo</button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <input type="text" placeholder="Company Name" value={companyProfile.name} onChange={e => setCompanyProfile({...companyProfile, name: e.target.value})} className="p-4 bg-slate-50 rounded-xl border border-slate-200" />
          <input type="text" placeholder="Website" value={companyProfile.website} onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} className="p-4 bg-slate-50 rounded-xl border border-slate-200" />
          <input type="email" placeholder="Official Email" value={companyProfile.email} onChange={e => setCompanyProfile({...companyProfile, email: e.target.value})} className="p-4 bg-slate-50 rounded-xl border border-slate-200" />
          <input type="tel" placeholder="Phone Number" value={companyProfile.phone} onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})} className="p-4 bg-slate-50 rounded-xl border border-slate-200" />
        </div>
        <textarea placeholder="About Us" value={companyProfile.about} onChange={e => setCompanyProfile({...companyProfile, about: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6" rows={4} />
        
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 mb-6">
          <MapPin className="mx-auto mb-2" />
          No additional addresses added yet. <button className="text-indigo-600 font-bold">+ Add Address</button>
        </div>

        <button onClick={handleSaveProfile} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Save Company Profile</button>
      </section>

      {/* Rules Section */}
      <section>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6">Rules</h2>
        <div className="grid grid-cols-2 gap-8">
          {/* Languages & Currencies */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
             <h3 className="font-bold mb-4">Languages</h3>
             <select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
               <option>English (en)</option>
             </select>
             <div className="space-y-2">
               {['English (en)', 'Spanish (es)', 'French (fr)'].map(lang => (
                 <div key={lang} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                   {lang} <div><Edit2 size={16} className="inline mr-2"/> <Trash2 size={16} className="inline"/></div>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
             <h3 className="font-bold mb-4">Currencies</h3>
             <select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
               <option>US Dollar ($)</option>
             </select>
             <div className="space-y-2">
               {['US Dollar ($)', 'Euro (€)', 'British Pound (£)'].map(curr => (
                 <div key={curr} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                   {curr} <div><Edit2 size={16} className="inline mr-2"/> <Trash2 size={16} className="inline"/></div>
                 </div>
               ))}
             </div>
          </div>

          {/* Time & Tax */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <h3 className="font-bold mb-4">Time Settings</h3>
            <input type="number" value={rules.taxRate} onChange={e => setRules({...rules, taxRate: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4" />
            <select value={rules.timeZone} onChange={e => setRules({...rules, timeZone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200">
              <option>Africa/Abidjan</option>
            </select>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <h3 className="font-bold mb-4">Tax</h3>
            <button onClick={handleSaveRules} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Save Rules</button>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {!isCompanyAdmin && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Settings</h1>
          <p className="text-slate-500 font-medium">Configure global application settings and business rules.</p>
        </header>

        <Routes>
          <Route path="general" element={<GeneralSettingsContent />} />
          <Route path="*" element={<div className="text-center p-12 bg-white rounded-2xl">Select a setting to configure</div>} />
        </Routes>
      </main>
    </div>
  );
}
