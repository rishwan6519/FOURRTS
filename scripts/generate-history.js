const fs = require('fs');
const path = require('path');

const devices = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/devices.json'), 'utf8'));

const history = {};

const now = new Date();
const POINTS = 100;
const INTERVAL_MINUTES = 5;

devices.forEach(device => {
  const deviceHistory = [];
  const baseTime = new Date(now);

  for (let i = 0; i < POINTS; i++) {
    const time = new Date(baseTime.getTime() - i * INTERVAL_MINUTES * 60 * 1000);
    const entry = {
      timestamp: time.toISOString(),
    };

    device.sensors.forEach(sensor => {
      // Generate some realistic-ish data
      const range = sensor.max - sensor.min;
      const value = sensor.min + Math.random() * range;
      entry[sensor.field] = parseFloat(value.toFixed(2));
    });

    deviceHistory.push(entry);
  }

  history[device.id] = deviceHistory.reverse(); // Older first
});

fs.writeFileSync(
  path.join(__dirname, '../public/data/history.json'),
  JSON.stringify(history, null, 2)
);

// Update devices lastUpdate
devices.forEach(d => {
  d.lastUpdate = now.toISOString();
});

fs.writeFileSync(
  path.join(__dirname, '../public/data/devices.json'),
  JSON.stringify(devices, null, 2)
);

console.log('History data generated and device timestamps updated successfully.');
