import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { 
  Network, Search, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight, 
  Mail, Briefcase, Building2, Download, X, Undo, Redo, Trash2, Type, 
  AlignCenter, AlignLeft, AlignRight, Save, FileUp, Printer, FileText,
  Square, Circle, Diamond, Hexagon, Database, FileCode, ArrowRight, Edit3, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import Select from 'react-select';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { User } from '../../types';

import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

interface EmployeeNode {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  designation: string;
  manager_id: number | null;
  profile_picture: string | null;
  children: EmployeeNode[];
  isBold?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

interface Shape {
  id: string;
  type: string;
  x: number;
  y: number;
  text: string;
  color?: string;
  isBold?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

interface Connection {
  id: string;
  start: string;
  end: string;
}

const DraggableOrgNode = ({ 
  node, 
  level = 0, 
  onSelect, 
  onDelete, 
  onUpdate,
  onConnect,
  isConnecting,
  selectedId
}: { 
  node: EmployeeNode; 
  level?: number; 
  onSelect: (node: EmployeeNode) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<EmployeeNode>) => void;
  onConnect: (id: string) => void;
  isConnecting: boolean;
  selectedId: string | null;
}) => {
  const updateXarrow = useXarrow();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editDesignation, setEditDesignation] = useState(node.designation);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `emp-${node.id}`,
    data: { type: 'employee', node },
    disabled: isEditing || isConnecting
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `emp-${node.id}`,
    data: { type: 'employee', node }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(node.id, { name: editName, designation: editDesignation });
    setIsEditing(false);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    setTimeout(updateXarrow, 0);
  };

  return (
    <div className="flex flex-col items-center" ref={setDroppableRef} id={`emp-${node.id}`}>
      <motion.div 
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => isConnecting ? onConnect(`emp-${node.id}`) : onSelect(node)}
        className={`relative p-4 rounded-2xl border bg-white shadow-sm min-w-[240px] transition-all hover:shadow-md cursor-pointer group ${
          level === 0 ? 'border-blue-200 ring-4 ring-blue-50' : 'border-slate-200'
        } ${isOver ? 'ring-2 ring-blue-500 border-blue-500' : ''} ${selectedId === `emp-${node.id}` ? 'ring-2 ring-blue-600' : ''}`}
      >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"
          >
            <Edit3 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
            {node.profile_picture ? (
              <img src={node.profile_picture} alt={node.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold">
                {node.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-1" onClick={e => e.stopPropagation()}>
                <input 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  className="w-full text-xs font-black uppercase border-b border-blue-200 outline-none"
                  autoFocus
                />
                <input 
                  value={editDesignation} 
                  onChange={e => setEditDesignation(e.target.value)}
                  className="w-full text-[10px] font-bold text-blue-600 uppercase border-b border-blue-200 outline-none"
                />
                <button onClick={handleSave} className="text-[8px] font-black text-blue-600 uppercase flex items-center gap-1">
                  <Check size={8} /> Save
                </button>
              </div>
            ) : (
              <>
                <h4 className={`truncate text-sm uppercase tracking-tight ${node.isBold ? 'font-black' : 'font-bold'} text-${node.textAlign || 'left'}`}>
                  {node.name}
                </h4>
                <p className={`text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate text-${node.textAlign || 'left'}`}>
                  {node.designation}
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-50 space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <Building2 size={10} className="text-slate-400" />
            <span className="truncate">{node.department}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <Mail size={10} className="text-slate-400" />
            <span className="truncate">{node.email}</span>
          </div>
        </div>

        {hasChildren && (
          <button 
            onClick={toggleExpand}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-10"
          >
            {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          </button>
        )}
      </motion.div>

      {hasChildren && isExpanded && (
        <div className="relative pt-8 flex gap-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-200"></div>
          
          {node.children.length > 1 && (
            <div className="absolute top-8 left-[calc(50%/node.children.length)] right-[calc(50%/node.children.length)] h-px bg-slate-200">
              <div 
                className="absolute top-0 h-px bg-slate-200" 
                style={{ 
                  left: `${(100 / node.children.length) / 2}%`, 
                  right: `${(100 / node.children.length) / 2}%` 
                }}
              ></div>
            </div>
          )}

          {node.children.map((child) => (
            <div key={child.id} className="relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-200"></div>
              <DraggableOrgNode 
                node={child} 
                level={level + 1} 
                onSelect={onSelect} 
                onDelete={onDelete}
                onUpdate={onUpdate}
                onConnect={onConnect}
                isConnecting={isConnecting}
                selectedId={selectedId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function OrgChart() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const [hierarchy, setHierarchy] = useState<EmployeeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeNode | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [history, setHistory] = useState<{ hierarchy: EmployeeNode[], shapes: Shape[], connections: Connection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStart, setConnectStart] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateXarrow = useXarrow();

  const [user, setUser] = useState<User | null>(null);
  const companyId = user?.company_id || user?.id;

  useEffect(() => {
    const employeeId = localStorage.getItem('employeeId');
    const companyAdmin = localStorage.getItem('companyAdmin');
    const superAdmin = localStorage.getItem('superAdmin');

    if (employeeId) {
      fetchWithRetry(`/api/employees/${employeeId}`)
        .then(async res => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setUser(data.employee);
          }
        })
        .catch(err => console.error("Error fetching employee:", err));
    } else if (companyAdmin) {
      setUser(JSON.parse(companyAdmin));
    } else if (superAdmin) {
      setUser(JSON.parse(superAdmin));
    }
  }, []);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isConnecting || !connectStart) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      updateXarrow();
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isConnecting, connectStart, updateXarrow]);

  const [allEmployees, setAllEmployees] = useState<EmployeeNode[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAllEmployees = useCallback(() => {
    if (companyId) {
      fetchWithRetry(`/api/employees?company_id=${companyId}`)
        .then(async res => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then(data => {
          setAllEmployees(data);
        })
        .catch(err => console.error("Failed to load employees", err));
    }
  }, [companyId]);

  useEffect(() => {
    fetchAllEmployees();
  }, [fetchAllEmployees]);

  const handleSaveToWord = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#F8FAFC',
        onclone: (clonedDoc) => {
          // Fix for oklab/oklch colors in Tailwind 4 that html2canvas doesn't support
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              color-scheme: light !important;
            }
            /* Force fallback colors for common Tailwind 4 oklch/oklab usages */
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
          
          // Attempt to strip oklab/oklch from inline styles if any
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const bg = htmlEl.style.backgroundColor;
              if (bg && (bg.includes('oklch') || bg.includes('oklab'))) {
                htmlEl.style.backgroundColor = '#ffffff';
              }
              const color = htmlEl.style.color;
              if (color && (color.includes('oklch') || color.includes('oklab'))) {
                htmlEl.style.color = '#000000';
              }
            }
          });
        }
      });
      
      const imageBase64 = canvas.toDataURL('image/png');
      const imageBuffer = new Uint8Array(await (await fetch(imageBase64)).arrayBuffer());
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 600,
                    height: (600 * canvas.height) / canvas.width,
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  type: "png" as any,
                }),
              ],
            }),
          ],
        }],
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "Organization_Chart.docx");
    } catch (err) {
      console.error("Failed to save to Word", err);
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" uploaded successfully.`);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const saveToHistory = useCallback((currentHierarchy: EmployeeNode[], currentShapes: Shape[], currentConnections: Connection[]) => {
    const newState = { hierarchy: JSON.parse(JSON.stringify(currentHierarchy)), shapes: [...currentShapes], connections: [...currentConnections] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndexRef.current + 1);
      return [...newHistory, newState];
    });
    historyIndexRef.current++;
    setHistoryIndex(historyIndexRef.current);
  }, []);

  const undo = () => {
    if (historyIndexRef.current > 0) {
      const prevState = history[historyIndexRef.current - 1];
      setHierarchy(prevState.hierarchy);
      setShapes(prevState.shapes);
      setConnections(prevState.connections);
      historyIndexRef.current--;
      setHistoryIndex(historyIndexRef.current);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < history.length - 1) {
      const nextState = history[historyIndexRef.current + 1];
      setHierarchy(nextState.hierarchy);
      setShapes(nextState.shapes);
      setConnections(nextState.connections);
      historyIndexRef.current++;
      setHistoryIndex(historyIndexRef.current);
    }
  };

  const fetchHierarchy = useCallback(() => {
    if (companyId) {
      fetchWithRetry(`/api/employees/hierarchy/${companyId}`)
        .then(async res => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then(data => {
          // Recursive filter for "Bilal Izhar"
          const filterBilal = (nodes: EmployeeNode[]): EmployeeNode[] => {
            return nodes
              .filter(node => !node.name.toLowerCase().includes('bilal izhar'))
              .map(node => ({
                ...node,
                children: filterBilal(node.children || [])
              }));
          };
          const filteredData = filterBilal(data);
          setHierarchy(filteredData);
          if (historyIndexRef.current === -1) {
            saveToHistory(filteredData, [], []);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load hierarchy", err);
          setLoading(false);
        });
    }
  }, [companyId, saveToHistory]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'employee' && overData?.type === 'employee') {
      const employeeId = active.id.toString().replace('emp-', '');
      const newManagerId = over.id.toString().replace('emp-', '');

      if (employeeId === newManagerId) return;

      // Prevent moving a manager under their own subordinate
      const isSubordinate = (nodes: EmployeeNode[], targetId: number, searchId: number): boolean => {
        for (const node of nodes) {
          if (node.id === searchId) {
            const checkChildren = (children: EmployeeNode[]): boolean => {
              for (const child of children) {
                if (child.id === targetId) return true;
                if (checkChildren(child.children)) return true;
              }
              return false;
            };
            return checkChildren(node.children);
          }
          if (isSubordinate(node.children, targetId, searchId)) return true;
        }
        return false;
      };

      if (isSubordinate(hierarchy, Number(newManagerId), Number(employeeId))) {
        alert("Cannot move a manager under their own subordinate.");
        return;
      }

      try {
        const res = await fetchWithRetry(`/api/employees/${employeeId}/manager`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manager_id: newManagerId })
        });
        if (res.ok) {
          fetchHierarchy();
        }
      } catch (err) {
        console.error("Failed to update manager", err);
      }
    }
    updateXarrow();
  };

  const addShape = (type: string) => {
    if (type === 'connect') {
      setIsConnecting(!isConnecting);
      setConnectStart(null);
      return;
    }
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      text: type.toUpperCase(),
    };
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    saveToHistory(hierarchy, newShapes, connections);
  };

  const handleUpdateEmployee = (id: number, updates: Partial<EmployeeNode>) => {
    const updateNode = (nodes: EmployeeNode[]): EmployeeNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, ...updates };
        if (node.children) return { ...node, children: updateNode(node.children) };
        return node;
      });
    };
    const newHierarchy = updateNode(hierarchy);
    setHierarchy(newHierarchy);
    saveToHistory(newHierarchy, shapes, connections);
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm("Are you sure you want to delete this employee? This will remove them from the system.")) {
      try {
        const res = await fetchWithRetry(`/api/employees/${id}`, { method: 'DELETE' });
        if (res.ok) fetchHierarchy();
      } catch (err) {
        console.error("Failed to delete employee", err);
      }
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    if (selectedId.startsWith('shape-')) {
      const newShapes = shapes.filter(s => s.id !== selectedId);
      setShapes(newShapes);
      setConnections(connections.filter(c => c.start !== selectedId && c.end !== selectedId));
      saveToHistory(hierarchy, newShapes, connections);
      setSelectedId(null);
    } else if (selectedId.startsWith('emp-')) {
      handleDeleteEmployee(Number(selectedId.replace('emp-', '')));
      setSelectedId(null);
    }
  };

  const handleConnect = (id: string) => {
    if (!connectStart) {
      setConnectStart(id);
    } else {
      if (connectStart !== id) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          start: connectStart,
          end: id
        };
        const newConnections = [...connections, newConnection];
        setConnections(newConnections);
        saveToHistory(hierarchy, shapes, newConnections);
      }
      setConnectStart(null);
      setIsConnecting(false);
    }
  };

  const toggleBold = () => {
    if (!selectedId) return;
    if (selectedId.startsWith('shape-')) {
      const newShapes = shapes.map(s => s.id === selectedId ? { ...s, isBold: !s.isBold } : s);
      setShapes(newShapes);
      saveToHistory(hierarchy, newShapes, connections);
    } else if (selectedId.startsWith('emp-')) {
      const id = Number(selectedId.replace('emp-', ''));
      const node = findEmployee(hierarchy, id);
      if (node) handleUpdateEmployee(id, { isBold: !node.isBold });
    }
  };

  const setAlignment = (align: 'left' | 'center' | 'right') => {
    if (!selectedId) return;
    if (selectedId.startsWith('shape-')) {
      const newShapes = shapes.map(s => s.id === selectedId ? { ...s, textAlign: align } : s);
      setShapes(newShapes);
      saveToHistory(hierarchy, newShapes, connections);
    } else if (selectedId.startsWith('emp-')) {
      handleUpdateEmployee(Number(selectedId.replace('emp-', '')), { textAlign: align });
    }
  };

  const findEmployee = (nodes: EmployeeNode[], id: number): EmployeeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findEmployee(node.children, id);
      if (found) return found;
    }
    return null;
  };

  const employeeOptions = useMemo(() => {
    return allEmployees.map(emp => ({
      value: emp.id,
      label: emp.name,
      node: {
        ...emp,
        children: [] // Ensure it matches EmployeeNode type
      } as EmployeeNode
    }));
  }, [allEmployees]);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
    setTimeout(updateXarrow, 200);
  };

  const resetZoom = () => {
    setZoom(1);
    setTimeout(updateXarrow, 200);
  };

  const handleExport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Network size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase text-slate-900">Organization Chart</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Visualize and Manage Company Hierarchy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">Select Employee:</span>
              <Select 
                options={employeeOptions}
                onChange={(opt) => opt && setSelectedEmployee(opt.node)}
                className="min-w-[200px] text-[10px] font-bold"
                placeholder="CHOOSE..."
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    borderColor: '#E2E8F0',
                    backgroundColor: '#F8FAFC',
                    minHeight: '36px'
                  })
                }}
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH EMPLOYEE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 transition-all"
              />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => handleZoom(-0.1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-600"><ZoomOut size={14} /></button>
              <button onClick={resetZoom} className="px-2 text-[9px] font-black text-slate-500 hover:text-slate-900 transition-all">{Math.round(zoom * 100)}%</button>
              <button onClick={() => handleZoom(0.1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-600"><ZoomIn size={14} /></button>
            </div>
            
            <button onClick={handleExport} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
              <Download size={14} />
              <span className="text-[9px] font-black uppercase">Export</span>
            </button>
            
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-2 bg-white border-b border-slate-100 flex items-center gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 pr-4 border-r border-slate-100">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30"><Undo size={16} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30"><Redo size={16} /></button>
        </div>
        
        <div className="flex items-center gap-1 pr-4 border-r border-slate-100">
          <button onClick={handleDeleteSelected} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
        </div>

        <div className="flex items-center gap-1 pr-4 border-r border-slate-100">
          <button onClick={toggleBold} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 font-bold text-sm">B</button>
          <button onClick={() => setAlignment('left')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"><AlignLeft size={16} /></button>
          <button onClick={() => setAlignment('center')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"><AlignCenter size={16} /></button>
          <button onClick={() => setAlignment('right')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"><AlignRight size={16} /></button>
        </div>

        <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 outline-none">
            <option>12px</option>
            <option>14px</option>
            <option>16px</option>
            <option>18px</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-600 transition-all flex items-center gap-2">
            <FileText size={12} />
            Templates
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={handleLoadClick}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-600 transition-all flex items-center gap-2"
          >
            <FileUp size={12} />
            Load
          </button>
          <button 
            onClick={handleSaveToWord}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 shadow-sm"
          >
            <Save size={12} />
            Save
          </button>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"><Printer size={16} /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbox */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toolbox</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">Basic Shapes</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => addShape('text')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <Type size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Text</span>
                </button>
                <button onClick={() => addShape('connect')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Connect</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">Flowchart</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => addShape('process')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <Square size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Process</span>
                </button>
                <button onClick={() => addShape('decision')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <Diamond size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Decision</span>
                </button>
                <button onClick={() => addShape('start')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <Circle size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Start/End</span>
                </button>
                <button onClick={() => addShape('io')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <Hexagon size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Input/Output</span>
                </button>
                <button onClick={() => addShape('database')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <Database size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Database</span>
                </button>
                <button onClick={() => addShape('document')} className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <FileCode size={20} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Document</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-[8px] font-bold text-blue-600 uppercase mb-1">How to use</p>
                <ul className="text-[8px] text-blue-500 space-y-1 list-disc pl-3">
                  <li>Select & Drag shapes to canvas</li>
                  <li>Drag handles to connect nodes</li>
                  <li>Click text to edit content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 overflow-auto p-12 relative bg-slate-50/50 pattern-dots" ref={containerRef}>
          <Xwrapper>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragMove={() => updateXarrow()}>
              <div 
                className="min-w-max min-h-max flex justify-center origin-top transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="flex flex-col items-center gap-12">
                  {hierarchy.length > 0 && (
                    hierarchy.map(root => (
                      <DraggableOrgNode 
                        key={root.id} 
                        node={root} 
                        onSelect={setSelectedEmployee} 
                        onDelete={handleDeleteEmployee}
                        onUpdate={handleUpdateEmployee}
                        onConnect={handleConnect}
                        isConnecting={isConnecting}
                        selectedId={selectedId}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Render Shapes */}
              {shapes.map(shape => (
                <motion.div
                  key={shape.id}
                  id={shape.id}
                  drag
                  dragMomentum={false}
                  onDrag={() => updateXarrow()}
                  initial={{ x: shape.x, y: shape.y }}
                  onClick={() => isConnecting ? handleConnect(shape.id) : setSelectedId(shape.id)}
                  className={`absolute cursor-move p-4 bg-white border-2 shadow-sm rounded-lg flex items-center justify-center min-w-[100px] ${selectedId === shape.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'}`}
                  style={{ zIndex: 10 }}
                >
                  <input 
                    value={shape.text}
                    onChange={(e) => {
                      const newShapes = shapes.map(s => s.id === shape.id ? { ...s, text: e.target.value } : s);
                      setShapes(newShapes);
                    }}
                    onBlur={() => saveToHistory(hierarchy, shapes, connections)}
                    className={`bg-transparent outline-none text-[10px] uppercase text-slate-600 text-${shape.textAlign || 'center'} ${shape.isBold ? 'font-black' : 'font-bold'}`}
                  />
                </motion.div>
              ))}

              {/* Render Connections */}
              {connections.map(conn => (
                <Xarrow
                  key={conn.id}
                  start={conn.start}
                  end={conn.end}
                  color="#94a3b8"
                  strokeWidth={2}
                  headSize={4}
                  path="grid"
                  startAnchor="bottom"
                  endAnchor="top"
                  gridBreak="50%"
                />
              ))}

              {/* Live Connection Preview */}
              {isConnecting && connectStart && (
                <>
                  <div 
                    id="mouse-pointer" 
                    style={{ 
                      position: 'fixed', 
                      left: mousePos.x, 
                      top: mousePos.y, 
                      width: 1, 
                      height: 1, 
                      pointerEvents: 'none',
                      zIndex: 9999 
                    }} 
                  />
                  <Xarrow
                    start={connectStart}
                    end="mouse-pointer"
                    color="#3b82f6"
                    strokeWidth={2}
                    dashness={{ animation: true }}
                    headSize={4}
                    path="smooth"
                  />
                </>
              )}
            </DndContext>
          </Xwrapper>
          
          {isConnecting && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl z-[200] flex items-center gap-3 animate-bounce">
              <ArrowRight size={18} />
              <span className="text-xs font-black uppercase tracking-widest">
                {connectStart ? 'Select target node to connect' : 'Select source node to connect'}
              </span>
              <button onClick={() => setIsConnecting(false)} className="ml-2 p-1 hover:bg-white/20 rounded-full">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="relative h-32 bg-blue-600">
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden">
                    {selectedEmployee.profile_picture ? (
                      <img src={selectedEmployee.profile_picture} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-2xl font-black">
                        {selectedEmployee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-16 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedEmployee.name}</h2>
                  <p className="text-blue-600 font-bold uppercase tracking-wider text-sm">{selectedEmployee.designation}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Department</p>
                        <p className="text-sm font-bold">{selectedEmployee.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-bold truncate max-w-[160px]">{selectedEmployee.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Employee ID</p>
                        <p className="text-sm font-bold">{selectedEmployee.employee_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3">
                  <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    View Profile
                  </button>
                  <button className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">
                    Message
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
