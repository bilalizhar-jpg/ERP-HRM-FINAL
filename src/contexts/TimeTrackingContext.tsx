import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import html2canvas from 'html2canvas';

interface TimeTrackingSettings {
  is_enabled: boolean;
  screenshot_enabled: boolean;
  screenshot_interval: number; // in minutes
  idle_threshold: number; // in minutes
}

interface TimeTrackingContextType {
  isTracking: boolean;
  isPaused: boolean;
  activeTime: number; // in seconds
  idleTime: number; // in seconds
  keystrokes: number;
  mouseClicks: number;
  startTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  stopTracking: () => void;
  settings: TimeTrackingSettings | null;
  hasConsent: boolean;
  setHasConsent: (consent: boolean) => void;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider = ({ children }: { children: ReactNode }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [settings, setSettings] = useState<TimeTrackingSettings | null>(null);
  
  const [activeTime, setActiveTime] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [mouseClicks, setMouseClicks] = useState(0);

  // Refs for mutable state inside intervals
  const trackingState = useRef({
    isTracking: false,
    isPaused: false,
    lastActivityTime: Date.now(),
    keystrokes: 0,
    mouseClicks: 0,
    activeMinutesToSync: 0,
    idleMinutesToSync: 0,
  });

  const userStr = localStorage.getItem('employee');
  const user = userStr ? JSON.parse(userStr) : null;

  // Fetch settings, initial stats, and current attendance status on mount
  useEffect(() => {
    if (user?.id && user?.company_id) {
      // Fetch settings
      fetch(`/api/time-tracking/settings/${user.company_id}/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setSettings(data);
        })
        .catch(err => console.error("Failed to load time tracking settings", err));

      // Fetch today's stats
      const today = new Date().toISOString().split('T')[0];
      fetch(`/api/time-tracking/logs/${user.company_id}/${user.id}?date=${today}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            let totalActive = 0;
            let totalIdle = 0;
            let totalKeys = 0;
            let totalClicks = 0;
            
            data.forEach((log: { active_minutes?: number; idle_minutes?: number; keystrokes?: number; mouse_clicks?: number }) => {
              totalActive += (log.active_minutes || 0) * 60;
              totalIdle += (log.idle_minutes || 0) * 60;
              totalKeys += (log.keystrokes || 0);
              totalClicks += (log.mouse_clicks || 0);
            });
            
            setActiveTime(totalActive);
            setIdleTime(totalIdle);
            setKeystrokes(totalKeys);
            setMouseClicks(totalClicks);
          }
        })
        .catch(err => console.error("Failed to load today's time tracking stats", err));

      // Fetch current attendance status to determine initial tracking state
      fetch(`/api/employee/attendance/stats?employee_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data?.dailyAttendance && data.dailyAttendance.length > 0) {
            const currentStatus = data.dailyAttendance[0].status;
            if (currentStatus === 'Present') {
              setIsTracking(true);
              setIsPaused(false);
              trackingState.current.isTracking = true;
              trackingState.current.isPaused = false;
            } else if (currentStatus === 'On Break') {
              setIsTracking(true);
              setIsPaused(true);
              trackingState.current.isTracking = true;
              trackingState.current.isPaused = true;
            }
          }
        })
        .catch(err => console.error("Failed to load initial attendance status", err));
    }
  }, [user?.id, user?.company_id]);

  // Activity listeners
  useEffect(() => {
    const handleActivity = (e: Event) => {
      if (!trackingState.current.isTracking || trackingState.current.isPaused) return;
      
      trackingState.current.lastActivityTime = Date.now();
      
      if (e.type === 'keydown') {
        trackingState.current.keystrokes += 1;
        setKeystrokes(prev => prev + 1);
      } else if (e.type === 'mousedown') {
        trackingState.current.mouseClicks += 1;
        setMouseClicks(prev => prev + 1);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  // Main tracking loop (runs every second)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const idleThresholdMs = (settings?.idle_threshold || 5) * 60 * 1000;
        const isIdle = (now - trackingState.current.lastActivityTime) > idleThresholdMs;

        if (isIdle) {
          setIdleTime(prev => prev + 1);
          // Add 1/60th of a minute to sync queue
          trackingState.current.idleMinutesToSync += (1 / 60);
        } else {
          setActiveTime(prev => prev + 1);
          // Add 1/60th of a minute to sync queue
          trackingState.current.activeMinutesToSync += (1 / 60);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking, isPaused, settings?.idle_threshold]);

  // Sync data to server (runs every minute)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const state = trackingState.current;
      if (!state.isTracking || !user) return;

      if (state.activeMinutesToSync > 0 || state.idleMinutesToSync > 0) {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const hour = now.getHours();

        fetch('/api/time-tracking/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: user.company_id,
            employee_id: user.id,
            date,
            hour,
            active_minutes: state.activeMinutesToSync,
            idle_minutes: state.idleMinutesToSync,
            keystrokes: state.keystrokes,
            mouse_clicks: state.mouseClicks
          })
        }).then(() => {
          // Reset counters after successful sync
          state.activeMinutesToSync = 0;
          state.idleMinutesToSync = 0;
          state.keystrokes = 0;
          state.mouseClicks = 0;
          // We don't reset the state variables here because they represent the session total
          // unless the user wants them to reset every minute, which is unlikely for a dashboard.
          // Actually, the sync resets the server-side counters. 
          // The UI should probably show the daily total.
        }).catch(err => console.error("Failed to sync time tracking data", err));
      }
    }, 60000); // Sync every minute

    return () => clearInterval(syncInterval);
  }, [user]);

  // Screenshot capture loop
  useEffect(() => {
    if (!settings?.screenshot_enabled || !user) return;

    const intervalMs = (settings.screenshot_interval || 10) * 60 * 1000;
    
    const screenshotInterval = setInterval(async () => {
      if (!trackingState.current.isTracking || trackingState.current.isPaused) return;

      try {
        // Capture the document body
        const canvas = await html2canvas(document.body, {
          ignoreElements: (element) => {
            // Ignore elements with sensitive data classes
            return element.classList.contains('sensitive-data');
          },
          onclone: (clonedDoc) => {
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              * {
                color-scheme: light !important;
              }
              :root {
                --color-blue-600: #2563eb !important;
                --color-blue-50: #eff6ff !important;
                --color-slate-900: #0f172a !important;
                --color-slate-400: #94a3b8 !important;
                --color-slate-200: #e2e8f0 !important;
                --color-slate-100: #f1f5f9 !important;
                --color-slate-50: #f8fafc !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        });
        
        const imageData = canvas.toDataURL('image/jpeg', 0.5); // Compress to 50% quality

        await fetch('/api/time-tracking/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: user.company_id,
            employee_id: user.id,
            image_data: imageData
          })
        });
      } catch (err) {
        console.error("Failed to capture screenshot", err);
      }
    }, intervalMs);

    return () => clearInterval(screenshotInterval);
  }, [settings?.screenshot_enabled, settings?.screenshot_interval, user]);

  const startTracking = () => {
    if (!settings?.is_enabled) return;
    setIsTracking(true);
    setIsPaused(false);
    trackingState.current.isTracking = true;
    trackingState.current.isPaused = false;
    trackingState.current.lastActivityTime = Date.now();
  };

  const pauseTracking = () => {
    setIsPaused(true);
    trackingState.current.isPaused = true;
  };

  const resumeTracking = () => {
    setIsPaused(false);
    trackingState.current.isPaused = false;
    trackingState.current.lastActivityTime = Date.now();
  };

  const stopTracking = () => {
    setIsTracking(false);
    setIsPaused(false);
    trackingState.current.isTracking = false;
    trackingState.current.isPaused = false;
    // Optionally trigger a final sync here
  };

  return (
    <TimeTrackingContext.Provider value={{
      isTracking,
      isPaused,
      activeTime,
      idleTime,
      keystrokes,
      mouseClicks,
      startTracking,
      pauseTracking,
      resumeTracking,
      stopTracking,
      settings,
      hasConsent,
      setHasConsent
    }}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};
