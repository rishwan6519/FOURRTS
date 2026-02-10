import React from 'react';

interface StatusIndicatorProps {
  lastUpdate: string;
  lastSeen?: string;
}

export default function StatusIndicator({ lastUpdate, lastSeen }: StatusIndicatorProps): React.ReactElement {
  // Use lastSeen for actual connection status, fallback to lastUpdate for older records
  const checkTime = lastSeen ? new Date(lastSeen).getTime() : new Date(lastUpdate).getTime();
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
