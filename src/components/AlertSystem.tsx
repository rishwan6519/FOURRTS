'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { Device } from '@/types';

interface AlertSystemProps {
  devices: Device[];
}

export default function AlertSystem({ devices }: AlertSystemProps) {
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Path to beep sound in public folder
  const BEEP_SOUND = "/beep.wav";

  useEffect(() => {
    const currentAlerts: string[] = [];
    
    devices.forEach(device => {
      const latestData = (device as any).lastData || {};
      device.sensors.forEach(sensor => {
        const value = latestData[sensor.field];
        if (value !== undefined && value !== null) {
          if (value < (sensor.min ?? -Infinity) || value > (sensor.max ?? Infinity)) {
            currentAlerts.push(`${device.displayName}: ${sensor.name} is ${value}${sensor.unit} (Limit: ${sensor.min}-${sensor.max})`);
          }
        }
      });
    });

    // Check for NEW alerts to play sound
    const newAlerts = currentAlerts.filter(a => !activeAlerts.includes(a) && !dismissedAlerts.includes(a));
    if (newAlerts.length > 0) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
    }

    setActiveAlerts(currentAlerts);
  }, [devices]);

  const displayedAlerts = activeAlerts.filter(a => !dismissedAlerts.includes(a));

  if (displayedAlerts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '350px'
    }}>
      <audio ref={audioRef} src={BEEP_SOUND} />
      
      {displayedAlerts.map((alert, idx) => (
        <div key={idx} style={{
          background: 'var(--error)',
          color: 'white',
          padding: '1rem',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          animation: 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.5rem',
            borderRadius: '10px'
          }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Value Out of Range</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{alert}</p>
          </div>
          <button 
            onClick={() => setDismissedAlerts(prev => [...prev, alert])}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '1'}
            onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
          >
            <X size={18} />
          </button>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
