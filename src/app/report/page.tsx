'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Device, HistoryEntry } from '@/types';
import { ArrowLeft, Printer, FileDown, Calendar as CalIcon } from 'lucide-react';
import { 
  format, 
  subDays, 
  startOfDay, 
  endOfDay, 
  isWithinInterval, 
  parseISO
} from 'date-fns';

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deviceId = searchParams.get('id');

  const [device, setDevice] = useState<Device | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  // Form State
  const [dateRange, setDateRange] = useState('today');
  const [customStart, setCustomStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [interval, setInterval] = useState('1h');
  const [filteredData, setFilteredData] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!deviceId) return;
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
  }, [deviceId]);

  const generateReport = () => {
    let start = startOfDay(new Date());
    let end = endOfDay(new Date());

    if (dateRange === 'yesterday') {
      start = startOfDay(subDays(new Date(), 1));
      end = endOfDay(subDays(new Date(), 1));
    } else if (dateRange === '7days') {
      start = startOfDay(subDays(new Date(), 7));
    } else if (dateRange === '14days') {
      start = startOfDay(subDays(new Date(), 14));
    } else if (dateRange === '30days') {
      start = startOfDay(subDays(new Date(), 30));
    } else if (dateRange === 'custom') {
      start = startOfDay(parseISO(customStart));
      end = endOfDay(parseISO(customEnd));
    }

    const intervalMinutes = {
      '5m': 5, '10m': 10, '15m': 15, '30m': 30, '1h': 60, '6h': 360, '12h': 720, '24h': 1440
    }[interval] || 60;

    // Filter history to the selected range
    const rangeHistory = history.filter(h => {
      const t = new Date(h.timestamp).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });

    if (rangeHistory.length === 0) {
      setFilteredData([]);
      setShowReport(true);
      return;
    }

    // NEW APPROACH: Show only ONE record per interval bucket
    const groupedData: { [key: string]: HistoryEntry } = {};

    rangeHistory.forEach(record => {
      const recordTime = new Date(record.timestamp);
      
      // Calculate the nearest interval boundary (floor to the interval start)
      const normalizedTime = new Date(recordTime);
      const minutes = recordTime.getMinutes();
      const normalizedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
      normalizedTime.setMinutes(normalizedMinutes, 0, 0);
      
      const key = normalizedTime.toISOString();
      
      // Keep the first record found for each bucket
      if (!groupedData[key]) {
        groupedData[key] = {
          ...record,
          timestamp: key
        };
      }
    });

    const sampled = Object.values(groupedData).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    setFilteredData(sampled);
    setShowReport(true);
  };

  if (loading) return <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>Loading...</div>;
  if (!device) return <div className="container" style={{ textAlign: 'center', padding: '10rem' }}>Device not found</div>;

  if (showReport) {
    return (
      <main className="report-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
        <div className="no-print" style={{ maxWidth: '1000px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'flex-start' }}>
          <button className="back-btn" onClick={() => setShowReport(false)} style={{ color: 'var(--primary)' }}>
            <ArrowLeft size={16} /> Back to Selection
          </button>
        </div>

        {/* PRINTABLE REPORT CONTAINER */}
        <div className="report-paper formal-card" style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          background: 'white', 
          padding: '4rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          borderRadius: '2px'
        }}>
          {/* CORPORATE HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #000', paddingBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '0.05em' }}>
              FOURRTS (INDIA) LABORATORIES PVT.LIMITED
            </h1>
            <p style={{ fontSize: '1rem', color: '#475569', margin: '0.25rem 0', fontWeight: 600 }}>Kelambakkam - 603 103</p>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {device.sensors.length > 1 ? 'Temperature and RH Report' : 'Differential Pressure Report'}
            </h2>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginTop: '0.75rem' }}>
               Location: {device.displayName} [{device.id}]
            </p>
          </div>

          {/* AUDIT TIMESTAMPS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
            <div>Start Date/Time: <span style={{ fontWeight: 800, color: '#1e293b' }}>{filteredData.length > 0 ? format(parseISO(filteredData[0].timestamp), 'dd/MM/yyyy HH:mm:ss') : '-'}</span></div>
            <div style={{ textAlign: 'center' }}>End Date/Time: <span style={{ fontWeight: 800, color: '#1e293b' }}>{filteredData.length > 0 ? format(parseISO(filteredData[filteredData.length - 1].timestamp), 'dd/MM/yyyy HH:mm:ss') : '-'}</span></div>
            <div style={{ textAlign: 'right' }}>Generated On: <span style={{ fontWeight: 800, color: '#1e293b' }}>{format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</span></div>
          </div>

          {/* DATA TABLE */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: '1.5px solid #000',
            marginBottom: '6rem'
          }}>
            <thead>
              <tr style={{ background: '#fff' }}>
                <th style={{ border: '1px solid #000', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 800, width: '60px', color: '#1e293b' }}>Sl.No</th>
                <th style={{ border: '1px solid #000', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Date</th>
                <th style={{ border: '1px solid #000', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Time</th>
                {device.sensors.map(s => (
                  <th key={s.field} style={{ border: '1px solid #000', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                    {s.name} ({s.unit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((entry, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #000', padding: '0.6rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '0.6rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{format(parseISO(entry.timestamp), 'dd/MM/yyyy')}</td>
                  <td style={{ border: '1px solid #000', padding: '0.6rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{format(parseISO(entry.timestamp), 'HH:mm:ss')}</td>
                  {device.sensors.map(s => (
                    <td key={s.field} style={{ border: '1px solid #000', padding: '0.6rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                      {entry[s.field] ?? '-'}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={3 + device.sensors.length} style={{ border: '1px solid #000', padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '1rem', fontStyle: 'italic' }}>
                    No data available for the selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* SIGNATURE SECTION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '200px', borderBottom: '1px solid #475569', marginBottom: '0.75rem' }}></div>
              <p style={{ margin: 0, fontWeight: 700, color: '#334155' }}>Checked By:</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '200px', borderBottom: '1px solid #475569', marginBottom: '0.75rem' }}></div>
              <p style={{ margin: 0, fontWeight: 700, color: '#334155' }}>Approved By:</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS (HIDDEN ON PRINT) */}
        <div className="no-print" style={{ 
          maxWidth: '1000px', 
          margin: '2rem auto 0 auto', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem' 
        }}>
          <button 
            className="btn-primary" 
            style={{ background: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }} 
            onClick={() => setShowReport(false)}
          >
             <ArrowLeft size={16} /> Back
          </button>
          <button 
            className="btn-primary" 
            style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }} 
            onClick={() => window.print()}
          >
            <Printer size={16} /> Print
          </button>
          <button 
            className="btn-primary" 
            style={{ background: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }} 
            onClick={() => window.print()}
          >
            <FileDown size={16} /> Save as PDF
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container no-print" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '2rem 0' }}>
        <button className="back-btn" onClick={() => router.push('/')} style={{ color: 'var(--accent)' }}>
          <ArrowLeft size={18} /> Return to Dashboard
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="formal-card" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
          
          <div style={{ 
            background: 'linear-gradient(135deg, var(--bg-body) 0%, #ffffff 100%)', 
            padding: '3rem 2rem', 
            borderBottom: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'var(--accent-light)', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--accent)'
            }}>
              <CalIcon size={30} strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem', lineHeight: 1.2 }}>Compliance Reporting</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
              Generate validated audit trails for regulatory compliance and internal quality control.
            </p>
          </div>

          <div style={{ padding: '2.5rem' }}>
            
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>TARGET SENSOR NODE</label>
              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem 1.25rem', 
                borderRadius: '10px', 
                border: '1px solid var(--border-color)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                  <span style={{ fontWeight: 700, color: 'var(--text-body)', fontSize: '1rem' }}>{device.displayName}</span>
                </div>
                <code style={{ background: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{device.id}</code>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>REPORT PERIOD</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="form-control" 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem', 
                      borderRadius: '10px', 
                      border: '1px solid var(--border-color)',
                      appearance: 'none',
                      background: 'white',
                      fontWeight: 600,
                      color: 'var(--text-body)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="today">Today (Active)</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="14days">Last 14 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="custom">Custom Range...</option>
                  </select>
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>DATA RESOLUTION</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="form-control" 
                    value={interval} 
                    onChange={(e) => setInterval(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem', 
                      borderRadius: '10px', 
                      border: '1px solid var(--border-color)',
                      appearance: 'none',
                      background: 'white',
                      fontWeight: 600,
                      color: 'var(--text-body)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="6h">6 Hours</option>
                    <option value="12h">12 Hours</option>
                    <option value="24h">24 Hours</option>
                  </select>
                   <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

            </div>

            {dateRange === 'custom' && (
              <div style={{ 
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '1.5rem',
                marginBottom: '2rem',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>From Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      value={customStart} 
                      onChange={(e) => setCustomStart(e.target.value)} 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>To Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      value={customEnd} 
                      onChange={(e) => setCustomEnd(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              className="btn-primary" 
              style={{ 
                width: '100%', 
                padding: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem', 
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '10px',
                marginTop: '1rem',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onClick={generateReport}
            >
              <FileDown size={20} /> Generate Validation Report
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="container">Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}
