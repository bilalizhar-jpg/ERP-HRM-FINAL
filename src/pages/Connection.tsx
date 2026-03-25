import { 
  Maximize2, 
  Menu, 
  Search,
  Database,
  Globe,
  Server,
  Activity
} from 'lucide-react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

export default function Connection() {
  const connections = [
    { name: 'Primary Database', type: 'MySQL', status: 'Connected', latency: '24ms', load: '12%' },
    { name: 'Backup Server', type: 'Storage', status: 'Standby', latency: '45ms', load: '2%' },
    { name: 'Email Protocol', type: 'SMTP', status: 'Active', latency: '120ms', load: '5%' },
    { name: 'API Gateway', type: 'REST', status: 'Connected', latency: '18ms', load: '24%' },
  ];

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
                placeholder="Search connections..." 
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">NETWORK ARCHITECT</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                NA
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">CONNECTION PROTOCOLS</h1>
            <p className="text-slate-500 font-medium mt-1">Monitor system connectivity and infrastructure status.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {connections.map((conn) => (
              <div key={conn.name} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    {conn.type === 'MySQL' ? <Database size={24} /> : 
                     conn.type === 'SMTP' ? <Globe size={24} /> : 
                     conn.type === 'REST' ? <Activity size={24} /> : <Server size={24} />}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                    conn.status === 'Connected' || conn.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {conn.status}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">{conn.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{conn.type} PROTOCOL</p>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Latency</span>
                  <span className="text-slate-900">{conn.latency}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mt-2">
                  <span className="text-slate-400">Load</span>
                  <span className="text-slate-900">{conn.load}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
