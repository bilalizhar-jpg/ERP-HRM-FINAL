import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { fetchWithRetry } from '../utils/fetchWithRetry';

export default function GuestJoin() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [invite, setInvite] = useState<{ chat_id: number } | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetchWithRetry(`/api/messages/verify-guest/${token}`);
        const data = await res.json();
        if (data.success) {
          setInvite(data.invite);
        } else {
          setError(data.error || "Invalid or expired invite link");
        }
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to verify invite link");
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleJoin = () => {
    if (!guestName.trim()) return;
    
    const guestData = {
      id: `guest_${Math.random().toString(36).substring(2, 9)}`,
      name: guestName,
      isGuest: true,
      chat_id: invite?.chat_id
    };
    
    localStorage.setItem('guest', JSON.stringify(guestData));
    navigate('/message');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Access Denied</h1>
          <p className="text-slate-500 font-medium mb-8">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-900 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Guest Access</h1>
          <p className="text-slate-500 text-sm font-medium">Join the conversation as a guest</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-800 font-medium">
              You've been invited to join a chat. Please enter your name to continue.
            </p>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Your Name" 
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-6 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          <button 
            onClick={handleJoin}
            disabled={!guestName.trim()}
            className="w-full py-4 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
          >
            JOIN CHAT
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
