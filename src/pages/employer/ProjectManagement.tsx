import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Calendar, User, Briefcase, Building2, Clock, FileText, MoreHorizontal, MessageSquare, Paperclip, Filter, Layout, List as ListIcon, Calendar as CalendarIcon, X, CheckSquare, Eye, Download, Trash2, Edit2, Archive, ChevronDown, Send, Flag, ExternalLink, Check, Users } from 'lucide-react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { Project, Milestone } from '../../types';

interface Bid {
  id: number;
  date: string;
  bidder_id: number;
  bidder_name?: string;
  source: string;
  job_title: string;
  job_link: string;
  profile: string;
  bid_type: string;
  bid_rate: string;
  connects: number;
  boosted: number;
  is_viewed: boolean;
  is_interviewed: boolean;
  is_hired: boolean;
  hiring_rate: string;
  location: string;
  client_spend: string;
  company_id: number;
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
  
  const [view, setView] = useState<'list' | 'add' | 'milestones' | 'bidders'>(
    location.pathname.endsWith('/milestones') ? 'milestones' : 
    location.pathname.endsWith('/bidder-details') ? 'bidders' : 'list'
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [bidders, setBidders] = useState<Bid[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<number | null>(null);
  const [taskActivities, setTaskActivities] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  const [milestoneFormData, setMilestoneFormData] = useState<Partial<Milestone>>({
    name: '',
    project_id: undefined,
    assignee_id: undefined,
    priority: 'Medium',
    start_date: '',
    end_date: '',
    notes: '',
    status: 'Active',
    completion_percentage: 0
  });

  const [bidFormData, setBidFormData] = useState<Partial<Bid>>({
    date: new Date().toISOString().split('T')[0],
    bidder_id: undefined,
    source: '',
    job_title: '',
    job_link: '',
    profile: 'Agency',
    bid_type: 'Hourly',
    bid_rate: '',
    connects: 0,
    boosted: 0,
    is_viewed: false,
    is_interviewed: false,
    is_hired: false,
    hiring_rate: '',
    location: '',
    client_spend: ''
  });

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

  const [formData, setFormData] = useState<Partial<Project>>({
    company_name: '',
    project_name: '',
    contact_person: '',
    project_type: '',
    duration: '',
    assigned_to: '',
    start_date: '',
    end_date: '',
    timeline_milestones: '',
    status: 'Active',
    company_id: 1
  });

  useEffect(() => {
    if (isProjectsList) {
      fetchProjects();
    }
    if (isWorkspaceTasks) {
      fetchTasks();
    }
    if (location.pathname.endsWith('/milestones')) {
      setView('milestones');
      fetchMilestones();
      fetchProjects();
      fetchEmployees();
    }
    if (location.pathname.endsWith('/bidder-details')) {
      setView('bidders');
      fetchBidders();
      fetchEmployees();
    }
  }, [isProjectsList, isWorkspaceTasks, location.pathname]);

  const fetchBidders = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/bids?company_id=1');
      if (res.ok) {
        setBidders(await res.json());
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingBid ? `/api/bids/${editingBid.id}` : '/api/bids';
      const method = editingBid ? 'PUT' : 'POST';
      const res = await fetchWithRetry(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bidFormData, company_id: 1 })
      });
      if (res.ok) {
        setIsBidModalOpen(false);
        setEditingBid(null);
        setBidFormData({
          date: new Date().toISOString().split('T')[0],
          bidder_id: undefined,
          source: '',
          job_title: '',
          job_link: '',
          profile: 'Agency',
          bid_type: 'Hourly',
          bid_rate: '',
          connects: 0,
          boosted: 0,
          is_viewed: false,
          is_interviewed: false,
          is_hired: false,
          hiring_rate: '',
          location: '',
          client_spend: ''
        });
        fetchBidders();
      }
    } catch (error) {
      console.error("Error saving bid:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBid = async (id: number) => {
    try {
      const res = await fetchWithRetry(`/api/bids/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteConfirmOpen(null);
        fetchBidders();
      }
    } catch (error) {
      console.error("Error deleting bid:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetchWithRetry('/api/employees?company_id=1');
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/milestones?company_id=1');
      if (res.ok) {
        setMilestones(await res.json());
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingMilestone ? `/api/milestones/${editingMilestone.id}` : '/api/milestones';
      const method = editingMilestone ? 'PUT' : 'POST';
      const res = await fetchWithRetry(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...milestoneFormData, company_id: 1 })
      });
      if (res.ok) {
        setIsMilestoneModalOpen(false);
        setEditingMilestone(null);
        setMilestoneFormData({
          name: '',
          project_id: undefined,
          assignee_id: undefined,
          priority: 'Medium',
          start_date: '',
          end_date: '',
          notes: '',
          status: 'Active',
          completion_percentage: 0
        });
        fetchMilestones();
      }
    } catch (error) {
      console.error("Error saving milestone:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    try {
      const res = await fetchWithRetry(`/api/milestones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMilestones();
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/projects');
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
      const res = await fetchWithRetry('/api/tasks');
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
        fetchWithRetry(`/api/tasks/${task.id}/activities`),
        fetchWithRetry(`/api/tasks/labels`),
        fetchWithRetry(`/api/employees`),
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
      const res = await fetchWithRetry(`/api/tasks/${taskId}`, {
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
      const res = await fetchWithRetry('/api/tasks/labels', {
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
      const res = await fetchWithRetry(`/api/tasks/${selectedTask.id}/activities`, {
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
      await fetchWithRetry(`/api/tasks/${taskId}/status`, {
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
      const res = await fetchWithRetry('/api/projects', {
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
          timeline_milestones: '',
          status: 'Active',
          company_id: 1
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

        {/* Bid Modal */}
      <AnimatePresence>
        {isBidModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingBid ? 'Edit Bid' : 'Add New Bid'}</h2>
                  <p className="text-slate-500 text-sm font-medium">Enter project bidding details below.</p>
                </div>
                <button 
                  onClick={() => setIsBidModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveBid} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bidder (Employee)</label>
                    <select 
                      required
                      value={bidFormData.bidder_id || ''}
                      onChange={(e) => setBidFormData({ ...bidFormData, bidder_id: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    >
                      <option value="">Select Bidder</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={bidFormData.date}
                      onChange={(e) => setBidFormData({ ...bidFormData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Upwork, LinkedIn"
                      value={bidFormData.source}
                      onChange={(e) => setBidFormData({ ...bidFormData, source: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter job title"
                      value={bidFormData.job_title}
                      onChange={(e) => setBidFormData({ ...bidFormData, job_title: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Link</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://..."
                      value={bidFormData.job_link}
                      onChange={(e) => setBidFormData({ ...bidFormData, job_link: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile</label>
                    <select 
                      value={bidFormData.profile}
                      onChange={(e) => setBidFormData({ ...bidFormData, profile: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    >
                      <option value="Agency">Agency</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bid Type</label>
                    <select 
                      value={bidFormData.bid_type}
                      onChange={(e) => setBidFormData({ ...bidFormData, bid_type: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    >
                      <option value="Hourly">Hourly</option>
                      <option value="Fixed Price">Fixed Price</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bid Rate ($)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. $45.00 - $65.00"
                      value={bidFormData.bid_rate}
                      onChange={(e) => setBidFormData({ ...bidFormData, bid_rate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Connects</label>
                    <input 
                      type="number" 
                      value={bidFormData.connects}
                      onChange={(e) => setBidFormData({ ...bidFormData, connects: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Boosted</label>
                    <input 
                      type="number" 
                      value={bidFormData.boosted}
                      onChange={(e) => setBidFormData({ ...bidFormData, boosted: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hiring Rate</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 53%"
                      value={bidFormData.hiring_rate}
                      onChange={(e) => setBidFormData({ ...bidFormData, hiring_rate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ukraine, US"
                      value={bidFormData.location}
                      onChange={(e) => setBidFormData({ ...bidFormData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Spend</label>
                    <input 
                      type="text" 
                      placeholder="e.g. $132K"
                      value={bidFormData.client_spend}
                      onChange={(e) => setBidFormData({ ...bidFormData, client_spend: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-8 mb-8 p-4 bg-slate-50 rounded-2xl">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={bidFormData.is_viewed}
                      onChange={(e) => setBidFormData({ ...bidFormData, is_viewed: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Is Viewed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={bidFormData.is_interviewed}
                      onChange={(e) => setBidFormData({ ...bidFormData, is_interviewed: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Is Interviewed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={bidFormData.is_hired}
                      onChange={(e) => setBidFormData({ ...bidFormData, is_hired: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Is Hired</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsBidModalOpen(false)}
                    className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'Saving...' : editingBid ? 'Update Bid' : 'Save Bid'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Milestone Modal */}
        <AnimatePresence>
          {isMilestoneModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMilestoneModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">
                    {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                  </h2>
                  <button 
                    onClick={() => setIsMilestoneModalOpen(false)}
                    className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveMilestone} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Project Name <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={milestoneFormData.project_id || ''}
                      onChange={(e) => setMilestoneFormData({...milestoneFormData, project_id: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                    >
                      <option value="">Select</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.project_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Milestone Name <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={milestoneFormData.name}
                      onChange={(e) => setMilestoneFormData({...milestoneFormData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Assignee <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={milestoneFormData.assignee_id || ''}
                      onChange={(e) => setMilestoneFormData({...milestoneFormData, assignee_id: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                    >
                      <option value="">Select</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Priority <span className="text-red-500">*</span></label>
                    <select
                      value={milestoneFormData.priority}
                      onChange={(e) => setMilestoneFormData({...milestoneFormData, priority: e.target.value as Milestone['priority']})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Start Date <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="date"
                        value={milestoneFormData.start_date}
                        onChange={(e) => setMilestoneFormData({...milestoneFormData, start_date: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">End Date <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="date"
                        value={milestoneFormData.end_date}
                        onChange={(e) => setMilestoneFormData({...milestoneFormData, end_date: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Notes</label>
                    <textarea
                      value={milestoneFormData.notes}
                      onChange={(e) => setMilestoneFormData({...milestoneFormData, notes: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 min-h-[120px] outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsMilestoneModalOpen(false)}
                      className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-lg font-bold hover:bg-slate-100 transition-all border border-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingMilestone ? 'UPDATE MILESTONE' : 'ADD MILESTONE'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!isProjectsList && view !== 'milestones' && view !== 'bidders' && !isWorkspaceTasks) {
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">
              {view === 'milestones' ? 'Project Milestones' : 
               view === 'bidders' ? 'Bidder Details' : 'Project Portfolio'}
            </h1>
            <p className="text-slate-500 font-medium">
              {view === 'milestones' ? 'Track and manage key project deliverables.' : 
               view === 'bidders' ? 'Manage project bidders and proposals.' : 'Manage and track all company projects in one place.'}
            </p>
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
          {view === 'milestones' && (
            <button 
              onClick={() => {
                setEditingMilestone(null);
                setMilestoneFormData({
                  name: '',
                  project_id: undefined,
                  assignee_id: undefined,
                  priority: 'Medium',
                  start_date: '',
                  end_date: '',
                  notes: '',
                  status: 'Active',
                  completion_percentage: 0
                });
                setIsMilestoneModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wider"
            >
              <Plus size={20} />
              ADD MILESTONE
            </button>
          )}
          {view === 'bidders' && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search bids..." 
                  className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 shadow-sm"
                />
              </div>
              <button 
                onClick={() => {
                  setEditingBid(null);
                  setBidFormData({
                    date: new Date().toISOString().split('T')[0],
                    bidder_id: undefined,
                    source: '',
                    job_title: '',
                    job_link: '',
                    profile: 'Agency',
                    bid_type: 'Hourly',
                    bid_rate: '',
                    connects: 0,
                    boosted: 0,
                    is_viewed: false,
                    is_interviewed: false,
                    is_hired: false,
                    hiring_rate: '',
                    location: '',
                    client_spend: ''
                  });
                  setIsBidModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wider"
              >
                <Plus size={20} />
                Add Bid
              </button>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {view === 'milestones' ? (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {milestones.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                <Flag size={32} />
                              </div>
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">No milestones found</p>
                              <button 
                                onClick={() => {
                                  setEditingMilestone(null);
                                  setMilestoneFormData({
                                    name: '',
                                    project_id: undefined,
                                    assignee_id: undefined,
                                    priority: 'Medium',
                                    start_date: '',
                                    end_date: '',
                                    notes: '',
                                    status: 'Active',
                                    completion_percentage: 0
                                  });
                                  setIsMilestoneModalOpen(true);
                                }}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all uppercase tracking-wider text-xs"
                              >
                                Create First Milestone
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        milestones.map((milestone) => (
                          <tr key={milestone.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                  <Flag size={14} />
                                </div>
                                <span className="text-sm font-bold text-slate-800">{milestone.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{milestone.project_name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden">
                                  <img src={`https://i.pravatar.cc/150?u=${milestone.assignee_id}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{milestone.assignee_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                milestone.priority === 'High' ? 'bg-red-50 text-red-600' :
                                milestone.priority === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {milestone.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start: {milestone.start_date}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End: {milestone.end_date}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-24">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black text-slate-400">{milestone.completion_percentage}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-600 rounded-full" 
                                    style={{ width: `${milestone.completion_percentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                milestone.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                milestone.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                                'bg-slate-50 text-slate-400'
                              }`}>
                                {milestone.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingMilestone(milestone);
                                    setMilestoneFormData({
                                      name: milestone.name,
                                      project_id: milestone.project_id,
                                      assignee_id: milestone.assignee_id,
                                      priority: milestone.priority,
                                      start_date: milestone.start_date,
                                      end_date: milestone.end_date,
                                      notes: milestone.notes,
                                      status: milestone.status,
                                      completion_percentage: milestone.completion_percentage
                                    });
                                    setIsMilestoneModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => milestone.id && handleDeleteMilestone(milestone.id)}
                                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : view === 'bidders' ? (
            <motion.div
              key="bidders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1800px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bidder (Employee)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Link</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bid Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bid Rate ($)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Connects</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Boosted</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Viewed</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inter</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hired</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiring Rate</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Spend</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidders.length > 0 ? bidders.map((b) => (
                        <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-600">{new Date(b.date).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <img src={`https://i.pravatar.cc/150?u=${b.bidder_id}`} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                              <span className="font-bold text-slate-900">{employees.find(e => e.id === b.bidder_id)?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.source}</span>
                          </td>
                          <td className="px-6 py-5 max-w-[200px] truncate">
                            <span className="text-sm text-slate-600 font-medium">{b.job_title}</span>
                          </td>
                          <td className="px-6 py-5">
                            <a href={b.job_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                              Link <ExternalLink size={12} />
                            </a>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.profile}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.bid_type}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-slate-900">{b.bid_rate}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.connects}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.boosted}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${b.is_viewed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                              {b.is_viewed && <Check size={12} strokeWidth={4} />}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${b.is_interviewed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                              {b.is_interviewed && <Check size={12} strokeWidth={4} />}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${b.is_hired ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                              {b.is_hired && <Check size={12} strokeWidth={4} />}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.hiring_rate}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.location}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">{b.client_spend}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2 relative">
                              <button 
                                onClick={() => {
                                  setEditingBid(b);
                                  setBidFormData(b);
                                  setIsBidModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <div className="relative">
                                <button 
                                  onClick={() => setIsDeleteConfirmOpen(isDeleteConfirmOpen === b.id ? null : b.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                                {isDeleteConfirmOpen === b.id && (
                                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-xs font-bold text-slate-900 mb-3">Are you sure you want to delete this bid?</p>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => setIsDeleteConfirmOpen(null)}
                                        className="flex-1 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                      >
                                        CANCEL
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteBid(b.id)}
                                        className="flex-1 px-3 py-1.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                      >
                                        DELETE
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={17} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                <Users className="text-slate-300" size={32} />
                              </div>
                              <div>
                                <p className="text-slate-900 font-bold">No bids found</p>
                                <p className="text-slate-500 text-sm">Get started by adding your first project bid.</p>
                              </div>
                              <button 
                                onClick={() => setIsBidModalOpen(true)}
                                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider text-sm"
                              >
                                Add Bid
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : view === 'list' ? (
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
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => {
                              setEditingMilestone(null);
                              setMilestoneFormData({
                                name: '',
                                project_id: project.id,
                                assignee_id: undefined,
                                priority: 'Medium',
                                start_date: '',
                                end_date: '',
                                notes: '',
                                status: 'Active',
                                completion_percentage: 0
                              });
                              setIsMilestoneModalOpen(true);
                            }}
                            className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                          >
                            Add Milestone
                          </button>
                          <button className="text-blue-600 font-bold text-sm hover:underline">View Details</button>
                        </div>
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
