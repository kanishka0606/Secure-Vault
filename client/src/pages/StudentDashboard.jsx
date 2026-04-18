import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Book, GraduationCap, Clock, Upload, Download, File, AlertTriangle, FileText } from 'lucide-react';
import { MOCK_STUDENT_DATA, MOCK_DOCUMENTS } from '../utils/mockData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/students/profile', {
        headers: { 'x-auth-token': token }
      });
      
      if (res.ok) {
        const profile = await res.json();
        // Map Supabase format to expected UI structure
        const records = profile.academic_records || {};
        setData({
          profile: {
            studentId: profile.student_id,
            department: profile.department,
            year: profile.year,
            semester: profile.semester,
            contact: profile.contact,
            userId: { name: profile.users?.name || 'Student' }
          },
          attendance: { 
            totalConducted: records.total_conducted || 0, 
            totalAttended: records.total_attended || 0 
          },
          records: {
            subjects: records.subjects || [],
            cgpa: records.cgpa || 0,
          }
        });

        // Fetch documents
        const dRes = await fetch(`/api/documents/${profile.student_id}`, {
          headers: { 'x-auth-token': token }
        });
        if (dRes.ok) {
          setDocs(await dRes.json());
        }
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      setLoading(true);
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
      });

      if (res.ok) {
        alert('Document uploaded successfully!');
        // Refresh documents
        const dRes = await fetch(`/api/documents/${data.profile.studentId}`, {
          headers: { 'x-auth-token': token }
        });
        if (dRes.ok) setDocs(await dRes.json());
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Academic Progress Report', 14, 22);
    
    // Student Info
    doc.setFontSize(12);
    doc.text(`Student Name: ${data.profile.userId.name}`, 14, 35);
    doc.text(`Student ID: ${data.profile.studentId}`, 14, 42);
    doc.text(`Department: ${data.profile.department}`, 14, 49);
    
    // Academic Records Table
    const tableData = data.records.subjects.map(s => [s.name, s.marks, s.grade]);
    doc.autoTable({
      startY: 60,
      head: [['Subject', 'Marks', 'Grade']],
      body: tableData,
    });
    
    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Current CGPA: ${data.records.cgpa}`, 14, finalY);
    doc.text(`Overall Attendance: ${Math.round((data.attendance.totalAttended / data.attendance.totalConducted) * 100)}%`, 14, finalY + 7);
    
    // Save
    doc.save(`${data.profile.studentId}_Report.pdf`);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Student Profile</h1>
            <p style={{ color: 'var(--text-muted)' }}>Overview of your academic and personal records</p>
          </div>
          <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Download Academic Report
          </button>
        </header>

        {data?.attendance && (data.attendance.totalAttended / data.attendance.totalConducted) < 0.75 && (
          <div style={{ 
            background: '#fff7ed', 
            border: '1px solid #ffedd5', 
            color: '#c2410c', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <AlertTriangle size={20} />
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>Automated Risk Alert: Low Attendance</p>
              <p style={{ fontSize: '0.75rem' }}>Your current attendance is {Math.round((data.attendance.totalAttended / data.attendance.totalConducted) * 100)}%. Please contact your faculty advisor.</p>
            </div>
          </div>
        )}

        <div className="bento-grid">
          {/* Profile Card */}
          <div className="card span-12" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={40} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{data?.profile?.userId?.name || 'Student Name'}</h2>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Book size={16} /> {data?.profile?.department}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GraduationCap size={16} /> ID: {data?.profile?.studentId}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> Year {data?.profile?.year}, Sem {data?.profile?.semester}</span>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="card span-4">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Attendance</h3>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                {data?.attendance ? Math.round((data.attendance.totalAttended / data.attendance.totalConducted) * 100) : 0}%
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {data?.attendance?.totalAttended} / {data?.attendance?.totalConducted} Classes
              </p>
            </div>
          </div>

          {/* Marks */}
          <div className="card span-8">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Academic Records</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Subject</th>
                  <th style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Marks</th>
                  <th style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {data?.records?.subjects?.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem 0' }}>{s.marks}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{s.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '1.5rem', textAlign: 'right', fontWeight: '700' }}>
              CGPA: {data?.records?.cgpa || '0.00'}
            </div>
          </div>

          {/* Document Vault */}
          <div className="card span-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem' }}>Document Vault</h3>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}
              >
                <Upload size={16} /> Upload New
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {docs.map((doc, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: 'var(--primary)' }}><File size={24} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(doc.uploadDate).toLocaleDateString()}</p>
                  </div>
                  <a href={`/uploads/${doc.filename}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Download size={18} /></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
