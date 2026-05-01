import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, X, Check, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import './EmployeeManager.css';

export default function EmployeeManagerScreen({ onBack }) {
  const { shop, user } = useApp();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: '',
    phone: '',
    email: '',
    permissions: { create_bills: true, manage_khata: false }
  });

  useEffect(() => {
    if (shop) loadEmployees();
  }, [shop]);

  const loadEmployees = async () => {
    if (user?.id === 'demo_user') {
      const saved = localStorage.getItem(`invoeazy_emp_${shop.id}`);
      setEmployees(saved ? JSON.parse(saved) : []);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Employee name is required');
    
    setSaving(true);
    try {
      const empData = {
        shop_id: shop.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        permissions: form.permissions,
        role: 'employee'
      };

      if (user?.id === 'demo_user') {
        const newEmpList = form.id 
          ? employees.map(e => e.id === form.id ? { ...e, ...empData } : e)
          : [...employees, { id: Date.now().toString(), ...empData, created_at: new Date().toISOString() }];
        
        localStorage.setItem(`invoeazy_emp_${shop.id}`, JSON.stringify(newEmpList));
        setEmployees(newEmpList);
        toast.success(form.id ? 'Employee updated' : 'Employee added');
      } else {
        if (form.id) {
          const { error } = await supabase.from('employees').update(empData).eq('id', form.id);
          if (error) throw error;
          toast.success('Employee updated');
        } else {
          const { error } = await supabase.from('employees').insert([empData]);
          if (error) throw error;
          toast.success('Employee added');
        }
        await loadEmployees();
      }
      
      setShowAdd(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this employee?')) return;
    
    try {
      if (user?.id === 'demo_user') {
        const newEmpList = employees.filter(e => e.id !== id);
        localStorage.setItem(`invoeazy_emp_${shop.id}`, JSON.stringify(newEmpList));
        setEmployees(newEmpList);
      } else {
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (error) throw error;
        await loadEmployees();
      }
      toast.success('Employee removed');
    } catch (err) {
      toast.error('Failed to remove employee');
    }
  };

  const resetForm = () => {
    setForm({ id: null, name: '', phone: '', email: '', permissions: { create_bills: true, manage_khata: false } });
  };

  const editEmployee = (emp) => {
    setForm({
      id: emp.id,
      name: emp.name,
      phone: emp.phone || '',
      email: emp.email || '',
      permissions: emp.permissions || { create_bills: true, manage_khata: false }
    });
    setShowAdd(true);
  };

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  if (showAdd) {
    return (
      <div className="employee-manager">
        <div className="app-header">
          <div className="header-inner">
            <button className="icon-btn" onClick={() => { setShowAdd(false); resetForm(); }}>
              <ArrowLeft size={20} />
            </button>
            <h2 className="header-title">{form.id ? 'Edit Employee' : 'Add Employee'}</h2>
            <div style={{ width: 40 }} />
          </div>
        </div>

        <div className="page-content" style={{ padding: 20 }}>
          <form className="emp-form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                className="form-input" 
                placeholder="Staff name" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                autoFocus 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <input 
                className="form-input" 
                type="tel" 
                placeholder="Phone number" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
              />
            </div>

            <div className="section-heading" style={{ marginTop: 24, marginBottom: 12 }}>
              <h3>Permissions</h3>
            </div>

            <div className="permission-card" onClick={() => togglePermission('create_bills')}>
              <div className="perm-info">
                <h4>Create Bills</h4>
                <p>Allow staff to generate and print bills</p>
              </div>
              <div className={`custom-checkbox ${form.permissions.create_bills ? 'checked' : ''}`}>
                {form.permissions.create_bills && <Check size={14} strokeWidth={3} />}
              </div>
            </div>

            <div className="permission-card" onClick={() => togglePermission('manage_khata')}>
              <div className="perm-info">
                <h4>Manage Khata</h4>
                <p>Allow staff to add/settle credit accounts</p>
              </div>
              <div className={`custom-checkbox ${form.permissions.manage_khata ? 'checked' : ''}`}>
                {form.permissions.manage_khata && <Check size={14} strokeWidth={3} />}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 24 }} disabled={saving}>
              {saving ? <div className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Save Employee'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-manager">
      <div className="app-header">
        <div className="header-inner">
          <button className="icon-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="header-title">Staff Management</h2>
            <p className="header-subtitle">{employees.length} Members</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <UserPlus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="page-content" style={{ padding: 20 }}>
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
              <Users size={32} />
            </div>
            <h3>No Staff Added</h3>
            <p>Add your employees to give them billing access.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
              <UserPlus size={18} /> Add First Employee
            </button>
          </div>
        ) : (
          <div className="employee-list">
            {employees.map(emp => (
              <div key={emp.id} className="employee-card">
                <div className="emp-avatar">{emp.name.substring(0, 2).toUpperCase()}</div>
                <div className="emp-details">
                  <h4>{emp.name}</h4>
                  <p>{emp.phone || 'No phone'}</p>
                  <div className="emp-badges">
                    {emp.permissions?.create_bills && <span className="badge badge-success">Billing</span>}
                    {emp.permissions?.manage_khata && <span className="badge badge-warning">Khata</span>}
                  </div>
                </div>
                <div className="emp-actions">
                  <button className="icon-btn" onClick={() => editEmployee(emp)}>
                    <Edit2 size={16} color="var(--text-muted)" />
                  </button>
                  <button className="icon-btn" onClick={() => handleDelete(emp.id)}>
                    <Trash2 size={16} color="var(--danger)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
