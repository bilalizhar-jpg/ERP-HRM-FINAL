import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Copy,
  Save,
  Wand2,
  History,
  Lightbulb,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  prompt: string;
  icon: LucideIcon;
}

// Context Mapping
const getContext = (pathname: string) => {
  if (pathname.includes('/recruitment/job-posting')) return 'JOB_POSTING';
  if (pathname.includes('/recruitment')) return 'RECRUITMENT';
  if (pathname.includes('/employee')) return 'EMPLOYEE';
  if (pathname.includes('/payroll')) return 'PAYROLL';
  if (pathname.includes('/onboarding')) return 'ONBOARDING';
  if (pathname.includes('/offboarding')) return 'OFFBOARDING';
  if (pathname.includes('/performance')) return 'PERFORMANCE';
  if (pathname.includes('/attendance')) return 'ATTENDANCE';
  if (pathname.includes('/leaves')) return 'LEAVES';
  if (pathname.includes('/super-admin')) return 'SUPER_ADMIN';
  if (pathname.includes('/marketing')) return 'MARKETING';
  if (pathname.includes('/crm')) return 'CRM';
  if (pathname.includes('/projects')) return 'PROJECTS';
  return 'GENERAL';
};

const getSuggestions = (context: string): Suggestion[] => {
  switch (context) {
    case 'JOB_POSTING':
      return [
        { id: '1', text: 'Generate Job Description', prompt: 'Generate a professional job description for a [Position Name] role including responsibilities, requirements, and benefits.', icon: Wand2 },
        { id: '2', text: 'Write Interview Questions', prompt: 'Create a list of 10 behavioral and technical interview questions for a [Position Name] role.', icon: MessageSquare },
      ];
    case 'EMPLOYEE':
      return [
        { id: '1', text: 'Draft Warning Letter', prompt: 'Draft a formal warning letter for an employee regarding [Issue, e.g., performance, attendance].', icon: FileText },
        { id: '2', text: 'Write Promotion Letter', prompt: 'Generate a professional promotion letter for an employee moving to [New Position].', icon: Award },
      ];
    case 'PAYROLL':
      return [
        { id: '1', text: 'Explain Tax Deductions', prompt: 'Explain common tax deductions and how they impact net salary for employees.', icon: DollarSign },
        { id: '2', text: 'Draft Bonus Announcement', prompt: 'Write an email announcement for the upcoming performance bonus distribution.', icon: Megaphone },
      ];
    case 'ONBOARDING':
      return [
        { id: '1', text: 'Create Onboarding Checklist', prompt: 'Generate a comprehensive onboarding checklist for a new hire in the [Department] department.', icon: ClipboardList },
        { id: '2', text: 'Draft Welcome Email', prompt: 'Write a warm and professional welcome email for a new employee joining as [Position].', icon: Mail },
      ];
    case 'PERFORMANCE':
      return [
        { id: '1', text: 'Write Feedback Template', prompt: 'Create a constructive feedback template for a quarterly performance review.', icon: Target },
        { id: '2', text: 'Suggest Improvement Plan', prompt: 'Outline a 30-day performance improvement plan (PIP) for a [Role] struggling with [Specific Skill].', icon: TrendingUp },
      ];
    case 'MARKETING':
      return [
        { id: '1', text: 'Draft Social Media Post', prompt: 'Write 3 engaging social media posts for [Platform] to promote [Product/Service].', icon: Megaphone },
        { id: '2', text: 'Write Email Campaign', prompt: 'Draft a 3-email sequence for a marketing campaign targeting [Audience] for [Goal].', icon: Mail },
      ];
    case 'CRM':
      return [
        { id: '1', text: 'Draft Sales Pitch', prompt: 'Create a compelling sales pitch for [Product] targeting [Client Type].', icon: Target },
        { id: '2', text: 'Write Follow-up Email', prompt: 'Draft a professional follow-up email for a lead who hasn\'t responded in [Time Period].', icon: Mail },
      ];
    case 'PROJECTS':
      return [
        { id: '1', text: 'Generate Project Plan', prompt: 'Outline a high-level project plan for [Project Name] including phases and key milestones.', icon: ClipboardList },
        { id: '2', text: 'Draft Status Report', prompt: 'Write a weekly project status report template for [Project Name].', icon: FileText },
      ];
    case 'SUPER_ADMIN':
      return [
        { id: '1', text: 'Analyze System Usage', prompt: 'Draft a report summarizing key system usage metrics for the past month.', icon: TrendingUp },
        { id: '2', text: 'Write Security Policy', prompt: 'Draft a comprehensive security and data privacy policy for the ERP system.', icon: FileText },
      ];
    default:
      return [
        { id: '1', text: 'Draft Company Policy', prompt: 'Draft a clear and concise company policy regarding [Topic, e.g., Remote Work, Dress Code].', icon: FileText },
        { id: '2', text: 'Write Internal Memo', prompt: 'Write an internal memo to all staff regarding [Subject].', icon: MessageSquare },
      ];
  }
};

import { 
  FileText, 
  Award, 
  DollarSign, 
  Megaphone, 
  ClipboardList, 
  Mail, 
  Target, 
  TrendingUp 
} from 'lucide-react';

export default function GlobalAIAssistant() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Message[][]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editableContent, setEditableContent] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const context = getContext(location.pathname);
  const suggestions = getSuggestions(context);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: `You are a helpful AI Assistant integrated into an ERP system. 
          The current context is: ${context}. 
          Provide structured, professional, and actionable advice or content. 
          Use markdown for formatting (headings, lists, bold text).`,
        },
      });

      const response = await model;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setEditableContent(response.text || null);
    } catch (error) {
      console.error("AI Generation Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToHistory = () => {
    if (messages.length > 0) {
      setHistory(prev => [messages, ...prev]);
      setMessages([]);
      setEditableContent(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Assistant Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded ? 'w-[800px] h-[600px]' : 'w-[400px] h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Context: {context}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* History Sidebar (Optional) */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 200 }}
                    exit={{ width: 0 }}
                    className="border-r border-slate-100 bg-slate-50 overflow-y-auto"
                  >
                    <div className="p-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">History</h4>
                      {history.map((session, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setMessages(session)}
                          className="w-full text-left p-2 hover:bg-white rounded-lg mb-2 transition-all group"
                        >
                          <p className="text-xs font-bold text-slate-600 truncate">{session[0]?.content}</p>
                          <p className="text-[10px] text-slate-400">{session[0]?.timestamp.toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat & Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-2">
                        <Bot size={32} className="text-blue-500" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">How can I help you today?</h4>
                      <p className="text-sm text-slate-500 max-w-[250px]">I'm aware you're currently in the <span className="font-bold text-blue-600">{context}</span> module.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          msg.role === 'user' ? 'bg-slate-900' : 'bg-blue-500'
                        }`}>
                          {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-slate-900 text-white rounded-tr-none shadow-lg shadow-slate-900/10' 
                            : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isGenerating && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions Bar */}
                {messages.length === 0 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSend(s.prompt)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                        >
                          <s.icon size={14} />
                          {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      <History size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                        placeholder="Ask me anything..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button 
                        onClick={() => handleSend(inputValue)}
                        disabled={!inputValue.trim() || isGenerating}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Pane (When Expanded) */}
              {isExpanded && editableContent && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 400 }}
                  className="border-l border-slate-100 flex flex-col"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editor</h4>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(editableContent);
                        }}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                        title="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
                          if (lastAssistantMsg) {
                            setEditableContent(lastAssistantMsg.content);
                          }
                        }}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                        title="Reset to original"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                  <textarea 
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="flex-1 p-6 text-sm text-slate-700 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                    <button 
                      onClick={saveToHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Save size={14} />
                      SAVE TO HISTORY
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="flex flex-col items-end gap-3">
        {/* Subtle Suggestion Bubble */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: 1 }}
              className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 mb-1"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                I can help with {context.toLowerCase().replace('_', ' ')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen ? 'bg-slate-900 rotate-90' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <Sparkles size={24} className="text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
