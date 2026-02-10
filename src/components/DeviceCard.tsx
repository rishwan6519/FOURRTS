/// <reference types="react" />
'use client';

import React, { MouseEvent } from 'react';
import { Device } from '@/types';
import StatusIndicator from './StatusIndicator';
import { Thermometer, Droplets, Activity, ChevronRight, FileText, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const router = useRouter();
  const latestData = (device as any).lastData || {};

  const handleReportClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/report?id=${device.id}`);
  };

  const getAlertStatus = (sensor: any) => {
    const value = latestData[sensor.field];
    if (value === undefined || value === null) return false;
    return value < sensor.min || value > sensor.max;
  };

  const hasAnyAlert = device.sensors.some(sensor => getAlertStatus(sensor));

  const getIcon = (name: string, isAlert: boolean) => {
    const iconSize = 14;
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('temperature')) return <Thermometer size={iconSize} />;
    if (lowerName.includes('humidity')) return <Droplets size={iconSize} />;
    return <Activity size={iconSize} />;
  };

  return (
    <div className="formal-card" style={{ 
      minHeight: '200px',
      padding: '1rem',
      border: hasAnyAlert ? '1px solid var(--error)' : '1px solid var(--border-color)',
      boxShadow: hasAnyAlert ? '0 0 0 2px var(--error-bg)' : 'var(--shadow-sm)'
    }}>
      {/* Header - Super Clean */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <div style={{
            background: hasAnyAlert ? 'var(--error)' : 'var(--accent)',
            color: 'white',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex'
          }}>
            <Smartphone size={14} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>{device.displayName}</h3>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>{device.id}</p>
          </div>
        </div>
        <StatusIndicator lastUpdate={device.lastUpdate} lastSeen={(device as any).lastSeen} />
      </div>

      {/* Sensors - Simplified */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {device.sensors.map(sensor => {
          const isAlert = getAlertStatus(sensor);
          return (
            <div key={sensor.field} style={{
              background: isAlert ? 'var(--error-bg)' : 'var(--bg-app)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: isAlert ? 'var(--error)' : 'var(--accent)', display: 'flex' }}>
                  {getIcon(sensor.name, isAlert)}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isAlert ? 'var(--error)' : 'var(--text-main)' }}>
                  {sensor.name}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isAlert ? 'var(--error)' : 'var(--primary)' }}>
                  {latestData[sensor.field] ?? '--'}
                  <span style={{ fontSize: '0.6rem', color: isAlert ? 'var(--error)' : 'var(--text-muted)', marginLeft: '0.1rem', fontWeight: 600 }}>{sensor.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <button onClick={handleReportClick} style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          padding: '2px'
        }}>
          <FileText size={12} />
        </button>

        <Link href={`/device/${device.id}`} style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'var(--accent)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          transition: 'background 0.2s'
        }} className="hover-accent">
          DETAILS <ChevronRight size={10} />
        </Link>
      </div>

      <style jsx>{`
        .hover-accent:hover {
          background: var(--accent-light);
        }
      `}</style>
    </div>
  );
};




export default DeviceCard;
