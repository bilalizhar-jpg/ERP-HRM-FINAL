
interface ModulePlaceholderProps {
  title: string;
  description: string;
}

export default function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">
        {title} Module Managed by Employer
      </h2>
      <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
        {description} This module is for employer-specific data. All data entry and management are performed directly by employers in their respective portals.
      </p>
    </div>
  );
}
