'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tablet, Check, Edit2, X, ExternalLink, Settings2, Eye, EyeOff } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      // Add timestamp to bypass potential browser/Next.js caching
      const res = await fetch(`/api/devices?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDevices(data.map((d: any) => ({ ...d, id: d.deviceId })));
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setLoading(false);
    }
  };

  const toggleDashboard = async (id: string, currentStatus: boolean) => {
    // Optimistic UI Update: immediately change local state for better UX
    setDevices(prev => prev.map(d => 
      d.id === id ? { ...d, showOnDashboard: !currentStatus } : d
    ));

    try {
      const res = await fetch(`/api/devices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnDashboard: !currentStatus })
      });
      
      if (!res.ok) {
        // Rollback on failure
        await fetchDevices();
      }
    } catch (err) {
      console.error('Failed to toggle dashboard visibility:', err);
      await fetchDevices(); // Rollback
    }
  };

  const startEdit = (device: any) => {
    setEditingId(device.id);
    setEditName(device.displayName);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/devices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: editName })
    });
    if (res.ok) {
      setEditingId(null);
      fetchDevices();
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '10rem' }}>Syncing with device registry...</div>;

  return (
    <main className="container">
      <header className="section-header" style={{ alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
             <Tablet size={12} style={{ color: 'var(--accent)' }} />
             <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Management</span>
          </div>
          <h1 className="title">System Inventory</h1>
          <p className="subtitle">Provisioning and lifecycle management for sensing hardware</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
           <Settings2 size={13} style={{ color: 'var(--accent)' }} /> 
           Configuration Active
        </div>
      </header>

      <div className="formal-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Status</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Device ID</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Device Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hardware Class</th>
                <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dashboard Visibility</th>
                <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const lastTime = new Date(device.lastUpdate).getTime();
                const now = new Date().getTime();
                const online = (now - lastTime) / (1000 * 60) <= 15;
                
                return (
                  <tr key={device.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        background: online ? 'var(--success-bg)' : 'var(--error-bg)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        width: 'fit-content'
                      }}>
                        <span className={`dot ${online ? 'dot-online' : 'dot-offline'}`} style={{ width: 5, height: 5 }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: online ? 'var(--success)' : 'var(--error)' }}>
                          {online ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <code style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>{device.id}</code>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {editingId === device.id ? (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ 
                              padding: '0.3rem 0.5rem', 
                              fontSize: '0.8rem', 
                              borderRadius: '4px', 
                              border: '1px solid var(--accent)',
                              width: '140px'
                            }}
                          />
                          <button onClick={() => saveEdit(device.id)} style={{ padding: '2px', color: 'var(--success)', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} style={{ padding: '2px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{device.displayName}</span>
                          <button onClick={() => startEdit(device)} style={{ padding: '2px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={10} /></button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        color: 'var(--secondary)', 
                        background: 'var(--bg-app)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)' 
                      }}>
                        {device.type} SERIES
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => toggleDashboard(device.id, device.showOnDashboard !== false)}
                        style={{ 
                          background: device.showOnDashboard !== false ? 'var(--accent-light)' : 'var(--bg-app)', 
                          border: 'none',
                          cursor: 'pointer',
                          color: device.showOnDashboard !== false ? 'var(--accent)' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          textTransform: 'uppercase'
                        }}
                      >
                        {device.showOnDashboard !== false ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Hidden</>}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                       <Link href={`/device/${device.id}`} style={{ 
                         color: 'var(--accent)', 
                         textDecoration: 'none', 
                         fontSize: '0.75rem', 
                         fontWeight: 700,
                         display: 'inline-flex',
                         alignItems: 'center',
                         gap: '0.3rem',
                         padding: '0.4rem 0.75rem',
                         borderRadius: '6px',
                         background: 'var(--accent-light)'
                       }}>
                        Configure <ExternalLink size={12} />
                       </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .table-row-hover:hover {
          background-color: var(--border-light);
        }
      `}</style>
    </main>
  );
}
