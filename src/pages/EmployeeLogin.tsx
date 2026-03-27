import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, User, Lock, ArrowLeft } from 'lucide-react';

export default function EmployeeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const employeeData = localStorage.getItem('employee');
    if (employeeData) {
      navigate('/employee/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e?: React.FormEvent, retryCount = 0) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        if (text.includes("Rate exceeded") && retryCount < 3) {
          console.warn(`Rate exceeded, retrying in ${1000 * (retryCount + 1)}ms...`);
          setTimeout(() => handleLogin(undefined, retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        throw new Error(text || res.statusText);
      }

      if (res.ok && data.success) {
        // Store employee info in localStorage or context
        localStorage.setItem('employee', JSON.stringify(data.employee));
        navigate('/employee/dashboard');
      } else {
        alert(data.message || "Invalid credentials");
        setLoading(false);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Login error:", err);
      if (err.message.includes("Rate exceeded")) {
        alert("Too many login attempts. Please wait a moment and try again.");
      } else {
        alert(err.message || "Error logging in");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        BACK TO HOME
      </Link>
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">EMPLOYEE PORTAL</h1>
          <p className="text-slate-500 text-sm font-medium">Sign in to your employee account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-12 py-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}
