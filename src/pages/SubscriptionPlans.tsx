import { 
  Maximize2, 
  Menu, 
  Search,
  Check,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

export default function SubscriptionPlans() {
  const plans = [
    {
      name: 'BASIC PLAN',
      price: '40',
      duration: '30 Days',
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/20',
      features: ['Validation 30 Days', 'Unlimited Employees', 'Priority Support', '24/7 Dedicated Support', 'Core Modules Access', 'Single Subsidiary']
    },
    {
      name: 'PREMIUM PLAN',
      price: '80',
      duration: '60 Days',
      color: 'bg-blue-600',
      shadow: 'shadow-blue-600/20',
      features: ['Validation 60 Days', 'Unlimited Employees', 'Priority Support', '24/7 Dedicated Support', 'Advanced Modules', 'Up to 3 Subsidiaries']
    },
    {
      name: 'ULTIMATE PLAN',
      price: '100',
      duration: '120 Days',
      color: 'bg-blue-700',
      shadow: 'shadow-blue-700/20',
      features: ['Validation 120 Days', 'Unlimited Employees', 'Priority Support', '24/7 Dedicated Support', 'All Modules Access', 'Unlimited Subsidiaries', 'Custom Branding']
    }
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
                placeholder="Search plans..." 
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SYSTEM ARCHITECT</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                SA
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">SUBSCRIPTION PROTOCOLS</h1>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Configure and manage the service tiers for all registered companies. Every plan is designed to scale with business growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group hover:scale-[1.02] transition-transform duration-300"
              >
                {/* Header */}
                <div className={`${plan.color} p-8 text-center relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={80} />
                  </div>
                  <h3 className="text-white font-black tracking-widest text-sm mb-6 uppercase">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-white">
                    <span className="text-2xl font-bold self-start mt-2">$</span>
                    <span className="text-7xl font-black tracking-tighter">{plan.price}</span>
                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest ml-2">/ MONTH</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-10 flex-1 flex flex-col">
                  <div className="space-y-6 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-4 group/item">
                        <div className={`w-6 h-6 rounded-full ${plan.color} bg-opacity-10 flex items-center justify-center text-current transition-colors`}>
                          <Check size={14} className={plan.color.replace('bg-', 'text-')} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`mt-12 w-full py-5 rounded-2xl text-white font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 ${plan.color} ${plan.shadow} hover:brightness-110 active:scale-95`}>
                    CHOOSE PLAN
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-[#1e1f26] rounded-[2.5rem] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-black tracking-tight uppercase">NEED A CUSTOM PROTOCOL?</h2>
                <p className="text-slate-400 font-medium max-w-xl">
                  For large-scale enterprises requiring specific module configurations and dedicated infrastructure, we offer custom architectural solutions.
                </p>
              </div>
              <button className="px-10 py-5 bg-white text-black font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-emerald-400 transition-all">
                CONTACT ARCHITECT
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
