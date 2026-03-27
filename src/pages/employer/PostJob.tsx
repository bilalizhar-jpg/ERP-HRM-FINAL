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
  ArrowLeft,
  Trash2
} from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

interface CustomQuestion {
  id: string;
  text: string;
  type: string;
}

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  id: string;
  text: string;
  options: MCQOption[];
}

export default function PostJob() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const basePath = isSuperAdminPath ? '/super-admin/employer' : '/company-admin';

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState('');
  const [salaryVisible, setSalaryVisible] = useState(true);
  const [gender, setGender] = useState('Any');
  const [nationality, setNationality] = useState('');
  const [experience, setExperience] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [customQuestionsEnabled, setCustomQuestionsEnabled] = useState('No');
  const [jobDescription, setJobDescription] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Custom Questions State
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('Text Answer');

  // MCQ State
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);

  const addCustomQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: CustomQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      text: newQuestionText,
      type: newQuestionType
    };
    setQuestions([...questions, newQ]);
    setNewQuestionText('');
  };

  const removeCustomQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateCustomQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const addMCQQuestion = () => {
    const newMCQ: MCQQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: [
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false },
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false }
      ]
    };
    setMcqs([...mcqs, newMCQ]);
  };

  const removeMCQQuestion = (id: string) => {
    setMcqs(mcqs.filter(m => m.id !== id));
  };

  const updateMCQQuestionText = (id: string, text: string) => {
    setMcqs(mcqs.map(m => m.id === id ? { ...m, text } : m));
  };

  const addMCQOption = (questionId: string) => {
    setMcqs(mcqs.map(m => {
      if (m.id === questionId) {
        return {
          ...m,
          options: [...m.options, { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false }]
        };
      }
      return m;
    }));
  };

  const removeMCQOption = (questionId: string, optionId: string) => {
    setMcqs(mcqs.map(m => {
      if (m.id === questionId) {
        return {
          ...m,
          options: m.options.filter(o => o.id !== optionId)
        };
      }
      return m;
    }));
  };

  const updateMCQOption = (questionId: string, optionId: string, updates: Partial<MCQOption>) => {
    setMcqs(mcqs.map(m => {
      if (m.id === questionId) {
        return {
          ...m,
          options: m.options.map(o => {
            if (o.id === optionId) {
              // If setting to correct, unset others in the same question
              if (updates.isCorrect) {
                return { ...o, ...updates };
              }
              return { ...o, ...updates };
            }
            // If another option is being set to correct, this one must be incorrect
            if (updates.isCorrect) {
              return { ...o, isCorrect: false };
            }
            return o;
          })
        };
      }
      return m;
    }));
  };

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
    setDepartment('');
    setCategory('');
    setGoogleFormLink('');
    setCustomQuestionsEnabled('No');
    setQuestions([]);
    setMcqs([]);
    setJobDescription('');
    setBenefits([]);
    setNewBenefit('');
    setSkills([]);
    setNewSkill('');
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove: string) => {
    setBenefits(benefits.filter(b => b !== benefitToRemove));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8">
          <Link 
            to={`${basePath}/recruitment/jobs-list`}
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

              {/* Experience & Department */}
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department *</label>
                  <div className="relative">
                    <select 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase appearance-none"
                    >
                      <option value="">Select Department</option>
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                      <option>Human Resources</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              {/* Category & Google Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Category *</label>
                  <div className="relative">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase appearance-none"
                    >
                      <option value="">Select Category</option>
                      <option>Software Development</option>
                      <option>Product Management</option>
                      <option>Customer Success</option>
                      <option>Operations</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
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

              {/* Skills Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skills Required (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-800">
                        <Plus size={12} className="rotate-45" strokeWidth={4} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text"
                    placeholder="e.g. React, TypeScript, Node.js"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                  />
                  <button 
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Custom Questions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Questions (Optional)</label>
                  <div className="flex items-center gap-6">
                    {['Yes', 'No'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio"
                          name="customQuestions"
                          checked={customQuestionsEnabled === option}
                          onChange={() => setCustomQuestionsEnabled(option)}
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

                {customQuestionsEnabled === 'Yes' && (
                  <div className="space-y-4">
                    {/* Added Questions List */}
                    {questions.map((q, index) => (
                      <div key={q.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                          {index + 1}
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row gap-4">
                          <input 
                            type="text"
                            value={q.text}
                            onChange={(e) => updateCustomQuestion(q.id, { text: e.target.value })}
                            className="flex-1 bg-transparent border-none text-xs font-black text-slate-900 uppercase tracking-widest focus:ring-0 p-0"
                            placeholder="Question text"
                          />
                          <div className="relative min-w-[140px]">
                            <select 
                              value={q.type}
                              onChange={(e) => updateCustomQuestion(q.id, { type: e.target.value })}
                              className="w-full bg-transparent border-none text-[9px] font-black text-blue-600 uppercase tracking-widest focus:ring-0 appearance-none cursor-pointer p-0 pr-6"
                            >
                              <option>Text Answer</option>
                              <option>Yes/No</option>
                              <option>File Upload</option>
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" size={12} />
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeCustomQuestion(q.id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}

                    {/* Add Question Input Area */}
                    <div className="flex flex-col md:flex-row gap-4 p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/20">
                      <div className="flex-1 space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Add New Question</label>
                        <input 
                          type="text"
                          placeholder="e.g. Do you have a valid driver's license?"
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                        />
                      </div>
                      <div className="space-y-2 min-w-[180px]">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Answer Type</label>
                        <div className="relative">
                          <select 
                            value={newQuestionType}
                            onChange={(e) => setNewQuestionType(e.target.value)}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase appearance-none"
                          >
                            <option>Text Answer</option>
                            <option>Yes/No</option>
                            <option>File Upload</option>
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="button"
                          onClick={addCustomQuestion}
                          className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 h-[52px] w-[52px] flex items-center justify-center"
                        >
                          <Plus size={24} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Create Test MCQ */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Create Test MCQ (Optional)</label>
                  <button 
                    type="button" 
                    onClick={addMCQQuestion}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:text-blue-700 transition-colors"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Add Question
                  </button>
                </div>

                {mcqs.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-center justify-center bg-slate-50/20">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No test questions added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {mcqs.map((mcq, index) => (
                      <div key={mcq.id} className="bg-slate-50/30 border border-slate-100 rounded-[2rem] p-8 space-y-6 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {index + 1}</span>
                          <button 
                            type="button" 
                            onClick={() => removeMCQQuestion(mcq.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <input 
                          type="text"
                          placeholder="Enter question text..."
                          value={mcq.text}
                          onChange={(e) => updateMCQQuestionText(mcq.id, e.target.value)}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                        />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Options</span>
                            <button 
                              type="button" 
                              onClick={() => addMCQOption(mcq.id)}
                              className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-700 transition-colors"
                            >
                              <Plus size={12} strokeWidth={3} />
                              Add Option
                            </button>
                          </div>

                          <div className="space-y-3">
                            {mcq.options.map((option) => (
                              <div key={option.id} className="flex flex-col md:flex-row items-center gap-4">
                                <input 
                                  type="text"
                                  placeholder="Option text"
                                  value={option.text}
                                  onChange={(e) => updateMCQOption(mcq.id, option.id, { text: e.target.value })}
                                  className="flex-1 w-full px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                                />
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-3">
                                    <button 
                                      type="button"
                                      onClick={() => updateMCQOption(mcq.id, option.id, { isCorrect: true })}
                                      className="flex items-center gap-2 group/opt"
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${option.isCorrect ? 'border-emerald-500' : 'border-slate-200'}`}>
                                        {option.isCorrect && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                                      </div>
                                      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${option.isCorrect ? 'text-emerald-500' : 'text-slate-400 group-hover/opt:text-slate-600'}`}>Correct</span>
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => updateMCQOption(mcq.id, option.id, { isCorrect: false })}
                                      className="flex items-center gap-2 group/opt"
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${!option.isCorrect ? 'border-rose-500' : 'border-slate-200'}`}>
                                        {!option.isCorrect && <div className="w-2 h-2 bg-rose-500 rounded-full" />}
                                      </div>
                                      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${!option.isCorrect ? 'text-rose-500' : 'text-slate-400 group-hover/opt:text-slate-600'}`}>Incorrect</span>
                                    </button>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => removeMCQOption(mcq.id, option.id)}
                                    className="text-slate-200 hover:text-rose-600 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Description *</label>
                  <div className="flex items-center gap-2">
                    {['B', 'I', 'U', 'List'].map((tool) => (
                      <button key={tool} type="button" className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-slate-100 bg-white">
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  rows={8}
                  placeholder="Describe the role, responsibilities, requirements..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase resize-none placeholder:text-slate-300"
                />
              </div>

              {/* Job Benefits */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Benefits (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {benefits.map((benefit) => (
                    <span key={benefit} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      {benefit}
                      <button type="button" onClick={() => removeBenefit(benefit)} className="hover:text-emerald-800">
                        <Plus size={12} className="rotate-45" strokeWidth={4} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text"
                    placeholder="e.g. Health Insurance, Paid Time Off, Remote Work"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all uppercase"
                  />
                  <button 
                    type="button"
                    onClick={addBenefit}
                    className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    Add Benefit
                  </button>
                </div>
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
