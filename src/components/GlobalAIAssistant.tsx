import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  History, 
  Copy, 
  RotateCcw, 
  Save,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Wand2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Suggestion {
  id: string;
  label: string;
  prompt: string;
  module: string;
}

interface AIHistoryItem {
  id: number;
  user_id: number;
  module: string;
  prompt: string;
  response: string;
  created_at: string;
}

const MODULE_SUGGESTIONS: Record<string, Suggestion[]> = {
  '/super-admin/employer/recruitment/job-posting': [
    { id: 'jd', label: 'Generate Job Description', prompt: 'Generate a professional job description for a [Role] including responsibilities and requirements.', module: 'Recruitment' },
    { id: 'interview', label: 'Generate Interview Questions', prompt: 'Generate 10 technical and behavioral interview questions for a [Role].', module: 'Recruitment' }
  ],
  '/super-admin/employer/employee': [
    { id: 'offer', label: 'Draft Offer Letter', prompt: 'Draft a formal offer letter for a new employee named [Name] for the position of [Role].', module: 'HR' },
    { id: 'warning', label: 'Draft Warning Letter', prompt: 'Draft a professional warning letter for an employee regarding [Issue].', module: 'HR' }
  ],
  '/super-admin/employer/crm': [
    { id: 'quote', label: 'Generate Quotation', prompt: 'Generate a sales quotation for [Client Name] for [Product/Service].', module: 'Sales' },
    { id: 'contract', label: 'Draft Sales Contract', prompt: 'Draft a standard sales contract for [Client Name].', module: 'Sales' }
  ],
  '/super-admin/employer/payroll': [
    { id: 'policy', label: 'Explain Payroll Policy', prompt: 'Explain standard payroll policies regarding overtime and deductions.', module: 'Payroll' }
  ],
  '/super-admin/employer/assets': [
    { id: 'asset_policy', label: 'Draft Asset Policy', prompt: 'Draft a company policy for asset allocation and return.', module: 'Assets' }
  ]
};

export default function GlobalAIAssistant() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [aiOutput, setAiOutput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(localStorage.getItem('employee') || localStorage.getItem('admin') || '{}');

  useEffect(() => {
    const path = location.pathname;
    const suggestions = MODULE_SUGGESTIONS[path] || [];
    if (suggestions.length > 0) {
      setCurrentSuggestion(suggestions[0]);
    } else {
      setCurrentSuggestion(null);
    }
  }, [location]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setAiOutput('');

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text }] }]
      });
      const responseText = result.text || "No response received.";
      
      setMessages([...newMessages, { role: 'ai' as const, content: responseText }]);
      setAiOutput(responseText);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages([...newMessages, { role: 'ai' as const, content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setIsExpanded(true);
    setIsOpen(true);
    setInput(suggestion.prompt);
    handleSend(suggestion.prompt);
  };

  const saveToHistory = async () => {
    if (!aiOutput || !currentUser.id) return;
    try {
      await fetch('/api/ai/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          module: currentSuggestion?.module || 'General',
          prompt: messages[messages.length - 2]?.content || '',
          response: aiOutput
        })
      });
      alert('Saved to history!');
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const fetchHistory = async () => {
    if (!currentUser.id) return;
    try {
      const res = await fetch(`/api/ai/history/${currentUser.id}`);
      const data = await res.json();
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Suggestion Bubble */}
      <AnimatePresence>
        {!isOpen && currentSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 bg-white shadow-2xl rounded-2xl p-4 border border-slate-100 max-w-xs cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => handleSuggestionClick(currentSuggestion)}
          >
            <div className="flex items-center gap-2 text-indigo-600 font-medium mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Smart Suggestion</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {currentSuggestion.label}. I can help generate this for you.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Assistant Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
          isOpen ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`absolute bottom-20 right-0 bg-white shadow-2xl rounded-3xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded ? 'w-[500px] h-[700px]' : 'w-[380px] h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 border-bottom border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">ERP AI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
                <button 
                  onClick={fetchHistory}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                  <History className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {showHistory ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-700">Generation History</h4>
                    <button onClick={() => setShowHistory(false)} className="text-indigo-600 text-sm font-medium">Back to Chat</button>
                  </div>
                  {history.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase mb-1">{item.module}</div>
                      <div className="text-xs font-medium text-slate-800 mb-2">{item.prompt}</div>
                      <div className="text-xs text-slate-500 line-clamp-2">{item.response}</div>
                    </div>
                  ))}
                  {history.length === 0 && <div className="text-center text-slate-400 py-10">No history found</div>}
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-2">How can I help you today?</h4>
                      <p className="text-sm text-slate-500 max-w-[240px] mx-auto">
                        I can help you generate documents, answer questions, or automate tasks.
                      </p>
                      
                      {currentSuggestion && (
                        <div className="mt-8 space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested for this page</p>
                          <button
                            onClick={() => handleSuggestionClick(currentSuggestion)}
                            className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-sm text-indigo-600 font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            {currentSuggestion.label}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none'
                      }`}>
                        {msg.role === 'ai' && isEditing && idx === messages.length - 1 ? (
                          <textarea
                            value={aiOutput}
                            onChange={(e) => setAiOutput(e.target.value)}
                            className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
                          />
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        )}
                        
                        {msg.role === 'ai' && idx === messages.length - 1 && !isLoading && (
                          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(aiOutput || msg.content);
                                alert('Copied to clipboard!');
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleSend(messages[idx-1].content)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                              title="Regenerate"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setIsEditing(!isEditing)}
                              className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                              title="Edit"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={saveToHistory}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                              title="Save to History"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                AI can make mistakes. Check important info.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
