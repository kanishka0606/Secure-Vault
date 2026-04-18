import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, User, Edit, Save, X, Trash, AlertTriangle, Bell, ChevronDown, Plus } from 'lucide-react';
import { MOCK_ALL_STUDENTS } from '../utils/mockData';

const FacultyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editData, setEditData] = useState({ subjects: [], attendance: { conducted: 0, attended: 0 } });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // New states for functionality
  const [activeTab, setActiveTab] = useState('Documents');
  const [documents, setDocuments] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ studentId: '', title: '', file: null });

  useEffect(() => {
    fetchStudents();
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://secure-vault-l70e.onrender.com/api/documents/all', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          setDocuments(await res.json());
        }
      }
    } catch (err) {
      console.error('Error fetching docs', err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.studentId) return alert('Select student and file');
    try {
      const formData = new FormData();
      formData.append('student_id', uploadData.studentId);
      formData.append('title', uploadData.title);
      formData.append('file', uploadData.file);

      const token = localStorage.getItem('token');
      const res = await fetch('https://secure-vault-l70e.onrender.com/api/documents/faculty-upload', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
      });
      if (res.ok) {
        setUploadModalOpen(false);
        fetchDocuments();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Delete document?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://secure-vault-l70e.onrender.com/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('https://secure-vault-l70e.onrender.com/api/faculty/students', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          const mapped = data.map(s => ({
            studentId: s.student_id,
            userId: { name: s.users?.name || 'Unknown', email: s.users?.email || '' },
            department: s.department,
            year: s.year,
            semester: s.semester
          }));
          setStudents(mapped);
          setFilteredStudents(mapped);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredStudents(students.filter(s => 
      s.studentId.toLowerCase().includes(term) || 
      s.userId.name.toLowerCase().includes(term) ||
      s.department.toLowerCase().includes(term)
    ));
  };

  const openEdit = (s) => {
    setSelectedStudent(s);
    // In a real app, you'd fetch the existing marks/attendance here
    // For now, let's assume simple initialization
    setEditData({ 
      subjects: [
        { name: 'Mathematics', marks: 85, grade: 'A' },
        { name: 'Computer Science', marks: 90, grade: 'A+' }
      ], 
      attendance: { conducted: 40, attended: 35 } 
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      // Save Marks
      await fetch(`https://secure-vault-l70e.onrender.com/api/faculty/marks/${selectedStudent.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ subjects: editData.subjects, cgpa: 9.0 })
      });
      // Save Attendance
      await fetch(`https://secure-vault-l70e.onrender.com/api/faculty/attendance/${selectedStudent.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ 
          totalConducted: editData.attendance.conducted, 
          totalAttended: editData.attendance.attended 
        })
      });
      
      alert('Updated successfully!');
      setSelectedStudent(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Faculty Portal...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '0', background: '#f8fafc' }}>
        {/* Top Navbar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search student by name or ID (e.g., Jane Doe, 2024101)..." 
              style={{ width: '100%', padding: '0.625rem 0.625rem 0.625rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'none', color: 'var(--text-muted)' }}><Bell size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Dr. A. Sharma</span>
              <ChevronDown size={16} color="var(--text-muted)" />
            </div>
          </div>
        </header>

        <div style={{ padding: '2rem' }}>
          {location.pathname === '/faculty/dashboard' && (
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827' }}>Dashboard Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Students Enrolled</h3>
                  <p style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>{filteredStudents.length}</p>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Courses</h3>
                  <p style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>4</p>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending Reports</h3>
                  <p style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>2</p>
                </div>
              </div>
            </div>
          )}

          {location.pathname === '/faculty/courses' && (
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827' }}>My Courses</h1>
              <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Course Code</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Course Name</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['CS101 - Intro to Computer Science', 'CS202 - Data Structures', 'CS301 - Operating Systems'].map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{c.split(' - ')[0]}</td>
                        <td style={{ padding: '1rem' }}>{c.split(' - ')[1]}</td>
                        <td style={{ padding: '1rem' }}>{30 + i * 15} Students</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {location.pathname === '/faculty/reports' && (
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827' }}>Generate Reports</h1>
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>End of Semester Reports</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Compile all grades and attendance for the current semester into a downloadable PDF format.</p>
                <button className="btn btn-primary">Generate Final Report</button>
              </div>
            </div>
          )}

          {location.pathname === '/faculty' && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827' }}>Students</h1>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
            {['All Students', 'Search Records', 'Update Marks', 'Attendance', 'Documents'].map(tab => (
              <div 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '0.75rem 1rem', 
                  fontSize: '0.875rem', 
                  fontWeight: activeTab === tab ? '600' : '500', 
                  color: activeTab === tab ? '#111827' : '#6b7280', 
                  borderBottom: activeTab === tab ? '2px solid #4f46e5' : 'none', 
                  cursor: 'pointer', 
                  marginBottom: activeTab === tab ? '-1px' : '0' 
                }}>
                {tab}
              </div>
            ))}
          </div>

          {/* Student Table Render */}
          {activeTab === 'All Students' && (
            <div className="card span-12">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Student ID</th>
                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Name</th>
                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Department</th>
                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Year/Sem</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{s.studentId}</td>
                      <td style={{ padding: '1rem' }}>{s.userId.name}</td>
                      <td style={{ padding: '1rem' }}>{s.department}</td>
                      <td style={{ padding: '1rem' }}>{s.year} / {s.semester}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => openEdit(s)} className="btn" style={{ color: 'var(--primary)', padding: '4px' }}><Edit size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Documents View Render */}
          {activeTab === 'Documents' && (
            <>
              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className="btn" style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>View Student List</button>
                <button className="btn" style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>Search Records</button>
                <button onClick={() => setUploadModalOpen(true)} className="btn" style={{ background: '#475569', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Plus size={16} /> Upload Document
                </button>
              </div>

              {/* Documents Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb', fontSize: '0.875rem', color: '#6b7280' }}>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Student</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Course</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Document Name</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Type</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Uploaded Date</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {documents.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '2px' }}>{row.student_id}</div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>{row.studentName}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>{row.course}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>{row.title}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            {row.filetype ? row.filetype.split('/')[1] : 'PDF'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ 
                            background: row.status === 'Verified' ? '#f3f4f6' : '#dbeafe', 
                            color: row.status === 'Verified' ? '#6b7280' : '#1e40af', 
                            padding: '0.25rem 0.625rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: '600' 
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : 'N/A'}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button onClick={() => handleDeleteDocument(row.id)} style={{ color: '#ef4444', margin: '0 4px', background: 'none' }}><Trash size={18} /></button>
                        </td>
                      </tr>
                    ))}
                    {documents.length === 0 && (
                      <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No documents found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          </>
        )}
        </div>

        {/* Edit Modal Overlay */}
        {selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3>Update Records: {selectedStudent.userId.name}</h3>
                <button onClick={() => setSelectedStudent(null)} style={{ background: 'none' }}><X size={24} /></button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attendance</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Classes Conducted</label>
                    <input type="number" value={editData.attendance.conducted} onChange={(e) => setEditData({...editData, attendance: {...editData.attendance, conducted: e.target.value}})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Classes Attended</label>
                    <input type="number" value={editData.attendance.attended} onChange={(e) => setEditData({...editData, attendance: {...editData.attendance, attended: e.target.value}})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Marks</h4>
                {editData.subjects.map((sub, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="text" value={sub.name} style={{ flex: 2, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} readOnly />
                    <input type="number" value={sub.marks} onChange={(e) => {
                      const newSubs = [...editData.subjects];
                      newSubs[idx].marks = e.target.value;
                      setEditData({...editData, subjects: newSubs});
                    }} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} />
                    <input type="text" value={sub.grade} onChange={(e) => {
                      const newSubs = [...editData.subjects];
                      newSubs[idx].grade = e.target.value;
                      setEditData({...editData, subjects: newSubs});
                    }} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }} />
                    <button style={{ color: 'var(--danger)' }}><Trash size={18} /></button>
                  </div>
                ))}
                <button className="btn" style={{ fontSize: '0.75rem', color: 'var(--primary)', padding: '0' }}>+ Add Subject</button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Documents (Modify/Delete)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Mocking documents for the modal */}
                  {[
                    { title: 'ID Card', type: 'PDF' },
                    { title: 'Marksheet', type: 'PDF' }
                  ].map((doc, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{doc.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.type}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ color: 'var(--text-muted)' }}><Edit size={16} /></button>
                        <button style={{ color: 'var(--danger)' }} onClick={() => alert('Document Deleted')}><Trash size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save size={18} /> Save Changes
                </button>
                <button onClick={() => setSelectedStudent(null)} className="btn" style={{ flex: 1, border: '1px solid var(--border)' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal Overlay */}
        {uploadModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3>Upload Document</h3>
                <button onClick={() => setUploadModalOpen(false)} style={{ background: 'none' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleUploadSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Student ID</label>
                  <input type="text" value={uploadData.studentId} onChange={(e) => setUploadData({...uploadData, studentId: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }} required placeholder="e.g. ST12345" />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Document Title</label>
                  <input type="text" value={uploadData.title} onChange={(e) => setUploadData({...uploadData, title: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }} required placeholder="e.g. Final Report" />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>File</label>
                  <input type="file" onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Upload Document</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyDashboard;
