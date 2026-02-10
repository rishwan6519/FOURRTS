export type DeviceType = 'RST' | 'DPT';

export interface SensorField {
  field: string;
  name: string;
  unit: string;
  min?: number;
  max?: number;
}

export interface Device {
  id: string;
  displayName: string;
  type: DeviceType;
  sensors: SensorField[];
  lastUpdate: string;
  owner?: string; // User ID
  resetStatus?: number; // 0 = normal, 1 = reset pending
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface HistoryEntry {
  timestamp: string;
  [key: string]: any;
}

export interface DeviceHistory {
  [deviceId: string]: HistoryEntry[];
}
