import { FileText, Upload, Download, Trash2, Plus, Search, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Policy {
  id: number;
  title: string;
  category: string;
  updatedAt: string;
  size: string;
  type: string;
  location?: string;
  description?: string;
}

export default function CompanyPolicy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);

  // Form State
  const [newPolicy, setNewPolicy] = useState({
    location: '',
    title: '',
    description: '',
    methodType: 'upload', // 'upload' or 'create'
    file: null as File | null
  });

  const handleCreatePolicy = () => {
    if (!newPolicy.title || !newPolicy.location) return;

    const policy: Policy = {
      id: Date.now(),
      title: newPolicy.title,
      category: 'General',
      updatedAt: new Date().toISOString().split('T')[0],
      size: newPolicy.file ? `${(newPolicy.file.size / 1024 / 1024).toFixed(1)} MB` : '0 KB',
      type: newPolicy.file ? newPolicy.file.name.split('.').pop()?.toUpperCase() || 'FILE' : 'DOC',
      location: newPolicy.location,
      description: newPolicy.description
    };

    setPolicies([...policies, policy]);
    setIsModalOpen(false);
    setNewPolicy({ location: '', title: '', description: '', methodType: 'upload', file: null });
  };

  const totalSize = policies.reduce((acc, p) => {
    const size = parseFloat(p.size);
    return isNaN(size) ? acc : acc + size;
  }, 0).toFixed(1);

  const handleDeletePolicy = (id: number) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  const filteredPolicies = policies.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900">Company Policy</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Guidelines & Documentation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH POLICIES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={16} />
            Add New Policy
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add New Company Policy</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-rose-500">*</span> Location
                    </label>
                    <select 
                      value={newPolicy.location}
                      onChange={(e) => setNewPolicy({...newPolicy, location: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Location...</option>
                      <option value="Headquarters">Headquarters</option>
                      <option value="New York Office">New York Office</option>
                      <option value="London Branch">London Branch</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-rose-500">*</span> Title
                    </label>
                    <input 
                      type="text"
                      placeholder="Please Enter Title"
                      value={newPolicy.title}
                      onChange={(e) => setNewPolicy({...newPolicy, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-rose-500">*</span> Description
                  </label>
                  <textarea 
                    placeholder="Please Enter Description"
                    rows={4}
                    value={newPolicy.description}
                    onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                {/* Method Type */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Method Type</label>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="methodType" 
                          checked={newPolicy.methodType === 'upload'}
                          onChange={() => setNewPolicy({...newPolicy, methodType: 'upload'})}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-blue-600 transition-all"
                        />
                        <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Upload File</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="methodType" 
                          checked={newPolicy.methodType === 'create'}
                          onChange={() => setNewPolicy({...newPolicy, methodType: 'create'})}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-full checked:border-blue-600 transition-all"
                        />
                        <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Create File</span>
                    </label>
                  </div>
                </div>

                {/* Policy Document Upload */}
                {newPolicy.methodType === 'upload' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-rose-500">*</span> Policy Document
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
                        <Upload size={14} />
                        Upload
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setNewPolicy({...newPolicy, file: e.target.files?.[0] || null})}
                        />
                      </label>
                      {newPolicy.file && (
                        <span className="text-[10px] font-bold text-blue-600 truncate max-w-[200px]">
                          {newPolicy.file.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePolicy}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map(policy => (
              <div key={policy.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">{policy.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{policy.category}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{policy.size} • {policy.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Download">
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FileText size={40} className="text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No Policies Found</h2>
              <p className="text-slate-500 text-center max-w-md">
                Try adjusting your search or add a new policy to get started.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              Policy Overview
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Policies</span>
                <span className="text-lg font-black text-slate-900">{policies.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage Used</span>
                <span className="text-lg font-black text-slate-900">{totalSize} MB</span>
              </div>
              <hr className="border-slate-100" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(policies.map(p => p.category))).map(cat => (
                    <span key={cat} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-100">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Upload size={160} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-2 relative z-10">Quick Upload</h3>
            <p className="text-blue-100 text-xs font-medium mb-6 relative z-10">Drag and drop files here to quickly add new company policies.</p>
            <div className="border-2 border-dashed border-blue-400/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-blue-500/50 transition-colors cursor-pointer relative z-10">
              <Upload size={32} className="text-blue-200" />
              <span className="text-[10px] font-black uppercase tracking-widest">Drop Files Here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
