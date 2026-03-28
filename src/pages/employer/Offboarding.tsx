import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileCheck, 
  UserX, 
  Award, 
  FileText,
  ChevronRight,
  ClipboardList,
  ShieldAlert,
  MessageSquare,
  Lock
} from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

const offboardingModules = [
  { 
    name: 'Resignation Acceptance', 
    description: 'Process and accept employee resignations.',
    icon: FileCheck,
    path: '/super-admin/employer/offboarding/resignation-acceptance',
    color: 'bg-emerald-50 text-emerald-600'
  },
  { 
    name: 'Termination Letter', 
    description: 'Generate and manage termination notices.',
    icon: UserX,
    path: '/super-admin/employer/offboarding/termination-letter',
    color: 'bg-rose-50 text-rose-600'
  },
  { 
    name: 'Experience Letter', 
    description: 'Issue experience certificates to departing staff.',
    icon: Award,
    path: '/super-admin/employer/offboarding/experience-letter',
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    name: 'Relieving Letter', 
    description: 'Provide formal relieving letters upon exit.',
    icon: FileText,
    path: '/super-admin/employer/offboarding/relieving-letter',
    color: 'bg-amber-50 text-amber-600'
  },
  { 
    name: 'FNF Settlement', 
    description: 'Manage Full & Final settlement process.',
    icon: ClipboardList,
    path: '/super-admin/employer/offboarding/fnf-settlement',
    color: 'bg-slate-50 text-slate-600'
  },
  { 
    name: 'No Dues Certificate', 
    description: 'Clearance certificates from all departments.',
    icon: ShieldAlert,
    path: '/super-admin/employer/offboarding/no-dues',
    color: 'bg-slate-50 text-slate-600'
  },
  { 
    name: 'Exit Interview', 
    description: 'Conduct and record exit interviews.',
    icon: MessageSquare,
    path: '/super-admin/employer/offboarding/exit-interview',
    color: 'bg-slate-50 text-slate-600'
  },
  { 
    name: 'NDA Reminder', 
    description: 'Confidentiality reminders for exiting employees.',
    icon: Lock,
    path: '/super-admin/employer/offboarding/nda-reminder',
    color: 'bg-slate-50 text-slate-600'
  }
];

export default function Offboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Offboarding</h1>
          <p className="text-slate-500 font-medium text-lg">Manage employee exit and offboarding workflows.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offboardingModules.map((module) => {
            const path = isSuperAdminPath 
              ? module.path 
              : module.path.replace('/super-admin/employer', '/company-admin');
            return (
              <button
                key={module.name}
                onClick={() => navigate(path)}
                className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left flex flex-col h-full"
              >
                <div className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <module.icon size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 flex items-center justify-between w-full">
                  {module.name}
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {module.description}
                </p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
