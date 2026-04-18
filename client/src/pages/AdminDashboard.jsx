import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { UserPlus, Users, Database, ShieldCheck, Plus, Trash, X, Edit, Building } from 'lucide-react';
import { MOCK_ALL_STUDENTS, MOCK_FACULTY, MOCK_ADMIN, MOCK_DEPARTMENTS } from '../utils/mockData';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    facultyDepartment: '',
    studentDetails: {
      studentId: '',
      department: '',
      year: '1',
      semester: '1',
      contact: ''
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        console.error('Failed to fetch users');
      }
      
      // Fetch departments
      const deptRes = await fetch('/api/admin/departments', {
        headers: { 'x-auth-token': token }
      });
      if (deptRes.ok) {
        setDepartments(await deptRes.json());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('User registered successfully');
        setShowAddForm(false);
        fetchUsers();
      } else {
        alert(data.msg);
      }
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        alert('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        const data = await res.json();
        alert(data.msg || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleAddDept = async (name) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        alert('Department added!');
        fetchUsers(); // Re-fetches departments too
      } else {
        const data = await res.json();
        alert(data.msg || 'Failed to add department');
      }
    } catch (err) {
      alert('Error adding department');
    }
  };

  const handleDeleteDept = async (deptId, deptName) => {
    if (!window.confirm(`Delete department "${deptName}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/departments/${deptId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        alert('Department deleted');
        fetchUsers();
      }
    } catch (err) {
      alert('Error deleting department');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Console...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Admin Control Center</h1>
            <p style={{ color: 'var(--text-muted)' }}>System-wide user and data management</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} /> Register New User
          </button>
        </header>

        <div className="bento-grid">
          {/* Stats Cards */}
          <div className="card span-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '12px', borderRadius: '12px' }}><Users size={24} /></div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL USERS</p>
              <h3 style={{ fontSize: '1.5rem' }}>{users.length}</h3>
            </div>
          </div>
          <div className="card span-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '12px', borderRadius: '12px' }}><Database size={24} /></div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>STUDENTS</p>
              <h3 style={{ fontSize: '1.5rem' }}>{users.filter(u => u.role === 'Student').length}</h3>
            </div>
          </div>
          <div className="card span-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px', borderRadius: '12px' }}><ShieldCheck size={24} /></div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>FACULTY</p>
              <h3 style={{ fontSize: '1.5rem' }}>{users.filter(u => u.role === 'Faculty').length}</h3>
            </div>
          </div>

          {/* User List */}
          <div className="card span-12">
            <h3 style={{ marginBottom: '1.5rem' }}>Registered Accounts</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Name</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                    <td style={{ padding: '1rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: u.role === 'Admin' ? '#fee2e2' : u.role === 'Faculty' ? '#e0f2fe' : '#f1f5f9',
                        color: u.role === 'Admin' ? '#991b1b' : u.role === 'Faculty' ? '#0369a1' : 'var(--text-main)',
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600'
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ color: 'var(--primary)', background: 'none' }}><Edit size={18} /></button>
                      <button style={{ color: 'var(--danger)', background: 'none' }} onClick={() => handleDeleteUser(u.id, u.name)}><Trash size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Department Management */}
          <div className="card span-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Building size={20} /> Department Management</h3>
              <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.875rem' }} onClick={() => {
                const name = prompt('Enter department name:');
                if (name) handleAddDept(name);
              }}><Plus size={16} /> Add Dept</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {departments.map((dept, idx) => (
                <div key={idx} style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem' }}>{dept.name}</h4>
                    <button style={{ color: 'var(--danger)', background: 'none' }} onClick={() => handleDeleteDept(dept.id, dept.name)}><Trash size={16} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span>Faculty: {dept.staff_count}</span>
                    <span>Students: {dept.student_count}</span>
                  </div>
                </div>
              ))}
              {departments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No departments yet. Click "+ Add Dept" to create one.</p>}
            </div>
          </div>

        </div>

        {/* Register User Modal */}
        {showAddForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3>Register New User</h3>
                <button onClick={() => setShowAddForm(false)} style={{ background: 'none' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Role</label>
                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}>
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} required />
                  </div>
                </div>

                {formData.role === 'Faculty' && (
                  <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Faculty Details</h4>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Department</label>
                      <select value={formData.facultyDepartment} onChange={(e) => setFormData({...formData, facultyDepartment: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} required>
                        <option value="">Select Department</option>
                        {departments.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {formData.role === 'Student' && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Student Profile Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <input type="text" placeholder="Student ID" value={formData.studentDetails.studentId} onChange={(e) => setFormData({...formData, studentDetails: {...formData.studentDetails, studentId: e.target.value}})} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} required />
                      <select value={formData.studentDetails.department} onChange={(e) => setFormData({...formData, studentDetails: {...formData.studentDetails, department: e.target.value}})} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} required>
                        <option value="">Select Department</option>
                        {departments.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                      </select>
                      <input type="text" placeholder="Contact" value={formData.studentDetails.contact} onChange={(e) => setFormData({...formData, studentDetails: {...formData.studentDetails, contact: e.target.value}})} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} required />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register User</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn" style={{ flex: 1, border: '1px solid var(--border)' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
