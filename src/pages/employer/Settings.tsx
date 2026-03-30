import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { Upload } from 'lucide-react';
import EmployerGmailIntegration from './EmployerGmailIntegration';
import EmployerWhatsAppIntegration from './EmployerWhatsAppIntegration';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

export default function Settings() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  
  const [companyProfile, setCompanyProfile] = useState({
    name: 'Acme Corp',
    website: 'https://acmecorp.com',
    email: 'support@acmecorp.com',
    phone: '+1 234 567 890',
    about: 'Tell us about your company...',
    head_office_location: '',
    factory_location: '',
    logo_url: ''
  });

  const [rules, setRules] = useState({
    activeLanguage: 'English (en)',
    activeCurrency: 'US Dollar ($)',
    taxRate: '10',
    vatRate: '5',
    customField: '',
    timeZone: 'Africa/Abidjan',
    timeFormat: '24h' // '12h' or '24h'
  });

  const [error, setError] = useState<string | null>(null);
  const [isServerUp, setIsServerUp] = useState<boolean | null>(null);

  const fetchSettings = async () => {
    try {
      console.log('Fetching all settings from database...');
      setError(null);
      
      // First, check if server is reachable
      try {
        const pingRes = await fetchWithRetry('/api/ping');
        if (pingRes.ok) {
          setIsServerUp(true);
        } else {
          setIsServerUp(false);
        }
      } catch (e) {
        console.error('Ping failed:', e);
        setIsServerUp(false);
        throw new Error('Server is unreachable. Please check if the backend is running.');
      }

      const [profileRes, rulesRes] = await Promise.all([
        fetchWithRetry('/api/employer/settings/profile'),
        fetchWithRetry('/api/employer/settings/rules')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log('Profile data loaded:', profileData);
        setCompanyProfile(profileData);
      } else {
        const err = await profileRes.json();
        console.warn('Profile fetch failed:', err);
      }

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        console.log('Rules data loaded:', rulesData);
        setRules(rulesData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const timeZones = [
    'UTC',
    'Africa/Abidjan',
    'Africa/Accra',
    'Africa/Addis_Ababa',
    'Africa/Algiers',
    'Africa/Asmara',
    'Africa/Bamako',
    'Africa/Bangui',
    'Africa/Banjul',
    'Africa/Bissau',
    'Africa/Blantyre',
    'Africa/Brazzaville',
    'Africa/Bujumbura',
    'Africa/Cairo',
    'Africa/Casablanca',
    'Africa/Ceuta',
    'Africa/Conakry',
    'Africa/Dakar',
    'Africa/Dar_es_Salaam',
    'Africa/Djibouti',
    'Africa/Douala',
    'Africa/El_Aaiun',
    'Africa/Freetown',
    'Africa/Gaborone',
    'Africa/Harare',
    'Africa/Johannesburg',
    'Africa/Juba',
    'Africa/Kampala',
    'Africa/Khartoum',
    'Africa/Kigali',
    'Africa/Kinshasa',
    'Africa/Lagos',
    'Africa/Libreville',
    'Africa/Lome',
    'Africa/Luanda',
    'Africa/Lubumbashi',
    'Africa/Lusaka',
    'Africa/Malabo',
    'Africa/Maputo',
    'Africa/Maseru',
    'Africa/Mbabane',
    'Africa/Mogadishu',
    'Africa/Monrovia',
    'Africa/Nairobi',
    'Africa/Ndjamena',
    'Africa/Niamey',
    'Africa/Nouakchott',
    'Africa/Ouagadougou',
    'Africa/Porto-Novo',
    'Africa/Sao_Tome',
    'Africa/Tripoli',
    'Africa/Tunis',
    'Africa/Windhoek',
    'America/Adak',
    'America/Anchorage',
    'America/Anguilla',
    'America/Antigua',
    'America/Araguaina',
    'America/Argentina/Buenos_Aires',
    'America/Argentina/Catamarca',
    'America/Argentina/Cordoba',
    'America/Argentina/Jujuy',
    'America/Argentina/La_Rioja',
    'America/Argentina/Mendoza',
    'America/Argentina/Rio_Gallegos',
    'America/Argentina/Salta',
    'America/Argentina/San_Juan',
    'America/Argentina/San_Luis',
    'America/Argentina/Tucuman',
    'America/Argentina/Ushuaia',
    'America/Aruba',
    'America/Asuncion',
    'America/Atikokan',
    'America/Bahia',
    'America/Bahia_Banderas',
    'America/Barbados',
    'America/Belem',
    'America/Belize',
    'America/Blanc-Sablon',
    'America/Boa_Vista',
    'America/Bogota',
    'America/Boise',
    'America/Cambridge_Bay',
    'America/Campo_Grande',
    'America/Cancun',
    'America/Caracas',
    'America/Cayenne',
    'America/Cayman',
    'America/Chicago',
    'America/Chihuahua',
    'America/Costa_Rica',
    'America/Creston',
    'America/Cuiaba',
    'America/Curacao',
    'America/Danmarkshavn',
    'America/Dawson',
    'America/Dawson_Creek',
    'America/Denver',
    'America/Detroit',
    'America/Dominica',
    'America/Edmonton',
    'America/Eirunepe',
    'America/El_Salvador',
    'America/Fort_Nelson',
    'America/Fort_Quebec',
    'America/Fortaleza',
    'America/Glace_Bay',
    'America/Goose_Bay',
    'America/Grand_Turk',
    'America/Grenada',
    'America/Guadeloupe',
    'America/Guatemala',
    'America/Guayaquil',
    'America/Guyana',
    'America/Halifax',
    'America/Havana',
    'America/Hermosillo',
    'America/Indiana/Indianapolis',
    'America/Indiana/Knox',
    'America/Indiana/Marengo',
    'America/Indiana/Petersburg',
    'America/Indiana/Tell_City',
    'America/Indiana/Vevay',
    'America/Indiana/Vincennes',
    'America/Indiana/Winamac',
    'America/Inuvik',
    'America/Iqaluit',
    'America/Jamaica',
    'America/Juneau',
    'America/Kentucky/Louisville',
    'America/Kentucky/Monticello',
    'America/Kralendijk',
    'America/La_Paz',
    'America/Lima',
    'America/Los_Angeles',
    'America/Lower_Princes',
    'America/Maceio',
    'America/Managua',
    'America/Manaus',
    'America/Marigot',
    'America/Martinique',
    'America/Matamoros',
    'America/Mazatlan',
    'America/Menominee',
    'America/Merida',
    'America/Metlakatla',
    'America/Mexico_City',
    'America/Miquelon',
    'America/Moncton',
    'America/Monterrey',
    'America/Montevideo',
    'America/Montserrat',
    'America/Nassau',
    'America/New_York',
    'America/Nipigon',
    'America/Nome',
    'America/Noronha',
    'America/North_Dakota/Beulah',
    'America/North_Dakota/Center',
    'America/North_Dakota/New_Salem',
    'America/Nuuk',
    'America/Ojinaga',
    'America/Panama',
    'America/Pangnirtung',
    'America/Paramaribo',
    'America/Phoenix',
    'America/Port-au-Prince',
    'America/Port_of_Spain',
    'America/Porto_Velho',
    'America/Puerto_Rico',
    'America/Punta_Arenas',
    'America/Rainy_River',
    'America/Rankin_Inlet',
    'America/Recife',
    'America/Regina',
    'America/Resolute',
    'America/Rio_Branco',
    'America/Santarem',
    'America/Santiago',
    'America/Santo_Domingo',
    'America/Sao_Paulo',
    'America/Scoresbysund',
    'America/Sitka',
    'America/St_Barthelemy',
    'America/St_Johns',
    'America/St_Kitts',
    'America/St_Lucia',
    'America/St_Thomas',
    'America/St_Vincent',
    'America/Swift_Current',
    'America/Tegucigalpa',
    'America/Thule',
    'America/Thunder_Bay',
    'America/Tijuana',
    'America/Toronto',
    'America/Tortola',
    'America/Vancouver',
    'America/Whitehorse',
    'America/Winnipeg',
    'America/Yakutat',
    'America/Yellowknife',
    'Antarctica/Casey',
    'Antarctica/Davis',
    'Antarctica/DumontDUrville',
    'Antarctica/Mawson',
    'Antarctica/McMurdo',
    'Antarctica/Palmer',
    'Antarctica/Rothera',
    'Antarctica/Syowa',
    'Antarctica/Troll',
    'Antarctica/Vostok',
    'Arctic/Longyearbyen',
    'Asia/Aden',
    'Asia/Almaty',
    'Asia/Amman',
    'Asia/Anadyr',
    'Asia/Aqtau',
    'Asia/Aqtobe',
    'Asia/Ashgabat',
    'Asia/Atyrau',
    'Asia/Baghdad',
    'Asia/Bahrain',
    'Asia/Baku',
    'Asia/Bangkok',
    'Asia/Barnaul',
    'Asia/Beirut',
    'Asia/Bishkek',
    'Asia/Brunei',
    'Asia/Chita',
    'Asia/Choibalsan',
    'Asia/Colombo',
    'Asia/Damascus',
    'Asia/Dhaka',
    'Asia/Dili',
    'Asia/Dubai',
    'Asia/Dushanbe',
    'Asia/Famagusta',
    'Asia/Gaza',
    'Asia/Hebron',
    'Asia/Ho_Chi_Minh',
    'Asia/Hong_Kong',
    'Asia/Hovd',
    'Asia/Irkutsk',
    'Asia/Jakarta',
    'Asia/Jayapura',
    'Asia/Jerusalem',
    'Asia/Kabul',
    'Asia/Kamchatka',
    'Asia/Karachi',
    'Asia/Kathmandu',
    'Asia/Khandyga',
    'Asia/Kolkata',
    'Asia/Krasnoyarsk',
    'Asia/Kuala_Lumpur',
    'Asia/Kuching',
    'Asia/Kuwait',
    'Asia/Macau',
    'Asia/Magadan',
    'Asia/Makassar',
    'Asia/Manila',
    'Asia/Muscat',
    'Asia/Nicosia',
    'Asia/Novokuznetsk',
    'Asia/Novosibirsk',
    'Asia/Omsk',
    'Asia/Oral',
    'Asia/Phnom_Penh',
    'Asia/Pontianak',
    'Asia/Pyongyang',
    'Asia/Qatar',
    'Asia/Qostanay',
    'Asia/Qyzylorda',
    'Asia/Riyadh',
    'Asia/Sakhalin',
    'Asia/Samarkand',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Srednekolymsk',
    'Asia/Taipei',
    'Asia/Tashkent',
    'Asia/Tbilisi',
    'Asia/Tehran',
    'Asia/Thimphu',
    'Asia/Tokyo',
    'Asia/Tomsk',
    'Asia/Ulaanbaatar',
    'Asia/Urumqi',
    'Asia/Ust-Nera',
    'Asia/Vientiane',
    'Asia/Vladivostok',
    'Asia/Yakutsk',
    'Asia/Yangon',
    'Asia/Yekaterinburg',
    'Asia/Yerevan',
    'Atlantic/Azores',
    'Atlantic/Bermuda',
    'Atlantic/Canary',
    'Atlantic/Cape_Verde',
    'Atlantic/Faroe',
    'Atlantic/Madeira',
    'Atlantic/Reykjavik',
    'Atlantic/South_Georgia',
    'Atlantic/St_Helena',
    'Atlantic/Stanley',
    'Australia/Adelaide',
    'Australia/Brisbane',
    'Australia/Broken_Hill',
    'Australia/Darwin',
    'Australia/Eucla',
    'Australia/Hobart',
    'Australia/Lindeman',
    'Australia/Lord_Howe',
    'Australia/Melbourne',
    'Australia/Perth',
    'Australia/Sydney',
    'Europe/Amsterdam',
    'Europe/Andorra',
    'Europe/Astrakhan',
    'Europe/Athens',
    'Europe/Belgrade',
    'Europe/Berlin',
    'Europe/Bratislava',
    'Europe/Brussels',
    'Europe/Bucharest',
    'Europe/Budapest',
    'Europe/Busingen',
    'Europe/Chisinau',
    'Europe/Copenhagen',
    'Europe/Dublin',
    'Europe/Gibraltar',
    'Europe/Guernsey',
    'Europe/Helsinki',
    'Europe/Isle_of_Man',
    'Europe/Istanbul',
    'Europe/Jersey',
    'Europe/Kaliningrad',
    'Europe/Kirov',
    'Europe/Kyiv',
    'Europe/Lisbon',
    'Europe/Ljubljana',
    'Europe/London',
    'Europe/Luxembourg',
    'Europe/Madrid',
    'Europe/Malta',
    'Europe/Mariehamn',
    'Europe/Minsk',
    'Europe/Monaco',
    'Europe/Moscow',
    'Europe/Oslo',
    'Europe/Paris',
    'Europe/Podgorica',
    'Europe/Prague',
    'Europe/Riga',
    'Europe/Rome',
    'Europe/Samara',
    'Europe/San_Marino',
    'Europe/Sarajevo',
    'Europe/Saratov',
    'Europe/Simferopol',
    'Europe/Skopje',
    'Europe/Sofia',
    'Europe/Stockholm',
    'Europe/Tallinn',
    'Europe/Tirane',
    'Europe/Ulyanovsk',
    'Europe/Vaduz',
    'Europe/Vatican',
    'Europe/Vienna',
    'Europe/Vilnius',
    'Europe/Volgograd',
    'Europe/Warsaw',
    'Europe/Zagreb',
    'Europe/Zurich',
    'Indian/Antananarivo',
    'Indian/Chagos',
    'Indian/Christmas',
    'Indian/Cocos',
    'Indian/Comoro',
    'Indian/Kerguelen',
    'Indian/Mahe',
    'Indian/Maldives',
    'Indian/Mauritius',
    'Indian/Mayotte',
    'Indian/Reunion',
    'Pacific/Apia',
    'Pacific/Auckland',
    'Pacific/Bougainville',
    'Pacific/Chatham',
    'Pacific/Chuuk',
    'Pacific/Easter',
    'Pacific/Efate',
    'Pacific/Fakaofo',
    'Pacific/Fiji',
    'Pacific/Funafuti',
    'Pacific/Galapagos',
    'Pacific/Gambier',
    'Pacific/Guadalcanal',
    'Pacific/Guam',
    'Pacific/Honolulu',
    'Pacific/Kanton',
    'Pacific/Kiritimati',
    'Pacific/Kosrae',
    'Pacific/Kwajalein',
    'Pacific/Majuro',
    'Pacific/Marquesas',
    'Pacific/Midway',
    'Pacific/Nauru',
    'Pacific/Niue',
    'Pacific/Norfolk',
    'Pacific/Noumea',
    'Pacific/Pago_Pago',
    'Pacific/Palau',
    'Pacific/Pitcairn',
    'Pacific/Pohnpei',
    'Pacific/Port_Moresby',
    'Pacific/Rarotonga',
    'Pacific/Saipan',
    'Pacific/Tahiti',
    'Pacific/Tarawa',
    'Pacific/Tongatapu',
    'Pacific/Wake',
    'Pacific/Wallis'
  ];

  const handleSaveProfile = async () => {
    try {
      console.log('Attempting to save company profile:', companyProfile);
      const response = await fetchWithRetry('/api/employer/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyProfile),
      });
      if (response.ok) {
        console.log('Profile saved successfully.');
        alert('Company profile saved successfully!');
        await fetchSettings(); // Reload data to confirm persistence
      } else {
        const errData = await response.json();
        console.error('Failed to save profile:', errData);
        alert(`Failed to save company profile: ${errData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred while saving.');
    }
  };

  const handleSaveRules = async () => {
    try {
      console.log('Attempting to save business rules:', rules);
      const response = await fetchWithRetry('/api/employer/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      if (response.ok) {
        console.log('Rules saved successfully.');
        alert('Rules saved successfully!');
        await fetchSettings(); // Reload data to confirm persistence
      } else {
        const errData = await response.json();
        console.error('Failed to save rules:', errData);
        alert(`Failed to save rules: ${errData.error || 'Unknown error'}`);
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
            <input type="text" value={companyProfile.name || ''} onChange={e => setCompanyProfile({...companyProfile, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Website</label>
            <input type="text" value={companyProfile.website || ''} onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Email</label>
            <input type="email" value={companyProfile.email || ''} onChange={e => setCompanyProfile({...companyProfile, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
            <input type="tel" value={companyProfile.phone || ''} onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Head Office Location</label>
            <input type="text" value={companyProfile.head_office_location || ''} onChange={e => setCompanyProfile({...companyProfile, head_office_location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Factory Location</label>
            <input type="text" value={companyProfile.factory_location || ''} onChange={e => setCompanyProfile({...companyProfile, factory_location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About Us</label>
          <textarea value={companyProfile.about || ''} onChange={e => setCompanyProfile({...companyProfile, about: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows={4} />
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
             <input 
               type="text" 
               value={rules.activeLanguage || ''} 
               onChange={e => setRules({...rules, activeLanguage: e.target.value})} 
               placeholder="e.g. English (en)"
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
             />
          </div>
          
          <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Currencies</h3>
             <input 
               type="text" 
               value={rules.activeCurrency || ''} 
               onChange={e => setRules({...rules, activeCurrency: e.target.value})} 
               placeholder="e.g. US Dollar ($)"
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
             />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Zone</h3>
            <select 
              value={rules.timeZone || 'UTC'} 
              onChange={e => setRules({...rules, timeZone: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {timeZones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Format</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="timeFormat" 
                  value="12h" 
                  checked={rules.timeFormat === '12h'} 
                  onChange={e => setRules({...rules, timeFormat: e.target.value})} 
                />
                <span className="text-xs font-bold text-slate-700">12 Hours</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="timeFormat" 
                  value="24h" 
                  checked={rules.timeFormat === '24h'} 
                  onChange={e => setRules({...rules, timeFormat: e.target.value})} 
                />
                <span className="text-xs font-bold text-slate-700">24 Hours</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Tax Rate (%)</h3>
            <input type="number" value={rules.taxRate ?? 0} onChange={e => setRules({...rules, taxRate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">VAT Rate (%)</h3>
            <input type="number" value={rules.vatRate ?? 0} onChange={e => setRules({...rules, vatRate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="space-y-4 md:col-span-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Custom Field</h3>
            <input 
              type="text" 
              value={rules.customField || ''} 
              onChange={e => setRules({...rules, customField: e.target.value})} 
              placeholder="Enter custom business rule or metadata..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className={isSuperAdminPath ? "min-h-screen bg-[#f8f9fa] flex" : ""}>
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className={isSuperAdminPath ? "flex-1 p-8 lg:p-12 overflow-y-auto" : ""}>
        <div className="max-w-7xl mx-auto">
          {!location.pathname.includes('/gmail') && !location.pathname.includes('/whatsapp') && (
            <header className="mb-12">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Settings</h1>
              <p className="text-slate-500 font-medium">Configure global application settings and business rules.</p>
              
              {error && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold uppercase tracking-wider">
                  ⚠️ {error}
                  {isServerUp === false && (
                    <p className="mt-1 text-[10px] opacity-70">The backend server appears to be offline or unreachable.</p>
                  )}
                </div>
              )}
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
        </div>
      </main>
    </div>
  );
}
