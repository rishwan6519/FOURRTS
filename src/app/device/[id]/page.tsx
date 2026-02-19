'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Device, HistoryEntry } from '@/types';
import SensorChart from '@/components/SensorChart';
import StatusIndicator from '@/components/StatusIndicator';
import ConfirmModal from '@/components/ConfirmModal';
import AlertSystem from '@/components/AlertSystem';
import { ArrowLeft, Clock, Calendar, Copy, CheckCircle, Smartphone, Activity, Download, RefreshCcw, Check } from 'lucide-react';

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // UI States
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deviceRes, historyRes] = await Promise.all([
          fetch(`/api/devices/${deviceId}`),
          fetch(`/api/devices/${deviceId}/history`)
        ]);

        if (deviceRes.ok) {
          const deviceData = await deviceRes.json();
          setDevice(deviceData);
        }
        
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const getBaseUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.protocol}//${window.location.host}`;
  };

  const copyExample = () => {
    const example = `${getBaseUrl()}/api/iot/update?device_code=${device?.id}&field1=24.5&field2=42.1&timestamp=`;
    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetConfirm = async () => {
    try {
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetStatus: 1 })
      });
      if (res.ok) {
        setToastMessage('Reset command transmitted successfully. Awaiting hardware acknowledgment.');
        setTimeout(() => setToastMessage(null), 5000);
        
        // Refresh local state to show 'RESET PENDING'
        const deviceRes = await fetch(`/api/devices/${deviceId}`);
        const deviceData = await deviceRes.json();
        setDevice(deviceData);
      }
    } catch (err) {
      console.error('Failed to reset device:', err);
      setToastMessage('Error: Failed to transmit reset command.');
      setTimeout(() => setToastMessage(null), 5000);
    }
  };
  

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '10rem' }}>Validating system integrity...</div>;
  if (!device) return <div className="container" style={{ textAlign: 'center', padding: '10rem' }}><h1>Access Denied: Device Not Found</h1></div>;

  return (
    <main className="container" style={{ position: 'relative', maxWidth: '1200px' }}>
      <AlertSystem devices={[device]} />
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'white',
          color: 'var(--text-main)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          borderLeft: '5px solid var(--success)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ background: '#ecfdf5', color: 'var(--success)', padding: '4px', borderRadius: '50%' }}>
            <Check size={18} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={showResetConfirm}
        title="Confirm Hardware Reset"
        message={`Are you sure you want to send a remote reset command to ${device.displayName}? This will interrupt data collection for approximately 30-60 seconds.`}
        isDestructive={true}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
      />

      {/* Breadcrumb / Top Bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button 
           onClick={() => router.push('/')} 
           style={{ 
             color: 'var(--text-muted)', 
             background: 'transparent', 
             border: 'none', 
             cursor: 'pointer', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '0.4rem', 
             fontSize: '0.85rem', 
             fontWeight: 600,
             transition: 'color 0.2s'
           }}
           onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
           onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} /> Last Received Data: {device.lastUpdate ? new Date(device.lastUpdate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }) : 'Await Connectivity...'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} /> Created: {(device as any).createdAt ? new Date((device as any).createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' }) : 'Initialising...'}
          </span>
        </div>
      </div>

      <header className="formal-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            background: 'var(--accent-light)', 
            color: 'var(--accent)', 
            padding: '1rem', 
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
             <Smartphone size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
               <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, margin: 0 }}>{device.displayName}</h1>
               <StatusIndicator lastUpdate={device.lastUpdate} lastSeen={(device as any).lastSeen} />
               {device.resetStatus === 1 && (
                 <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', padding: '0.25rem 0.6rem', fontWeight: 700 }}>RESET PENDING</span>
               )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>DEVICE ID:</span>
              <code style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 800, background: 'var(--accent-light)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{device.id}</code>
            </div>
          </div>
        </div>
        
        <div className="no-print">
          <button 
             onClick={() => setShowResetConfirm(true)}
             style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.5rem', 
               background: '#fff1f2', 
               color: '#e11d48', 
               border: '1px solid #fda4af',
               padding: '0.5rem 1rem',
               fontSize: '0.85rem',
               fontWeight: 700,
               borderRadius: '8px',
               cursor: 'pointer',
               transition: 'all 0.2s ease'
             }}
             className="hw-reset-btn"
           >
             <RefreshCcw size={14} /> Hardware Reset
           </button>
        </div>
      </header>
      
      <style jsx>{`
        .hw-reset-btn:hover {
          background: #fef2f2 !important;
          transform: translateY(-1px);
        }
      `}</style>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
           {device.sensors.map((sensor, index) => (
            <div key={sensor.field} className="formal-card" style={{ padding: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {sensor.name} Analysis
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {(device as any).lastData?.[sensor.field] ?? '--'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sensor.unit}</span>
                  </div>
               </div>
               <div style={{ height: '280px', margin: '0 -10px' }}>
                 <SensorChart 
                  data={history} 
                  sensor={sensor} 
                  color={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b'}
                />
               </div>
            </div>
          ))}
          
          <div className="formal-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Recent Events Log</h3>
             <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem' }}>Time</th>
                  {device.sensors.map(s => <th key={s.field} style={{ padding: '0.75rem' }}>{s.name}</th>)}
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-5).reverse().map((entry, i) => (
                  <tr key={i}>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                    {device.sensors.map(s => (
                      <td key={s.field} style={{ padding: '0.75rem', fontWeight: 600 }}>{entry[s.field]}</td>
                    ))}
                    <td style={{ padding: '0.75rem' }}>
                         <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.65rem', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>OK</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Technical Details */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="formal-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Alert Thresholds</h3>
             
             {device.sensors.map((sensor, idx) => (
                <div key={sensor.field} style={{ marginBottom: idx === device.sensors.length - 1 ? 0 : '1.5rem', paddingBottom: idx === device.sensors.length - 1 ? 0 : '1.5rem', borderBottom: idx === device.sensors.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Activity size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sensor.name}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Min Limit ({sensor.unit})</label>
                      <input 
                        type="number" 
                        defaultValue={sensor.min}
                        onBlur={async (e) => {
                          const val = parseFloat(e.target.value);
                          const updatedSensors = [...device.sensors];
                          updatedSensors[idx] = { ...updatedSensors[idx], min: val };
                          await fetch(`/api/devices/${deviceId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sensors: updatedSensors })
                          });
                          setToastMessage(`${sensor.name} minimum threshold updated.`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Max Limit ({sensor.unit})</label>
                      <input 
                        type="number" 
                        defaultValue={sensor.max}
                        onBlur={async (e) => {
                          const val = parseFloat(e.target.value);
                          const updatedSensors = [...device.sensors];
                          updatedSensors[idx] = { ...updatedSensors[idx], max: val };
                          await fetch(`/api/devices/${deviceId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sensors: updatedSensors })
                          });
                          setToastMessage(`${sensor.name} maximum threshold updated.`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600 }}
                      />
                    </div>
                  </div>
               </div>
             ))}
          </div>

          <div className="formal-card" style={{ padding: '1.5rem' }}>
             
             <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>DEVICE ENDPOINT</label>
                <div style={{ 
                  background: '#f8fafc', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-body)',
                  wordBreak: 'break-all'
                }}>
                  {getBaseUrl()}/api/iot/update
                </div>
             </div>

             <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>DEVICE ID</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <input 
                    readOnly 
                    value={device.id} 
                    style={{ 
                      flex: 1, 
                      background: '#f8fafc', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }} 
                   />
                   <button onClick={() => { navigator.clipboard.writeText(device.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="icon-btn" style={{ border: '1px solid var(--border-color)' }}>
                     {copied ? <Check size={14} /> : <Copy size={14} />}
                   </button>
                </div>
             </div>
             
             <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>PAYLOAD EXAMPLE</label>
                <div 
                  className="doc-code-block" 
                  style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.75rem', 
                    maxHeight: '150px', 
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  GET /api/iot/update?
                  <br />device_code=<span style={{ color: '#2563eb' }}>{device.id}</span>
                  <br />&field1=24.5
                  <br />&field2=42.1
                  <br />&timestamp=...
                </div>
                <button 
                  onClick={copyExample}
                  style={{
                     width: '100%',
                     marginTop: '0.75rem',
                     padding: '0.5rem',
                     fontSize: '0.75rem',
                     fontWeight: 600,
                     color: 'var(--accent)',
                     background: 'var(--accent-light)',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: 'pointer'
                  }}
                >
                  Copy Full URL Pattern
                </button>
             </div>
          </div>

          <div className="formal-card" style={{ padding: '1.5rem', background: '#f8fafc', borderStyle: 'dashed' }}>
             <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-body)', marginBottom: '0.5rem' }}>Need Help?</h3>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
               Check the <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Integration Guide</a> or contact IT Support if data is not syncing as expected.
             </p>
          </div>

        </div>

      </div>
    </main>
  );
}
