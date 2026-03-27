import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Filter, Search, MoreVertical, ChevronDown, Building2, FileText, RotateCcw } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

interface Job {
  id: string;
  positionName: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  createdDate: string;
  status: 'Active' | 'Closed' | 'Draft';
  department: string;
  departmentCode: string;
  headcount: string;
}

export default function JobsList() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const basePath = isSuperAdminPath ? '/super-admin/employer' : '/company-admin';
  const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('LIST');
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      positionName: '140L - Air and Missile Defense (AMD) Systems Technician',
      location: 'Arlington, Virginia, United States',
      minSalary: '50 USD',
      maxSalary: '90 USD',
      createdDate: '2025-12-29',
      status: 'Active',
      department: 'Electrical & Electronics',
      departmentCode: 'E&E',
      headcount: '2 - 1'
    }
  ]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {/* Top Header with View Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Active</h1>
            <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronDown size={20} className="text-blue-600" />
            </button>
          </div>
          
          <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            <button 
              onClick={() => setViewMode('BOARD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                viewMode === 'BOARD' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Building2 size={14} />
              BOARD
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                viewMode === 'LIST' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText size={14} />
              LIST
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link 
            to={`${basePath}/recruitment/job-posting`}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 w-fit"
          >
            <Plus size={16} strokeWidth={3} />
            Create Job
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              <Filter size={16} />
              Filters
              <span className="ml-1 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[8px]">1</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all">
              <RotateCcw size={16} />
              Refresh
            </button>
            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-all">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      Position Name
                      <ChevronDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">Job Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">Minimum Salary</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">Maximum Salary</th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      Job Created Date
                      <ChevronDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      Job Status
                      <ChevronDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      Job Department
                      <ChevronDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">Headcount</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-between gap-4">
                          <Link to="#" className="text-xs font-bold text-blue-600 hover:underline line-clamp-1">
                            {job.positionName}
                          </Link>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                              <FileText size={14} />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                              <Search size={14} />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[11px] font-medium text-slate-600">{job.location}</td>
                      <td className="px-6 py-5 text-[11px] font-medium text-slate-600">{job.minSalary}</td>
                      <td className="px-6 py-5 text-[11px] font-medium text-slate-600">{job.maxSalary}</td>
                      <td className="px-6 py-5 text-[11px] font-medium text-slate-600">{job.createdDate}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full w-fit">
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <Plus size={10} className="text-white rotate-45" />
                          </div>
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{job.status}</span>
                          <ChevronDown size={12} className="text-slate-400" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                            {job.departmentCode}
                          </div>
                          <span className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                            {job.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[11px] font-black text-slate-700">{job.headcount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                          <Search size={40} />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">
                          No jobs found. Click <Link to={`${basePath}/recruitment/job-posting`} className="text-blue-600 font-bold hover:underline transition-all">"Create Job"</Link> to start.
                        </p>
                      </div>
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
