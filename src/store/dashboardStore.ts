import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 'stat' | 'chart' | 'table';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  dataKey: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  columns?: { key: string; label: string }[];
}

export interface DashboardFilters {
  dateRange: { start: Date | null; end: Date | null };
  departmentId: string | null;
  employeeId: string | null;
}

interface DashboardState {
  activeModule: string;
  filters: DashboardFilters;
  layouts: Record<string, string[]>; // moduleName -> array of widget IDs
  setActiveModule: (module: string) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setLayout: (module: string, layout: string[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeModule: 'main',
      filters: {
        dateRange: { start: null, end: null },
        departmentId: null,
        employeeId: null,
      },
      layouts: {},
      setActiveModule: (module) => set({ activeModule: module }),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      setLayout: (module, layout) =>
        set((state) => ({ layouts: { ...state.layouts, [module]: layout } })),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({ layouts: state.layouts }), // Only persist layouts
    }
  )
);
