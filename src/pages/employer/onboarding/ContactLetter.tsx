import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Download, 
  X,
  Calendar,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactLetter {
  id: string;
  title: string;
  user: string;
  date: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
}

const mockContactLetters: ContactLetter[] = [
  { id: '1', title: 'Initial Contact Letter - Frontend Dev', user: 'John Doe', date: '03/28/2026', status: 'Draft' },
  { id: '2', title: 'Follow-up Contact Letter', user: 'Jane Smith', date: '03/25/2026', status: 'Sent' },
];

export default function ContactLetterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'template'>('details');

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Contact Letters</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            <span>Dashboard</span>
            <span>-</span>
            <span>Onboarding</span>
            <span>-</span>
            <span className="text-blue-600">Contact Letter</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-fit"
          >
            <Plus size={18} />
            ADD NEW CONTACT LETTER
          </button>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search By Title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockContactLetters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                          <Mail size={32} className="text-slate-200" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">No data</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mockContactLetters.map((letter) => (
                    <tr key={letter.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-700">{letter.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600">{letter.user}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-500">{letter.date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          letter.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                          letter.status === 'Sent' ? 'bg-blue-50 text-blue-600' :
                          letter.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {letter.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Contact Letter Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Add New Contact Letter</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-slate-100 flex items-center gap-8 bg-white sticky top-[73px] z-10">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`py-4 text-xs font-black tracking-widest uppercase transition-all relative ${
                    activeTab === 'details' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Contact Letter Details
                  {activeTab === 'details' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('template')}
                  className={`py-4 text-xs font-black tracking-widest uppercase transition-all relative ${
                    activeTab === 'template' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Letterhead Template
                  {activeTab === 'template' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'details' ? (
                  <div className="space-y-8">
                    {/* Candidate Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              placeholder="Candidate Name"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Candidate Name</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              placeholder="Address"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Address</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              placeholder="Mobile"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Mobile</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input 
                              type="email" 
                              placeholder="email ID"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-32">email ID</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              defaultValue="03/28/2026"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12"
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-12">Date</span>
                        </div>
                        <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                          Select from existing users
                        </button>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] w-20">SUBJECT</span>
                      <input 
                        type="text" 
                        placeholder="Subject"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                      <textarea 
                        placeholder="Description"
                        rows={8}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">Letterhead Template Configuration</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white sticky bottom-0 z-10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Save
                  </button>
                  <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all">
                    Save & Send
                  </button>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                  <Download size={18} />
                  Download as word file
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
