import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Download, FileSpreadsheet, FileText, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Department {
  id: number;
  name: string;
  head_of_department: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface DepartmentModuleProps {
  companyId: number;
}

export default function DepartmentModule({ companyId }: DepartmentModuleProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    head_of_department: '',
    status: 'active' as 'active' | 'inactive'
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/departments?company_id=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const url = editingId 
        ? `/api/departments/${editingId}` 
        : '/api/departments';
        
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        company_id: companyId
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        fetchDepartments();
        resetForm();
      } else {
        alert(`Failed to ${editingId ? 'update' : 'create'} department`);
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Error saving department");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setFormData({
      name: dept.name,
      head_of_department: dept.head_of_department,
      status: dept.status
    });
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const res = await fetch(`/api/departments/${deleteConfirmId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchDepartments();
      } else {
        alert("Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Error deleting department");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      head_of_department: '',
      status: 'active'
    });
    setEditingId(null);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const exportToExcel = () => {
    const data = departments.map((d, index) => ({
      'Serial no': index + 1,
      'Department name': d.name,
      'Head of Department': d.head_of_department,
      'Status': d.status === 'active' ? 'Active' : 'Inactive'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Departments");
    XLSX.writeFile(wb, `departments.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.text(`Departments Report`, 14, 15);
    
    const tableColumn = ['Serial no', 'Department name', 'Head of Department', 'Status'];
    const tableRows = departments.map((d, index) => [
      index + 1,
      d.name,
      d.head_of_department,
      d.status === 'active' ? 'Active' : 'Inactive'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`departments.pdf`);
  };

  const printTable = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={printTable}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors print:hidden"
            title="Print"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-white border border-slate-200 text-emerald-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors print:hidden"
            title="Export Excel"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-white border border-slate-200 text-rose-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-rose-50 transition-colors print:hidden"
            title="Export PDF"
          >
            <FileText size={16} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
        
        <button 
          onClick={openNewForm}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 print:hidden"
        >
          <Plus size={16} />
          Add New Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Serial no</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Department name</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Head of Department</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No departments found.</td>
                  </tr>
                ) : (
                  departments.map((dept, index) => (
                    <tr key={dept.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-slate-700">{index + 1}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-900">{dept.name}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">{dept.head_of_department}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          dept.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right print:hidden">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(dept)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(dept.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
      )}

      {/* Manual Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {editingId ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department name *</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. Electrical"
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Head of Department *</label>
                <input 
                  type="text"
                  name="head_of_department"
                  value={formData.head_of_department}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Delete Department</h2>
              <p className="text-slate-500 mb-6">Are you sure you want to delete this department? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
