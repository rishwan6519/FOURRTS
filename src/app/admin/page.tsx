'use client';

import React, { useState, useEffect } from 'react';
import { User, Device } from '@/types';
import { UserPlus, Cpu, Trash2, Users, ChevronRight, CheckCircle, Search, Shield, LogOut } from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [deviceType, setDeviceType] = useState<'RST' | 'DPT'>('RST');
  const [userDevices, setUserDevices] = useState<Device[]>([]);
  const [deviceCount, setDeviceCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserDevices(selectedUser._id);
    } else {
      setUserDevices([]);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data);
  };

  const fetchUserDevices = async (userId: string) => {
    const res = await fetch(`/api/admin/devices?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setUserDevices(data);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      setMessage('User created successfully!');
      setUsername('');
      setPassword('');
      fetchUsers();
    } else {
      const err = await res.json();
      setMessage('Error: ' + err.error);
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAssignDevices = async () => {
    if (!selectedUser) return;
    setLoading(true);
    const res = await fetch('/api/admin/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser._id, type: deviceType, count: deviceCount })
    });
    if (res.ok) {
      setMessage(`Successfully assigned ${deviceCount} ${deviceType} devices!`);
      fetchUserDevices(selectedUser._id);
    } else {
      const err = await res.json();
      setMessage('Error: ' + err.error);
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to permanently delete this device?')) return;
    
    setLoading(true);
    const res = await fetch(`/api/admin/devices?deviceId=${deviceId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      setMessage('Device deleted successfully');
      if (selectedUser) fetchUserDevices(selectedUser._id);
    } else {
      setMessage('Failed to delete device');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <main className="container" style={{ padding: '2rem', maxWidth: '1400px' }}>
      
      {/* Header Section */}
      <header className="header" style={{ 
        marginBottom: '2.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'end',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '8px', color: 'white' }}>
              <Shield size={20} />
            </div>
            <h1 className="title" style={{ fontSize: '1.75rem', margin: 0 }}>Admin Control Center</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage users and environmental monitoring infrastructure</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            background: 'white', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Users size={20} color="var(--primary)" />
            <div>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>{users.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Users</span>
            </div>
          </div>
          
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="btn-primary"
            style={{ 
              background: '#fee2e2', 
              color: '#ef4444', 
              border: '1px solid #fecaca',
              boxShadow: 'none',
              padding: '0.75rem 1rem'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Notifications */}
      {message && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '10px',
          backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${message.includes('Error') ? '#fca5a5' : '#86efac'}`,
          color: message.includes('Error') ? '#b91c1c' : '#15803d',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <span>{message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Create User */}
        <section className="formal-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>
            <div style={{ background: '#f0f9ff', padding: '8px', borderRadius: '8px', color: '#0ea5e9' }}>
               <UserPlus size={18} /> 
            </div>
            Create Account
          </h3>
          
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Username</label>
              <input 
                type="text" 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  fontWeight: 600,
                  outline: 'none'
                }}
                placeholder="jdoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Password</label>
              <input 
                type="password" 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  fontWeight: 600,
                  outline: 'none'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.875rem' }}
            >
              {loading ? 'Creating...' : 'Create New User'}
            </button>
          </form>
        </section>

        {/* Right Column: User Management */}
        <section className="formal-card" style={{ padding: '0', overflow: 'hidden', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>User Directory</h3>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                 type="text" 
                 placeholder="Search users..." 
                 style={{ 
                   width: '100%', 
                   padding: '0.5rem 0.5rem 0.5rem 2.25rem', 
                   borderRadius: '6px', 
                   border: '1px solid var(--border-color)',
                   fontSize: '0.875rem'
                 }}
              />
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr' }}>
            
            {/* User List Sidebar */}
            <div style={{ borderRight: '1px solid var(--border-color)', overflowY: 'auto', maxHeight: '600px' }}>
              {users.map((user) => (
                <div 
                  key={user._id} 
                  style={{ 
                    padding: '1rem 1.5rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    background: selectedUser?._id === user._id ? '#eff6ff' : 'white',
                    borderLeft: selectedUser?._id === user._id ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedUser(user)}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: selectedUser?._id === user._id ? 'var(--primary)' : 'var(--text-main)' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <ChevronRight size={16} color={selectedUser?._id === user._id ? 'var(--primary)' : 'var(--text-muted)'} />
                </div>
              ))}
            </div>

            {/* Selected User Details / Actions */}
            <div style={{ padding: '2rem', background: '#fff' }}>
              {selectedUser ? (
                <div className="fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748b' }}>{selectedUser.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{selectedUser.username}</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Active</span>
                          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>User</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device List Section */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                      <Cpu size={20} /> Assigned Devices ({userDevices.length})
                    </h4>
                    
                    {userDevices.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {userDevices.map((device: any) => (
                           <div key={device.deviceId} style={{ 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'space-between',
                             padding: '0.75rem 1rem',
                             background: '#f8fafc',
                             border: '1px solid var(--border-color)',
                             borderRadius: '8px'
                           }}>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                               <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>{device.displayName}</span>
                               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {device.deviceId}</span>
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                               <span style={{ 
                                 fontSize: '0.7rem', 
                                 padding: '0.2rem 0.5rem', 
                                 background: device.type === 'RST' ? '#dbeafe' : '#fce7f3',
                                 color: device.type === 'RST' ? '#1e40af' : '#9d174d',
                                 borderRadius: '4px',
                                 fontWeight: 700
                               }}>
                                 {device.type}
                               </span>
                               <button 
                                 onClick={() => handleDeleteDevice(device.deviceId)}
                                 className="icon-btn"
                                 style={{ color: '#ef4444', padding: '0.4rem', border: '1px solid transparent' }}
                                 title="Delete Device"
                                 onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                 onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                        No devices assigned to this user.
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                      <Cpu size={20} /> Provision Hardware
                    </h4>
                    
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Assign new sensor nodes to this user account.
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Device Model</label>
                          <div style={{ position: 'relative' }}>
                             <select 
                              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', appearance: 'none', fontWeight: 600 }}
                              value={deviceType}
                              onChange={(e) => setDeviceType(e.target.value as any)}
                            >
                              <option value="RST">RST-3000 (Temp/Humidity)</option>
                              <option value="DPT">DPT-500 (Differential Pressure)</option>
                            </select>
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                           <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quantity</label>
                           <input 
                            type="number" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', fontWeight: 600 }}
                            min="1"
                            max="50"
                            value={deviceCount}
                            onChange={(e) => setDeviceCount(parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <button 
                          onClick={handleAssignDevices}
                          className="btn-primary" 
                          disabled={loading}
                          style={{ padding: '0.75rem 1.5rem', height: '46px' }}
                        >
                          {loading ? '...' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.7 }}>
                  <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Select a user from the directory to manage their devices</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
