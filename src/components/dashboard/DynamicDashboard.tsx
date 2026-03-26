import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboardStore } from '../../store/dashboardStore';
import { StatWidget } from './widgets/StatWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { TableWidget } from './widgets/TableWidget';
import { Settings, Filter, Calendar, Users, Building } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  type: 'stat' | 'chart' | 'table';
  title: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  // Stat specific
  value?: string | number;
  trend?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  // Chart specific
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  data?: Record<string, unknown>[];
  dataKeys?: string[];
  colors?: string[];
  // Table specific
  columns?: { key: string; label: string; render?: (val: unknown) => React.ReactNode }[];
}

interface DynamicDashboardProps {
  moduleName: string;
  title: string;
  widgets: WidgetConfig[];
  onFilterChange?: (filters: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({
  moduleName,
  title,
  widgets: initialWidgets,
  isLoading = false,
}) => {
  const { layouts, setLayout, setActiveModule } = useDashboardStore();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initialWidgets);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setActiveModule(moduleName);
  }, [moduleName, setActiveModule]);

  // Apply saved layout or use default
  useEffect(() => {
    const savedLayout = layouts[moduleName];
    if (savedLayout && savedLayout.length > 0) {
      // Sort widgets based on saved layout IDs
      const sortedWidgets = [...initialWidgets].sort((a, b) => {
        const indexA = savedLayout.indexOf(a.id);
        const indexB = savedLayout.indexOf(b.id);
        // If an ID is not in the layout, put it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setWidgets(sortedWidgets);
    } else {
      setWidgets(initialWidgets);
    }
  }, [moduleName, initialWidgets, layouts]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save new layout
        setLayout(moduleName, newItems.map(item => item.id));
        
        return newItems;
      });
    }
  };

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'stat':
        return (
          <StatWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            value={widget.value || 0}
            trend={widget.trend}
            icon={widget.icon}
            size={widget.size}
          />
        );
      case 'chart':
        return (
          <ChartWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            type={widget.chartType || 'line'}
            data={widget.data || []}
            dataKeys={widget.dataKeys || []}
            colors={widget.colors}
            size={widget.size}
          />
        );
      case 'table':
        return (
          <TableWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            columns={widget.columns || []}
            data={widget.data || []}
            size={widget.size}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="flex items-center px-3 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Custom Range</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Sales</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>All Employees</option>
                <option>Active Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 h-32 animate-pulse" />
          ))}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-80 col-span-1 md:col-span-2 animate-pulse" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-80 col-span-1 md:col-span-2 animate-pulse" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SortableContext
              items={widgets.map(w => w.id)}
              strategy={rectSortingStrategy}
            >
              {widgets.map((widget) => renderWidget(widget))}
            </SortableContext>
          </div>
        </DndContext>
      )}
    </div>
  );
};
