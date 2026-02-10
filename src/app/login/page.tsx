'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User as UserIcon, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const user = await res.json();
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #dbeafe 100%)',
      padding: '1rem'
    }}>
      <div className="formal-card" style={{ 
        padding: '3rem', 
        width: '100%', 
        maxWidth: '420px',
        background: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 15px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(135deg, var(--primary), #1e40af)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
          }}>
            <ShieldCheck color="white" size={32} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2, letterSpacing: '-0.02em' }}>FOURRTS</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 500 }}>Secure Enterprise Gateway</p>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            background: '#fef2f2', 
            border: '1px solid #fee2e2', 
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <UserIcon size={18} />
              </div>
              <input 
                type="text" 
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem 0.875rem 2.75rem', 
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.95rem',
                  color: '#1e293b',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem 0.875rem 2.75rem', 
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.95rem',
                  color: '#1e293b',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ 
              marginTop: '0.5rem', 
              justifyContent: 'center', 
              width: '100%', 
              background: 'linear-gradient(135deg, var(--primary), #2563eb)', 
              color: 'white',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            {loading ? 'Authenticating...' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogIn size={20} /> Sign In
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
