import React from 'react';

interface StatusIndicatorProps {
  lastUpdate: string;
  lastSeen?: string;
}

export default function StatusIndicator({ lastUpdate }: StatusIndicatorProps): React.ReactElement {
  // Only use the data timestamp (lastUpdate) to determine if the device is active
  if (!lastUpdate) {
    return (
      <div className="status-badge" style={{ padding: '0.25rem 0.6rem', fontSize: '0.6rem', background: '#f1f5f9', color: '#64748b' }}>
        <span className="dot" style={{ width: '6px', height: '6px', background: '#94a3b8' }} />
        NEVER SYNCED
      </div>
    );
  }

  const checkTime = new Date(lastUpdate).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - checkTime) / (1000 * 60);
  const online = diffMinutes <= 15;

  return (
    <div className={`status-badge ${online ? 'status-online' : 'status-offline'}`} style={{ padding: '0.25rem 0.6rem', fontSize: '0.6rem' }}>
      <span className={`dot ${online ? 'dot-online' : 'dot-offline'}`} style={{ width: '6px', height: '6px' }} />
      {online ? 'Online' : 'Offline'}
    </div>
  );
}
