import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['RST', 'DPT'],
    required: true,
  },
  sensors: [
    {
      field: String,
      name: String,
      unit: String,
      min: Number,
      max: Number,
    }
  ],
  lastData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  showOnDashboard: {
    type: Boolean,
    default: true,
  },
  resetStatus: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Device || mongoose.model('Device', DeviceSchema);
