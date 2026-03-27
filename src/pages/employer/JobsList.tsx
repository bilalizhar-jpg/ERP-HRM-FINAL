import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Filter, Search, MoreVertical, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

interface Job {
  id: string;
  positionName: string;
  location: string;
  salary: string;
  createdDate: string;
  status: 'Active' | 'Closed' | 'Draft';
  candidates: number;
  department: string;
  headcount: number;
}

export default function JobsList() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const [jobs] = useState<Job[]>([]); // Empty for now to show the "No jobs found" state

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Jobs List</h1>
            <p className="text-slate-500 font-medium">Manage and track all job openings in your organization.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={18} />
              FILTERS
            </button>
            <Link 
              to="/super-admin/employer/recruitment/job-posting"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Plus size={18} />
              CREATE JOB
            </Link>
          </div>
        </header>

        {/* Main Content Card - Matching the image structure but with theme colors */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          {/* Header Section of the Card */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-slate-900 tracking-widest uppercase">ACTIVE</span>
              <span className="w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {jobs.filter(j => j.status === 'Active').length}
              </span>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">POSITION NAME</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">JOB LOCATION</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">SALARY</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">JOB CREATED DATE</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">JOB STATUS</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">CANDIDATES</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">JOB DEPARTMENT</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">HEADCOUNT</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Briefcase size={20} />
                          </div>
                          <span className="font-bold text-slate-900">{job.positionName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{job.location}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{job.salary}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{job.createdDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          job.status === 'Active' ? 'bg-green-100 text-green-700' :
                          job.status === 'Closed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{job.candidates}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{job.department}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{job.headcount}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-24 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                          <Search size={40} />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">
                          No jobs found. Click <Link to="/super-admin/employer/recruitment/job-posting" className="text-blue-600 font-bold hover:underline transition-all">"Create Job"</Link> to start.
                        </p>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
