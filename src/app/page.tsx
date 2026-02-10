'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeviceList from '@/components/DeviceList';
import { RefreshCcw, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/devices');
      if (res.status === 401) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <main className="container">
      <header className="section-header" style={{ alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ 
              background: 'var(--success-bg)', 
              color: 'var(--success)', 
              padding: '0.2rem 0.5rem', 
              borderRadius: '4px', 
              fontSize: '0.6rem', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span className="dot dot-online" style={{ width: '4px', height: '4px' }} /> 
                <span></span>OPERATIONAL
            </span>
          </div>
          <h1 className="title" style={{ fontSize: '1.5rem', gap: '1rem' } } >Facility Command</h1>
          <p className="subtitle">Real-time environmental telemetry platform</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', 
              padding: '0.5rem', 
              borderRadius: '10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
            className="theme-toggle-btn"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <section>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Active Monitors</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Connected IoT hardware across facility</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <span className="dot dot-online" style={{ width: '4px', height: '4px' }} /> 
            Live Stream
          </div>
        </div>
        <DeviceList />
      </section>


      <footer className="no-print" style={{ marginTop: '5rem', padding: '3rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.5rem' }}>FOURRTS ENTERPRISE SOLUTIONS</p>
      </footer>

      {/* Print Only Metadata */}
      <div className="print-only" style={{ display: 'none', borderTop: '1px solid #eee', marginTop: '2rem', paddingTop: '1rem', fontSize: '0.7rem', color: '#666' }}>
        Report Generated: {new Date().toLocaleString()} | FOURRTS Dashboard Platform
      </div>

      <style jsx>{`
        @media print {
          .print-only {
            display: block !important;
          }
        }
      `}</style>
    </main>
  );
}
