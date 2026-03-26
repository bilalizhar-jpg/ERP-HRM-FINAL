import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, Clock, Coffee, LogOut, CheckCircle, Activity, ShieldCheck, ChevronRight, User, X, Keyboard, MousePointer2, Pause, Square } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeTracking } from '../contexts/TimeTrackingContext';

interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  check_in_time: string;
  check_out_time: string;
  working_hours: number;
  created_at?: string;
  check_in_lat?: number;
  check_in_long?: number;
}

export default function EmployeeAttendance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ dailyHours: 0, weeklyHours: 0, monthlyHours: 0 });
  const [status, setStatus] = useState('Checked-Out');
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const employee = JSON.parse(localStorage.getItem('employee') || '{}');
  
  const { isTracking, isPaused, startTracking, pauseTracking, resumeTracking, stopTracking, hasConsent, activeTime, idleTime, keystrokes, mouseClicks, settings } = useTimeTracking();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    if (!employee.id) {
      navigate('/employee/login');
    }
  }, [employee.id, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/employee/attendance/stats?employee_id=${employee.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAttendance(data?.dailyAttendance || []);
      setStats({
        dailyHours: data.dailyHours || 0,
        weeklyHours: data.weeklyHours || 0,
        monthlyHours: data.monthlyHours || 0
      });
      if (data?.dailyAttendance && data.dailyAttendance.length > 0) {
        setStatus(data.dailyAttendance[0].status);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [employee.id]);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Initial location error", err)
    );

    return () => clearInterval(timer);
  }, [fetchStats]);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access error", err);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setSelfie(canvas.toDataURL('image/jpeg'));
      setShowCamera(false);
      stopCamera();
    }
  };

  const handleAction = async (action: string) => {
    if (!employee.id || !employee.company_id) {
      alert("Employee session invalid. Please log in again.");
      navigate('/employee/login');
      return;
    }
    setLoading(true);
    console.log(`[Attendance] Initiating ${action} for employee ${employee.id} in company ${employee.company_id}...`);
    
    // Get fresh location for each action
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`[Attendance] Location captured: ${latitude}, ${longitude}`);
      setLocation({ lat: latitude, lng: longitude });
      
      try {
        const res = await fetch('/api/employee/attendance/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: employee.id,
            company_id: employee.company_id,
            action,
            lat: latitude,
            long: longitude,
            selfie_url: selfie,
          })
        });
        
        const data = await res.json();
        if (res.ok) {
          console.log(`[Attendance] ${action} successful`);
          setSelfie(null);
          await fetchStats();
          
          // Time Tracking Integration
          if (hasConsent) {
            if (action === 'check-in') {
              startTracking();
            } else if (action === 'break-start') {
              pauseTracking();
            } else if (action === 'break-end') {
              resumeTracking();
            } else if (action === 'check-out') {
              stopTracking();
            }
          }
        } else {
          console.error(`[Attendance] ${action} failed:`, data.error);
          alert(data.error || `Failed to ${action}`);
        }
      } catch (error) {
        console.error(`[Attendance] Error during ${action}:`, error);
        alert(`An error occurred during ${action}. Please try again.`);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("[Attendance] Geolocation error:", error);
      alert("Geolocation is required for attendance actions. Please enable location access.");
      setLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans p-4 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 overflow-hidden shadow-inner">
            {employee.profile_picture ? (
              <img src={employee.profile_picture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-blue-600" size={32} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-slate-900">{employee.name || 'Employee Name'}</h1>
            <div className="flex items-center gap-3 text-sm font-bold">
              <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-slate-600">ID: {employee.employee_id || 'N/A'}</span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1">
          <button className="px-5 py-2.5 bg-white shadow-sm rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-900">
            <Activity size={14} /> Terminal
          </button>
          <button className="px-5 py-2.5 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-white/50 rounded-xl transition-all">Daily</button>
          <button className="px-5 py-2.5 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-white/50 rounded-xl transition-all">Weekly</button>
          <button className="px-5 py-2.5 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-white/50 rounded-xl transition-all">Monthly</button>
        </div>
      </header>

      {/* Time Tracking Bar */}
      {settings?.is_enabled && hasConsent && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Time Tracking</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monitor Employee Activity and Productivity</p>
            </div>
            <div className="flex gap-2">
              <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${
                isTracking && !isPaused ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                isPaused ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                {isTracking && !isPaused ? <Activity size={14} className="animate-pulse" /> : 
                 isPaused ? <Pause size={14} /> : <Square size={14} />}
                {isTracking && !isPaused ? 'Tracking Active' : isPaused ? 'Tracking Paused' : 'Tracking Stopped'}
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center gap-2">
                {employee.name} ({employee.employee_id})
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center gap-2">
                {format(currentTime, 'MM/dd/yyyy')}
                <Clock size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Time</p>
              <p className="text-2xl font-black text-slate-900">{formatTime(activeTime)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <Coffee size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Idle Time</p>
              <p className="text-2xl font-black text-slate-900">{formatTime(idleTime)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <Keyboard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keystrokes</p>
              <p className="text-2xl font-black text-slate-900">{keystrokes}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
              <MousePointer2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mouse Clicks</p>
              <p className="text-2xl font-black text-slate-900">{mouseClicks}</p>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Daily Hours</p>
              <p className="text-4xl font-black text-slate-900">{Number(stats.dailyHours).toFixed(1)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Weekly Hours</p>
              <p className="text-4xl font-black text-slate-900">{Number(stats.weeklyHours).toFixed(1)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Monthly Hours</p>
              <p className="text-4xl font-black text-slate-900">{Number(stats.monthlyHours).toFixed(1)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Status</p>
              <p className={`text-4xl font-black uppercase ${status === 'Checked-Out' ? 'text-slate-400' : 'text-emerald-600'}`}>
                {status === 'Checked-Out' ? 'Offline' : 'Online'}
              </p>
            </div>
          </div>

          {/* Clock Section */}
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-10 left-10">
              <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                Temporal Sync Active
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10">
              <div className="flex items-baseline gap-4">
                <span className="text-[12rem] font-black leading-none tracking-tighter text-slate-900 drop-shadow-sm">
                  {format(currentTime, 'HH:mm')}
                </span>
                <span className="text-5xl font-black text-slate-300 mb-6">
                  :{format(currentTime, 'ss')}
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-400 uppercase tracking-[0.4em] mt-6">
                {format(currentTime, 'EEEE dd MMMM')}
              </p>
            </div>

            <div className="absolute top-1/2 right-16 -translate-y-1/2 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none">
              <Activity size={400} />
            </div>
          </div>

          {/* Geo & Visual ID Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-wider text-base text-slate-900">Geo-Sync</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satellite Verification</p>
                  </div>
                </div>
                <Activity className="text-emerald-200" size={24} />
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl flex justify-between items-center mb-6 border border-slate-100">
                <div className="text-center flex-1 border-r border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5">Latitude</p>
                  <p className="font-mono text-emerald-600 font-black text-lg">{location.lat?.toFixed(6) || '---'}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5">Longitude</p>
                  <p className="font-mono text-emerald-600 font-black text-lg">{location.lng?.toFixed(6) || '---'}</p>
                </div>
              </div>

              {location.lat && location.lng && (
                <a 
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline mb-4"
                >
                  <Activity size={12} />
                  Verify on Satellite Map
                </a>
              )}

              <div className="flex items-center gap-2.5 text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                <ShieldCheck size={16} />
                Secure Connection Established
              </div>
            </div>

            <button 
              onClick={startCamera}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-lg transition-all group text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all border border-blue-100">
                  <Camera size={28} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-wider text-base text-slate-900">Visual ID</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biometric Optional</p>
                </div>
              </div>
              {selfie ? (
                <div className="w-full h-32 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-inner">
                  <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Camera size={40} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tap to capture</span>
                </div>
              )}
            </button>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleAction('check-in')}
              disabled={loading || status !== 'Checked-Out'}
              className={`p-10 rounded-[2.5rem] border-2 flex items-center justify-between group transition-all shadow-sm hover:shadow-md ${
                status === 'Checked-Out' 
                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${status === 'Checked-Out' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 group-hover:scale-110' : 'bg-slate-200 text-slate-400'}`}>
                  <CheckCircle size={32} />
                </div>
                <div className="text-left">
                  <h3 className={`font-black uppercase tracking-widest text-lg ${status === 'Checked-Out' ? 'text-emerald-900' : 'text-slate-400'}`}>Check In</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Check In</p>
                </div>
              </div>
              <ChevronRight className={`transition-transform group-hover:translate-x-2 ${status === 'Checked-Out' ? 'text-emerald-400' : 'text-slate-300'}`} size={28} />
            </button>

            <button
              onClick={() => handleAction('break-start')}
              disabled={loading || status !== 'Present'}
              className={`p-10 rounded-[2.5rem] border-2 flex items-center justify-between group transition-all shadow-sm hover:shadow-md ${
                status === 'Present' 
                ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' 
                : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${status === 'Present' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 group-hover:scale-110' : 'bg-slate-200 text-slate-400'}`}>
                  <Coffee size={32} />
                </div>
                <div className="text-left">
                  <h3 className={`font-black uppercase tracking-widest text-lg ${status === 'Present' ? 'text-amber-900' : 'text-slate-400'}`}>Start Break</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Break Start</p>
                </div>
              </div>
              <ChevronRight className={`transition-transform group-hover:translate-x-2 ${status === 'Present' ? 'text-amber-400' : 'text-slate-300'}`} size={28} />
            </button>

            <button
              onClick={() => handleAction('break-end')}
              disabled={loading || status !== 'On Break'}
              className={`p-10 rounded-[2.5rem] border-2 flex items-center justify-between group transition-all shadow-sm hover:shadow-md ${
                status === 'On Break' 
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${status === 'On Break' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 group-hover:scale-110' : 'bg-slate-200 text-slate-400'}`}>
                  <Clock size={32} />
                </div>
                <div className="text-left">
                  <h3 className={`font-black uppercase tracking-widest text-lg ${status === 'On Break' ? 'text-blue-900' : 'text-slate-400'}`}>End Break</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Break End</p>
                </div>
              </div>
              <ChevronRight className={`transition-transform group-hover:translate-x-2 ${status === 'On Break' ? 'text-blue-400' : 'text-slate-300'}`} size={28} />
            </button>

            <button
              onClick={() => handleAction('check-out')}
              disabled={loading || status === 'Checked-Out'}
              className={`p-10 rounded-[2.5rem] border-2 flex items-center justify-between group transition-all shadow-sm hover:shadow-md ${
                status !== 'Checked-Out' 
                ? 'bg-rose-50 border-rose-200 hover:bg-rose-100' 
                : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${status !== 'Checked-Out' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 group-hover:scale-110' : 'bg-slate-200 text-slate-400'}`}>
                  <LogOut size={32} />
                </div>
                <div className="text-left">
                  <h3 className={`font-black uppercase tracking-widest text-lg ${status !== 'Checked-Out' ? 'text-rose-900' : 'text-slate-400'}`}>Check Out</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Check Out</p>
                </div>
              </div>
              <ChevronRight className={`transition-transform group-hover:translate-x-2 ${status !== 'Checked-Out' ? 'text-rose-400' : 'text-slate-300'}`} size={28} />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Activity Stream */}
        <div className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm h-full sticky top-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="font-black uppercase tracking-widest text-xl text-slate-900">Activity Stream</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Log</p>
              </div>
              <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
                {attendance.length} Events
              </span>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50">
              {attendance.map((event, idx) => (
                <div key={idx} className="relative pl-16 group">
                  <div className={`absolute left-0 top-0 w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                    event.status === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' :
                    event.status === 'Checked-Out' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' :
                    'bg-amber-500 text-white shadow-lg shadow-amber-100'
                  }`}>
                    <Clock size={24} />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black uppercase text-sm tracking-widest text-slate-900">
                      {event.status === 'Present' ? 'Checked In' : event.status === 'Checked-Out' ? 'Checked Out' : event.status}
                    </h4>
                    <span className="text-[11px] font-black text-slate-400">
                      {event.check_in_time || event.created_at ? format(new Date(event.check_in_time || event.created_at!), 'HH:mm') : '--:--'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 text-[11px] font-mono text-slate-500 border border-slate-100">
                    <MapPin size={14} className="text-slate-300" />
                    {event.check_in_lat || '0.0000'}, {event.check_in_long || '0.0000'}
                  </div>
                </div>
              ))}
              {attendance.length === 0 && (
                <div className="text-center py-20">
                  <Activity className="mx-auto text-slate-100 mb-6" size={80} />
                  <p className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">No activity logged today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-200"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black uppercase tracking-widest text-lg text-slate-900">Visual Verification</h3>
                <button onClick={() => { setShowCamera(false); stopCamera(); }} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>
              
              <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden mb-8 relative shadow-inner border border-slate-200">
                <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[16px] border-white/10 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-dashed border-white/40 rounded-full"></div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={captureSelfie} 
                  className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-blue-200 active:scale-95"
                >
                  Capture ID
                </button>
                <button 
                  onClick={() => { setShowCamera(false); stopCamera(); }} 
                  className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
