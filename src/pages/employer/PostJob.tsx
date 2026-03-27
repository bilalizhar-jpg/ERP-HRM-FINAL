import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Plus, 
  RotateCcw, 
  ChevronDown,
  Briefcase,
  DollarSign,
  Link as LinkIcon,
  ArrowLeft
} from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

export default function PostJob() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState('');
  const [salaryVisible, setSalaryVisible] = useState(true);
  const [gender, setGender] = useState('Any');
  const [nationality, setNationality] = useState('');
  const [experience, setExperience] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [customQuestions, setCustomQuestions] = useState('No');
  const [jobDescription, setJobDescription] = useState('');

  const toggleEmploymentType = (type: string) => {
    setEmploymentTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleReset = () => {
    setJobTitle('');
    setJobLocation('');
    setEmploymentTypes([]);
    setSalaryRange('');
    setSalaryVisible(true);
    setGender('Any');
    setNationality('');
    setExperience('');
    setGoogleFormLink('');
    setCustomQuestions('No');
    setJobDescription('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8">
          <Link 
            to="/super-admin/employer/recruitment/jobs-list"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-4 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            Back to Jobs List
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Post a New Job</h1>
        </header>

        <div className="max-w-4xl">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            {/* Header Section */}
            <div className="p-10 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Briefcase size={20} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Job Details</h2>
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] ml-13">
                Fill out the details below to publish a new job opening on your career page.
              </p>
            </div>

            {/* Form Body */}
            <form className="p-10 space-y-8">
              {/* Job Title */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title *</label>
                <input 
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location *</label>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    type="text"
                    placeholder="e.g. New York, USA"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Employment Type & Workplace */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employment Type & Workplace *</label>
                <div className="flex flex-wrap gap-6">
                  {['Remote', 'On-site', 'Hybrid', 'Full-time', 'Part-time'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox"
                          checked={employmentTypes.includes(type)}
                          onChange={() => toggleEmploymentType(type)}
                          className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        />
                        <Plus size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={4} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Range</label>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visible on Career Page</span>
                    <button 
                      type="button"
                      onClick={() => setSalaryVisible(!salaryVisible)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${salaryVisible ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${salaryVisible ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="relative group">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    type="text"
                    placeholder="e.g. $80,000 - $100,000 / year"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Gender & Nationality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender (Optional)</label>
                  <div className="relative">
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase appearance-none"
                    >
                      <option>Any</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nationality (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. UAE Nationals only"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Experience & Google Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Years of Experience (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. 3-5 years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Form Link (Optional)</label>
                  <div className="relative group">
                    <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder="https://forms.google.com/..."
                      value={googleFormLink}
                      onChange={(e) => setGoogleFormLink(e.target.value)}
                      className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Questions */}
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Questions (Optional)</label>
                <div className="flex items-center gap-6">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio"
                        name="customQuestions"
                        checked={customQuestions === option}
                        onChange={() => setCustomQuestions(option)}
                        className="peer hidden"
                      />
                      <div className="w-5 h-5 border-2 border-slate-200 rounded-full flex items-center justify-center peer-checked:border-blue-600 transition-all">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Create Test MCQ */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Create Test MCQ (Optional)</label>
                  <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:text-blue-700 transition-colors">
                    <Plus size={14} strokeWidth={3} />
                    Add Question
                  </button>
                </div>
                <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-center justify-center bg-slate-50/20">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No test questions added yet.</p>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Description *</label>
                <textarea 
                  rows={8}
                  placeholder="Describe the role, responsibilities, requirements, and benefits..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase resize-none placeholder:text-slate-300"
                />
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-10 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
              <button 
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:text-rose-700 transition-colors"
              >
                <RotateCcw size={16} strokeWidth={3} />
                Reset Form
              </button>

              <div className="flex items-center gap-6 w-full md:w-auto">
                <button type="button" className="flex-1 md:flex-none text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                  Save as Draft
                </button>
                <button type="button" className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group">
                  <Plus size={16} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                  Publish Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
