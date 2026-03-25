import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, FileSpreadsheet, FileText, XCircle, Filter, Search, Shield, Upload, User, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Employee {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  designation: string;
  status: 'active' | 'inactive';
  mobile_no: string;
  date_of_birth: string;
  joining_date: string;
  blood_group: string;
  location: string;
  city: string;
  employee_type: string;
  national_id: string;
  salary: string;
  tax_deduction: string;
  bank_name: string;
  bank_account_no: string;
  mode_of_payment: string;
  username: string;
  profile_picture?: string;
  custom_fields?: { label: string; value: string }[];
  created_at: string;
}

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
  department_id: number;
  department_name?: string;
}

interface EmployeeModuleProps {
  companyId: number;
}

export default function EmployeeModule({ companyId }: EmployeeModuleProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [activeTab, setActiveTab] = useState<'employee' | 'positions' | 'inactive'>('employee');
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState({
    employee_id: '',
    employee_type: '',
    department: '',
    designation: '',
    blood_group: '',
    location: '',
    city: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employee_id: '',
    department: '',
    designation: '',
    status: 'active' as 'active' | 'inactive',
    mobile_no: '',
    date_of_birth: '',
    joining_date: '',
    blood_group: '',
    location: '',
    city: '',
    employee_type: '',
    national_id: '',
    salary: '',
    tax_deduction: '',
    bank_name: '',
    bank_account_no: '',
    mode_of_payment: '',
    username: '',
    profile_picture: '',
    custom_fields: [] as { label: string; value: string }[]
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees?company_id=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        const parsedData = data.map((emp: any) => ({
          ...emp,
          custom_fields: typeof emp.custom_fields === 'string' ? JSON.parse(emp.custom_fields) : (emp.custom_fields || [])
        }));
        setEmployees(parsedData);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchDepartmentsAndDesignations = useCallback(async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        fetch(`/api/departments?company_id=${companyId}`),
        fetch(`/api/designations?company_id=${companyId}`)
      ]);
      
      if (deptRes.ok) {
        setDepartments(await deptRes.json());
      }
      if (desigRes.ok) {
        setDesignations(await desigRes.json());
      }
    } catch (error) {
      console.error("Error fetching deps/desigs:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartmentsAndDesignations();
  }, [fetchEmployees, fetchDepartmentsAndDesignations]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'department') {
        return { ...prev, [name]: value, designation: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      employee_id: '',
      employee_type: '',
      department: '',
      designation: '',
      blood_group: '',
      location: '',
      city: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const url = editingId 
        ? `/api/employees/${editingId}` 
        : '/api/employees';
        
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        company_id: companyId,
        // Format dates to YYYY-MM-DD if they exist
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : null,
        joining_date: formData.joining_date ? new Date(formData.joining_date).toISOString().split('T')[0] : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        fetchEmployees();
        resetForm();
      } else {
        alert(`Failed to ${editingId ? 'update' : 'create'} employee`);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Error saving employee");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      password: '', // Don't populate password
      employee_id: emp.employee_id || '',
      department: emp.department || '',
      designation: emp.designation || '',
      status: emp.status || 'active',
      mobile_no: emp.mobile_no || '',
      date_of_birth: emp.date_of_birth ? new Date(emp.date_of_birth).toISOString().split('T')[0] : '',
      joining_date: emp.joining_date ? new Date(emp.joining_date).toISOString().split('T')[0] : '',
      blood_group: emp.blood_group || '',
      location: emp.location || '',
      city: emp.city || '',
      employee_type: emp.employee_type || '',
      national_id: emp.national_id || '',
      salary: emp.salary || '',
      tax_deduction: emp.tax_deduction || '',
      bank_name: emp.bank_name || '',
      bank_account_no: emp.bank_account_no || '',
      mode_of_payment: emp.mode_of_payment || '',
      username: emp.username || '',
      profile_picture: emp.profile_picture || '',
      custom_fields: emp.custom_fields || []
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const res = await fetch(`/api/employees/${deleteConfirmId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchEmployees();
      } else {
        alert("Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      employee_id: '',
      department: '',
      designation: '',
      status: 'active',
      mobile_no: '',
      date_of_birth: '',
      joining_date: '',
      blood_group: '',
      location: '',
      city: '',
      employee_type: '',
      national_id: '',
      salary: '',
      tax_deduction: '',
      bank_name: '',
      bank_account_no: '',
      mode_of_payment: '',
      username: '',
      profile_picture: '',
      custom_fields: []
    });
    setEditingId(null);
  };

  const generateRandomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const openNewForm = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      username: `user_${generateRandomString(6)}`,
      password: generateRandomString(10)
    }));
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_picture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      custom_fields: [...prev.custom_fields, { label: '', value: '' }]
    }));
  };

  const updateCustomField = (index: number, field: 'label' | 'value', value: string) => {
    setFormData(prev => {
      const newFields = [...prev.custom_fields];
      newFields[index][field] = value;
      return { ...prev, custom_fields: newFields };
    });
  };

  const removeCustomField = (index: number) => {
    setFormData(prev => {
      const newFields = [...prev.custom_fields];
      newFields.splice(index, 1);
      return { ...prev, custom_fields: newFields };
    });
  };

  // Filter and paginate data
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Tab filter
      if (activeTab === 'inactive' && emp.status !== 'inactive') return false;
      if (activeTab === 'employee' && emp.status === 'inactive') return false;
      
      // Search filter
      if (searchTerm && !emp.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !emp.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Dropdown filters
      if (filters.employee_id && emp.employee_id !== filters.employee_id) return false;
      if (filters.employee_type && emp.employee_type !== filters.employee_type) return false;
      if (filters.department && emp.department !== filters.department) return false;
      if (filters.designation && emp.designation !== filters.designation) return false;
      if (filters.blood_group && emp.blood_group !== filters.blood_group) return false;
      if (filters.location && emp.location !== filters.location) return false;
      if (filters.city && emp.city !== filters.city) return false;
      
      return true;
    });
  }, [employees, activeTab, searchTerm, filters]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredEmployees.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredEmployees, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / entriesPerPage);

  const exportToExcel = () => {
    const data = filteredEmployees.map((e, index) => ({
      'SL': index + 1,
      'Employee ID': e.employee_id,
      'Name': e.name,
      'Email': e.email,
      'Mobile No': e.mobile_no,
      'Date of Birth': e.date_of_birth ? new Date(e.date_of_birth).toLocaleDateString() : '',
      'Designation': e.designation,
      'Joining Date': e.joining_date ? new Date(e.joining_date).toLocaleDateString() : '',
      'Status': e.status === 'active' ? 'Active' : 'Inactive'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, `employees.xlsx`);
  };

  const exportToCSV = () => {
    const data = filteredEmployees.map((e, index) => ({
      'SL': index + 1,
      'Employee ID': e.employee_id,
      'Name': e.name,
      'Email': e.email,
      'Mobile No': e.mobile_no,
      'Date of Birth': e.date_of_birth ? new Date(e.date_of_birth).toLocaleDateString() : '',
      'Designation': e.designation,
      'Joining Date': e.joining_date ? new Date(e.joining_date).toLocaleDateString() : '',
      'Status': e.status === 'active' ? 'Active' : 'Inactive'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique values for filters
  const uniqueEmployeeTypes = Array.from(new Set(employees.map(e => e.employee_type).filter(Boolean)));
  const uniqueBloodGroups = Array.from(new Set(employees.map(e => e.blood_group).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(employees.map(e => e.location).filter(Boolean)));
  const uniqueCities = Array.from(new Set(employees.map(e => e.city).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-4">
        <button 
          onClick={() => setActiveTab('employee')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'employee' 
              ? 'bg-emerald-400 text-white shadow-md shadow-emerald-200' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Employee
        </button>
        <button 
          onClick={() => setActiveTab('positions')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'positions' 
              ? 'bg-emerald-400 text-white shadow-md shadow-emerald-200' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Positions
        </button>
        <button 
          onClick={() => setActiveTab('inactive')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'inactive' 
              ? 'bg-emerald-400 text-white shadow-md shadow-emerald-200' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Inactive Employees List
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Actions */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Employee List</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold underline decoration-2 underline-offset-4 mr-2">
              Download Demo File
            </a>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-emerald-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
              <Upload size={16} />
              IMPORT EMPLOYEE LIST
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
              <Shield size={16} />
              CREDENTIALS REPORT
            </button>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg text-sm font-bold transition-colors ${
                showFilters 
                  ? 'bg-slate-800 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter size={16} />
              FILTER
            </button>
            
            <button 
              onClick={openNewForm}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-200"
            >
              <Plus size={16} />
              ADD EMPLOYEE
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <select 
                name="employee_id" 
                value={filters.employee_id} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">Select employee id</option>
                {employees.map(e => e.employee_id && <option key={e.id} value={e.employee_id}>{e.employee_id}</option>)}
              </select>
              
              <select 
                name="employee_type" 
                value={filters.employee_type} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">All employee type</option>
                {uniqueEmployeeTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
              </select>
              
              <select 
                name="department" 
                value={filters.department} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">All department</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              
              <select 
                name="designation" 
                value={filters.designation} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">All designation</option>
                {designations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              
              <select 
                name="blood_group" 
                value={filters.blood_group} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">All blood group</option>
                {uniqueBloodGroups.map((bg, i) => <option key={i} value={bg}>{bg}</option>)}
              </select>
              
              <select 
                name="location" 
                value={filters.location} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">All location</option>
                {uniqueLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
              </select>
              
              <select 
                name="city" 
                value={filters.city} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="">All city</option>
                {uniqueCities.map((city, i) => <option key={i} value={city}>{city}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-emerald-400 text-white rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors shadow-sm">
                FIND
              </button>
              <button 
                onClick={resetFilters}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm"
              >
                RESET
              </button>
            </div>
          </div>
        )}

        {/* Table Controls */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Show</span>
            <select 
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-400"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-1.5 border border-emerald-600 text-emerald-600 rounded text-xs font-bold hover:bg-emerald-50 transition-colors"
              >
                <FileText size={14} /> CSV
              </button>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-3 py-1.5 border border-emerald-600 text-emerald-600 rounded text-xs font-bold hover:bg-emerald-50 transition-colors"
              >
                <FileSpreadsheet size={14} /> EXCEL
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Search:</span>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:border-emerald-400 w-48"
                />
                <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">SL</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">PROFILE</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">EMPLOYEE ID</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">NAME OF EMPLOYEE</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">EMAIL</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">MOBILE NO</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">DATE OF BIRTH</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">DESIGNATION</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">JOINING DATE</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">STATUS</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">No data available in table</td>
                </tr>
              ) : (
                paginatedEmployees.map((emp, index) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-600">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                        {emp.profile_picture ? (
                          <img src={emp.profile_picture} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={16} className="text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{emp.employee_id || '-'}</td>
                    <td className="py-3 px-4 text-sm font-bold text-emerald-600">{emp.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{emp.email}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{emp.mobile_no || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{emp.designation || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete"
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

        {/* Pagination */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages || 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-emerald-400 text-white font-bold' 
                    : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden group">
                  {formData.profile_picture ? (
                    <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Profile Picture</h3>
                  <p className="text-xs text-slate-500">Upload a professional photo. Recommended size 256x256px.</p>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} required placeholder="Enter name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee ID</label>
                  <input type="text" name="employee_id" value={formData.employee_id} onChange={handleFormChange} placeholder="e.g. 000032" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} required placeholder="email@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile</label>
                  <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleFormChange} placeholder="+1234567890" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
                  <select name="designation" value={formData.designation} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none">
                    <option value="">Enter or select designation</option>
                    {designations
                      .filter(d => !formData.department || d.department_name === formData.department)
                      .map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <select name="department" value={formData.department} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none">
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Joining Date</label>
                  <input type="date" name="joining_date" value={formData.joining_date} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                  <select name="blood_group" value={formData.blood_group} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">National ID</label>
                  <input type="text" name="national_id" value={formData.national_id} onChange={handleFormChange} placeholder="ID Number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleFormChange} placeholder="Location" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleFormChange} placeholder="City" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
              </div>

              <hr className="border-slate-200 mb-6" />

              {/* Financial Details */}
              <div className="mb-6">
                <h3 className="inline-block bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded mb-4">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Salary</label>
                    <input type="number" name="salary" value={formData.salary} onChange={handleFormChange} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tax Deduction (%)</label>
                    <input type="number" name="tax_deduction" value={formData.tax_deduction} onChange={handleFormChange} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Name</label>
                    <input type="text" name="bank_name" value={formData.bank_name} onChange={handleFormChange} placeholder="Bank Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Account No</label>
                    <input type="text" name="bank_account_no" value={formData.bank_account_no} onChange={handleFormChange} placeholder="Account Number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode of Payment</label>
                    <select name="mode_of_payment" value={formData.mode_of_payment} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none">
                      <option value="">Select Mode</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 mb-6" />

              {/* Login Credentials */}
              <div className="mb-6">
                <h3 className="inline-block bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded mb-4">Login Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleFormChange} placeholder="Auto-generated if empty" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="Auto-generated if empty" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 mb-6" />

              {/* Custom Fields */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                    <Settings size={14} /> Custom Fields
                  </h3>
                  <button type="button" onClick={addCustomField} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                    <Plus size={16} /> Add Custom Field
                  </button>
                </div>
                
                {formData.custom_fields.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold italic px-3 py-1 rounded">No custom fields added yet.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.custom_fields.map((field, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            placeholder="Field Label (e.g. LinkedIn Profile)" 
                            value={field.label}
                            onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none mb-2" 
                          />
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            placeholder="Field Value" 
                            value={field.value}
                            onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeCustomField(index)}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3 justify-end border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {formLoading ? 'Saving...' : 'Save Employee'}
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
              <h2 className="text-xl font-black text-slate-900 mb-2">Delete Employee</h2>
              <p className="text-slate-500 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
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
