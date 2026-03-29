import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Calendar, User, Briefcase, Building2, Clock, FileText, MoreHorizontal, MessageSquare, Paperclip, Filter, Layout, List as ListIcon, Calendar as CalendarIcon, X, CheckSquare, Eye, Download, Trash2, Edit2, Archive, ChevronDown, Send } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id?: number;
  company_name: string;
  project_name: string;
  contact_person: string;
  project_type: string;
  duration: string;
  assigned_to: string;
  start_date: string;
  end_date: string;
  timeline_milestones: string;
}

interface TaskActivity {
  id: number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

interface Label {
  id: number;
  name: string;
  color: string;
}

interface Employee {
  id: number;
  name: string;
  profile_picture?: string;
  designation?: string;
  department?: string;
}

interface TaskChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskAttachment {
  id: number;
  name: string;
  url: string;
  type: string;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  labels?: string[];
  assignees?: string[];
  image_url?: string;
  project_id?: number;
  checklist?: TaskChecklistItem[];
  attachments?: TaskAttachment[];
}

const COLUMNS = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'To Do', title: 'To Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Review', title: 'Review' },
  { id: 'Testing', title: 'Testing' },
  { id: 'Done', title: 'Done' },
];

function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
    >
      {task.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden aspect-video">
          <img src={task.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}
      
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.labels?.map((label, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-wider">
            {label}
          </span>
        ))}
      </div>

      <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{task.title}</h4>
      
      {task.due_date && (
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold mb-4">
          <Clock size={12} />
          <span>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex -space-x-2">
          {task.assignees?.map((_, idx) => (
            <div key={idx} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
              {String.fromCharCode(65 + idx)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <MessageSquare size={12} />
            <span>2</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <Paperclip size={12} />
            <span>1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectManagement() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const isProjectsList = location.pathname.endsWith('/list');
  const isWorkspaceTasks = location.pathname.endsWith('/workspace-tasks');
  
  const [view, setView] = useState<'list' | 'add'>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskActivities, setTaskActivities] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [formData, setFormData] = useState<Project>({
    company_name: '',
    project_name: '',
    contact_person: '',
    project_type: '',
    duration: '',
    assigned_to: '',
    start_date: '',
    end_date: '',
    timeline_milestones: ''
  });

  useEffect(() => {
    if (isProjectsList) {
      fetchProjects();
    }
    if (isWorkspaceTasks) {
      fetchTasks();
    }
  }, [isProjectsList, isWorkspaceTasks]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        // Parse JSON strings if necessary
        const parsedData = data.map((t: Task) => ({
          ...t,
          labels: typeof t.labels === 'string' ? JSON.parse(t.labels) : t.labels,
          assignees: typeof t.assignees === 'string' ? JSON.parse(t.assignees) : t.assignees,
          checklist: typeof t.checklist === 'string' ? JSON.parse(t.checklist) : t.checklist || [],
          attachments: typeof t.attachments === 'string' ? JSON.parse(t.attachments) : t.attachments || [],
        }));
        setTasks(parsedData);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const openTaskDetail = async (task: Task) => {
    setSelectedTask(task);
    setTempDescription(task.description || '');
    setIsTaskModalOpen(true);
    try {
      const [activitiesRes, labelsRes, employeesRes] = await Promise.all([
        fetch(`/api/tasks/${task.id}/activities`),
        fetch(`/api/tasks/labels`),
        fetch(`/api/employees`),
      ]);

      if (activitiesRes.ok) setTaskActivities(await activitiesRes.json());
      if (labelsRes.ok) setAvailableLabels(await labelsRes.json());
      if (employeesRes.ok) setEmployees(await employeesRes.json());
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const updateTaskField = async (taskId: number, field: string, value: string | string[] | number) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
        if (selectedTask?.id === taskId) {
          setSelectedTask({ ...selectedTask, [field]: value });
        }
      }
    } catch (error) {
      console.error(`Error updating task ${field}:`, error);
    }
  };

  const handleCreateLabel = async (name: string, color: string) => {
    try {
      const res = await fetch('/api/tasks/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });
      if (res.ok) {
        const newLabel = await res.json();
        setAvailableLabels([...availableLabels, { id: newLabel.id, name, color }]);
      }
    } catch (error) {
      console.error("Error creating label:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: 'Current User', // Replace with actual user name
          user_avatar: 'https://i.pravatar.cc/150?u=current',
          content: newComment
        })
      });

      if (res.ok) {
        const result = await res.json();
        const newActivity: TaskActivity = {
          id: result.id,
          user_name: 'Current User',
          user_avatar: 'https://i.pravatar.cc/150?u=current',
          content: newComment,
          created_at: new Date().toISOString()
        };
        setTaskActivities([newActivity, ...taskActivities]);
        setNewComment('');
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === Number(active.id));
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // If dropped over a column
    if (COLUMNS.some(c => c.id === overId)) {
      if (activeTask.status !== overId) {
        setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: overId as string } : t));
        updateTaskStatus(activeId, overId as string);
      }
      return;
    }

    // If dropped over another task
    const overTask = tasks.find((t) => t.id === Number(overId));
    if (overTask && activeTask.status !== overTask.status) {
      setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: overTask.status } : t));
      updateTaskStatus(activeId, overTask.status);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setView('list');
        fetchProjects();
        setFormData({
          company_name: '',
          project_name: '',
          contact_person: '',
          project_type: '',
          duration: '',
          assigned_to: '',
          start_date: '',
          end_date: '',
          timeline_milestones: ''
        });
      }
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubPageInfo = () => {
    const path = location.pathname;
    if (path.endsWith('/list')) return { title: 'Project Portfolio', desc: 'View and manage all company projects.' };
    if (path.endsWith('/my-tasks')) return { title: 'My Tasks', desc: 'Manage your assigned tasks and deadlines.' };
    if (path.endsWith('/workspace-tasks')) return { title: 'Workspace Tasks', desc: 'Overview of all tasks in the workspace.' };
    if (path.endsWith('/milestones')) return { title: 'Milestones', desc: 'Track project milestones and key deliverables.' };
    if (path.endsWith('/bidder-details')) return { title: 'Bidder Details', desc: 'Manage project bidders and proposals.' };
    if (path.endsWith('/reports')) return { title: 'Project Reports', desc: 'Generate and view detailed project analytics.' };
    return { title: 'Project Management', desc: 'Manage company projects and tasks.' };
  };

  const { title, desc } = getSubPageInfo();

  if (isWorkspaceTasks) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex">
        {isSuperAdminPath && <SuperAdminSidebar />}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="p-8 lg:px-12 lg:pt-12 lg:pb-6 bg-white border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Workspace Tasks</h1>
                <p className="text-slate-500 font-medium">Manage team tasks across different stages.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Layout size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-600"><ListIcon size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-600"><CalendarIcon size={18} /></button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                  <Plus size={18} />
                  Add Task
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar">
              {COLUMNS.map(col => (
                <div key={col.id} className="flex items-center gap-2 min-w-fit">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{col.title}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-x-auto p-8 lg:px-12 bg-slate-50/50">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 h-full min-w-max pb-4">
                {COLUMNS.map((column) => (
                  <div key={column.id} className="w-80 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">{column.title}</h3>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
                    </div>

                    <div className="flex-1 bg-slate-100/50 rounded-3xl p-3 overflow-y-auto no-scrollbar space-y-3 border border-slate-200/50">
                      <SortableContext
                        items={tasks.filter(t => t.status === column.id).map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {tasks.filter(t => t.status === column.id).map((task) => (
                          <SortableTaskCard key={task.id} task={task} onClick={() => openTaskDetail(task)} />
                        ))}
                      </SortableContext>
                      
                      <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2">
                        <Plus size={14} />
                        Add New Task
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="w-80 flex flex-col h-full">
                  <button className="h-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Add a new list
                  </button>
                </div>
              </div>

              <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: '0.5',
                    },
                  },
                }),
              }}>
                {activeTask ? <SortableTaskCard task={activeTask} onClick={() => {}} /> : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Task Detail Modal */}
          <AnimatePresence>
            {isTaskModalOpen && selectedTask && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsTaskModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                >
                  {/* Modal Header / Cover */}
                  <div className="relative h-48 md:h-64 bg-slate-100 shrink-0">
                    {selectedTask.image_url ? (
                      <img 
                        src={selectedTask.image_url} 
                        alt="Task Cover" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Layout className="text-white/20" size={120} />
                      </div>
                    )}
                    <button 
                      onClick={() => setIsTaskModalOpen(false)}
                      className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex flex-col lg:flex-row">
                      {/* Main Content */}
                      <div className="flex-1 p-8 md:p-12 space-y-12">
                        {/* Title & Status */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <Layout size={18} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedTask.title}</h2>
                          </div>
                          <p className="text-slate-500 font-bold text-sm ml-11">
                            in list <span className="text-blue-600 underline cursor-pointer">{selectedTask.status}</span>
                          </p>
                        </div>

                        {/* Labels */}
                        <div className="ml-11 relative">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Labels</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedTask.labels?.map((label, idx) => {
                              const labelInfo = availableLabels.find(l => l.name === label);
                              return (
                                <span 
                                  key={idx} 
                                  className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                                  style={{ 
                                    backgroundColor: labelInfo ? `${labelInfo.color}20` : '#f1f5f9',
                                    color: labelInfo ? labelInfo.color : '#475569',
                                    borderColor: labelInfo ? `${labelInfo.color}40` : '#e2e8f0'
                                  }}
                                >
                                  {label}
                                </span>
                              );
                            })}
                            <button 
                              onClick={() => setIsLabelPopoverOpen(!isLabelPopoverOpen)}
                              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Label Popover */}
                          <AnimatePresence>
                            {isLabelPopoverOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] p-4"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Labels</h4>
                                  <button onClick={() => setIsLabelPopoverOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                </div>
                                <div className="relative mb-4">
                                  <input 
                                    type="text" 
                                    placeholder="Search labels" 
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar mb-4">
                                  {availableLabels.map((label) => (
                                    <div key={label.id} className="flex items-center gap-3 group">
                                      <input 
                                        type="checkbox" 
                                        checked={selectedTask.labels?.includes(label.name)}
                                        onChange={(e) => {
                                          const newLabels = e.target.checked 
                                            ? [...(selectedTask.labels || []), label.name]
                                            : (selectedTask.labels || []).filter(l => l !== label.name);
                                          updateTaskField(selectedTask.id!, 'labels', newLabels);
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <div 
                                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center justify-between"
                                        style={{ backgroundColor: label.color }}
                                      >
                                        {label.name}
                                        <Edit2 size={10} className="opacity-0 group-hover:opacity-100 cursor-pointer" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button 
                                  onClick={() => handleCreateLabel('New Label', '#3b82f6')}
                                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                  Create a new label
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <FileText size={14} /> Description
                            </h3>
                            {!isEditingDescription && (
                              <button 
                                onClick={() => setIsEditingDescription(true)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                          </div>
                          {isEditingDescription ? (
                            <div className="space-y-3">
                              <textarea 
                                value={tempDescription}
                                onChange={(e) => setTempDescription(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-blue-500 rounded-3xl p-6 text-slate-600 font-medium leading-relaxed outline-none"
                                rows={4}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setIsEditingDescription(false);
                                    setTempDescription(selectedTask.description || '');
                                  }}
                                  className="px-4 py-2 text-slate-500 font-bold text-xs"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => {
                                    updateTaskField(selectedTask.id!, 'description', tempDescription);
                                    setIsEditingDescription(false);
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => setIsEditingDescription(true)}
                              className="bg-slate-50 rounded-3xl p-6 text-slate-600 font-medium leading-relaxed border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all"
                            >
                              {selectedTask.description || "Add more details..."}
                            </div>
                          )}
                        </div>

                        {/* Checklist */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <CheckSquare size={14} /> Checklist 
                              <span className="ml-2 text-blue-600">
                                {selectedTask.checklist?.filter(i => i.completed).length || 0}/{selectedTask.checklist?.length || 0}
                              </span>
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {selectedTask.checklist?.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 group">
                                <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 hover:border-blue-400'}`}>
                                  {item.completed && <CheckSquare size={14} />}
                                </button>
                                <span className={`font-bold text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                            <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-sm transition-all ml-10">
                              <Plus size={16} />
                              Add a new item
                            </button>
                          </div>
                        </div>

                        {/* Attachments */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Paperclip size={14} /> Attachments 
                            <span className="ml-2 text-blue-600">{selectedTask.attachments?.length || 0}</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedTask.attachments?.map((file) => (
                              <div key={file.id} className="flex gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex flex-col justify-between py-1">
                                  <div>
                                    <h4 className="text-sm font-black text-slate-800 truncate max-w-[150px]">{file.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{file.created_at}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button className="text-slate-400 hover:text-blue-600 transition-all"><Download size={14} /></button>
                                    <button className="text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Activities */}
                        <div className="space-y-8 pt-8 border-t border-slate-100">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={14} /> Activities 
                            <span className="ml-2 text-blue-600">{taskActivities.length}</span>
                          </h3>
                          
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 shrink-0 overflow-hidden">
                              <img src="https://i.pravatar.cc/150?u=current" alt="User" />
                            </div>
                            <div className="flex-1 relative">
                              <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                rows={2}
                              />
                              <button 
                                onClick={handleAddComment}
                                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-8">
                            {taskActivities.map((activity) => (
                              <div key={activity.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden">
                                  <img src={activity.user_avatar} alt={activity.user_name} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-black text-slate-800">{activity.user_name}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                      {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                    </span>
                                  </div>
                                  <div className="text-sm text-slate-600 font-medium leading-relaxed">
                                    {activity.content}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sidebar */}
                      <div className="w-full lg:w-80 p-8 md:p-12 bg-slate-50/50 border-l border-slate-100 space-y-10">
                        {/* Quick Info */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layout size={14} /></div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                <p className="text-xs font-bold text-slate-700">{selectedTask.status}</p>
                              </div>
                            </div>
                            <ChevronDown size={14} className="text-slate-400" />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={14} /></div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</p>
                                <p className="text-xs font-bold text-slate-700">{selectedTask.due_date || 'No date'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Filter size={14} /></div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                                <select 
                                  value={selectedTask.priority}
                                  onChange={(e) => updateTaskField(selectedTask.id!, 'priority', e.target.value)}
                                  className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer p-0 appearance-none"
                                >
                                  <option value="None">None</option>
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                  <option value="Urgent">Urgent</option>
                                </select>
                              </div>
                            </div>
                            <ChevronDown size={14} className="text-slate-400" />
                          </div>
                        </div>

                        {/* Assignees */}
                        <div className="space-y-4 relative">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignees</h3>
                            <button 
                              onClick={() => setIsAssigneePopoverOpen(!isAssigneePopoverOpen)}
                              className="text-slate-400 hover:text-blue-600 transition-all"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="flex -space-x-3">
                            {selectedTask.assignees?.map((assignee, idx) => (
                              <div key={idx} className="w-10 h-10 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs overflow-hidden">
                                {assignee.length > 2 ? (
                                  <img 
                                    src={`https://i.pravatar.cc/150?u=${assignee}`} 
                                    alt={assignee} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : assignee}
                              </div>
                            ))}
                          </div>

                          {/* Assignee Popover */}
                          <AnimatePresence>
                            {isAssigneePopoverOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] p-4"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Assignee</h4>
                                  <button onClick={() => setIsAssigneePopoverOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                </div>
                                <div className="relative mb-4">
                                  <input 
                                    type="text" 
                                    placeholder="Search User" 
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                                  {employees.map((emp) => (
                                    <div key={emp.id} className="flex items-center gap-3">
                                      <input 
                                        type="checkbox" 
                                        checked={selectedTask.assignees?.includes(emp.name)}
                                        onChange={(e) => {
                                          const newAssignees = e.target.checked 
                                            ? [...(selectedTask.assignees || []), emp.name]
                                            : (selectedTask.assignees || []).filter(a => a !== emp.name);
                                          updateTaskField(selectedTask.id!, 'assignees', newAssignees);
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                                        <img src={emp.profile_picture || `https://i.pravatar.cc/150?u=${emp.id}`} alt={emp.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-800">{emp.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{emp.designation}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-6 border-t border-slate-100">
                          <button className="w-full flex items-center gap-3 px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                            <Eye size={16} /> Watch
                          </button>
                          <button className="w-full flex items-center gap-3 px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                            <Paperclip size={16} /> Attachment
                          </button>
                          <button className="w-full flex items-center gap-3 px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                            <Archive size={16} /> Archive
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  if (!isProjectsList) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex">
        {isSuperAdminPath && <SuperAdminSidebar />}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">{title}</h1>
            <p className="text-slate-500 font-medium">{desc}</p>
          </header>
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-md mx-auto">{title} module is under development.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {isSuperAdminPath && <SuperAdminSidebar />}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Project Portfolio</h1>
            <p className="text-slate-500 font-medium">Manage and track all company projects in one place.</p>
          </div>
          {view === 'list' && (
            <button 
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <Plus size={20} />
              NEW PROJECT
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {projects.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                  <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Briefcase className="text-blue-600" size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">NO PROJECTS FOUND</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">Start by creating your first project to track progress and milestones.</p>
                  <button 
                    onClick={() => setView('add')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    CREATE FIRST PROJECT
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Briefcase size={24} />
                        </div>
                        <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black tracking-widest uppercase rounded-full">Active</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{project.project_name}</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">{project.company_name}</p>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-slate-600">
                          <User size={16} className="text-slate-400" />
                          <span className="text-sm font-medium">{project.assigned_to}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <Calendar size={16} className="text-slate-400" />
                          <span className="text-sm font-medium">{project.start_date} - {project.end_date}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project.project_type}</span>
                        <button className="text-blue-600 font-bold text-sm hover:underline">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <h2 className="text-xs font-black text-blue-600 tracking-[0.2em] uppercase">Add New Project Details</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={12} /> Company Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={12} /> Project Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.project_name}
                      onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                      placeholder="Enter project name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Contact Person Details
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                      placeholder="Name / Phone / Email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={12} /> Type of Project
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.project_type}
                      onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                      placeholder="e.g. Web Development"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> Duration
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                      placeholder="e.g. 6 Months"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Assigned To
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                      placeholder="Team lead or manager"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} /> Starting Date
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} /> Ending Date
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-12">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} /> Timeline / Milestones
                  </label>
                  <textarea
                    required
                    value={formData.timeline_milestones}
                    onChange={(e) => setFormData({...formData, timeline_milestones: e.target.value})}
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 resize-none"
                    placeholder="e.g. Phase 1: Planning (Month 1), Phase 2: Design (Month 2)..."
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-8 py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'SAVING...' : 'ADD PROJECT'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
