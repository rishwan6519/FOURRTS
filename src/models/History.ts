import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

export default mongoose.models.History || mongoose.model('History', HistorySchema);
