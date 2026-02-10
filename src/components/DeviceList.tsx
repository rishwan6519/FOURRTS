'use client';

import React, { useEffect, useState } from 'react';
import { Device } from '@/types';
import DeviceCard from './DeviceCard';
import AlertSystem from './AlertSystem';

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = () => {
      // Add timestamp to prevent caching and ensure visibility changes reflect
      fetch(`/api/devices?dashboardOnly=true&t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDevices(data.map((d: any) => ({
              ...d,
              id: d.deviceId
            })));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching devices:', err);
          setLoading(false);
        });
    };

    // Initial fetch
    fetchDevices();

    // Set up polling every 10 seconds as requested
    const interval = setInterval(fetchDevices, 10000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="device-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="formal-card" style={{ height: '320px', padding: '2rem' }}>
            <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '1rem', borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '100px', width: '100%', borderRadius: '12px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '50px' }} />
          </div>
        ))}
        <style jsx>{`
          .skeleton {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="device-grid">
      <AlertSystem devices={devices} />
      {devices.map((device, index) => (
        <div key={device.id} style={{ 
          animation: `fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s backwards` 
        }}>
          <DeviceCard device={device} />
        </div>
      ))}
    </div>
  );


};

export default DeviceList;
