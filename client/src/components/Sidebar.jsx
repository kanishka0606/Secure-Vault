import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen, Clock, FileText, Settings, Shield, Home, GraduationCap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    Student: [
      { name: 'Profile', icon: <User size={20} />, path: '/student' },
      { name: 'Documents', icon: <FileText size={20} />, path: '/student/docs' }
    ],
    Faculty: [
      { name: 'Dashboard', icon: <Home size={20} />, path: '/faculty/dashboard' },
      { name: 'Students', icon: <User size={20} />, path: '/faculty' },
      { name: 'Courses', icon: <GraduationCap size={20} />, path: '/faculty/courses' },
      { name: 'Reports', icon: <FileText size={20} />, path: '/faculty/reports' }
    ],
    Admin: [
      { name: 'Overview', icon: <Shield size={20} />, path: '/admin' },
      { name: 'Users', icon: <User size={20} />, path: '/admin/users' }
    ]
  };

  return (
    <div className="sidebar" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '700' }}>Student Vault</h2>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems[user.role].map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '0.75rem 1rem', 
              color: 'var(--text-main)', 
              textDecoration: 'none',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            {item.icon}
            <span style={{ fontWeight: '500' }}>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <ThemeToggle />
        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user.name}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--danger)', 
            background: 'none', 
            fontSize: '0.875rem', 
            fontWeight: '500' 
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
