import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

interface Widget {
  widget_id: string;
  is_enabled: boolean;
  position: number;
}

const WIDGET_COMPONENTS: Record<string, React.FC> = {
  attendance_chart: () => <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">Attendance Chart Widget</div>,
  project_progress: () => <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">Project Progress Widget</div>,
  absentee_list: () => <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">Absentee List Widget</div>,
};

export default function CompanyAdminDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const company_id = 1; // Placeholder

  useEffect(() => {
    fetch(`/api/dashboard-widgets?company_id=${company_id}`)
      .then(res => res.json())
      .then(data => setWidgets(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">DASHBOARD</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200">
          <Settings size={16} /> Configure Widgets
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.filter(w => w.is_enabled).map(widget => {
          const WidgetComponent = WIDGET_COMPONENTS[widget.widget_id];
          return WidgetComponent ? <WidgetComponent key={widget.widget_id} /> : null;
        })}
      </div>
    </div>
  );
}
