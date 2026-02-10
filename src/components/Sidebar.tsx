'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Tablet, LogOut, Activity, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Tablet, label: 'Device Inventory', href: '/devices' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (pathname === '/login') return null;

  return (
    <aside className="sidebar" style={{
      width: '240px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--card-bg)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      borderRight: '1px solid var(--border-color)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
      transition: 'all 0.4s ease'
    }}>
      {/* Brand Header */}
      <div style={{ 
        padding: '1.25rem 1rem', 
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <div style={{ 
          background: 'var(--accent)', 
          color: 'white', 
          padding: '7px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Activity size={16} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.01em' }}>FOURRTS</h2>
          <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase' }}>Management Cloud</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.5rem 0.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Main Menu Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{ padding: '0 1rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Analytics
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{
                  color: isActive ? 'white' : 'var(--text-body)',
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* System Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
           <p style={{ padding: '0 1rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Management
          </p>
          <Link 
            href="/settings"
            className={`sidebar-link ${pathname === '/settings' ? 'active' : ''}`}
            style={{
              color: pathname === '/settings' ? 'white' : 'var(--text-body)',
            }}
          >
             <Settings size={16} strokeWidth={pathname === '/settings' ? 2.5 : 2} />
             Account Settings
          </Link>
          
          <button 
            onClick={toggleTheme}
            className="sidebar-link"
            style={{
              background: 'none',
              border: 'none',
              width: 'calc(100% - 1rem)',
              cursor: 'pointer',
              color: 'var(--text-body)'
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>

      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-app)', transition: 'all 0.4s ease' }}>
         <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.65rem',
            borderRadius: '10px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'var(--shadow-sm)'
          }}
          className="logout-btn"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
      
      <style jsx>{`
        .logout-btn:hover {
          background: var(--error-bg);
          color: var(--error);
          border-color: var(--error);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }
      `}</style>
    </aside>
  );

};

export default Sidebar;
