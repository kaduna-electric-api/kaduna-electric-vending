const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meterNumber: {
    type: String,
    required: [true, 'Meter number is required'],
    trim: true
  },
  meterType: {
    type: String,
    enum: ['prepaid', 'postpaid'],
    default: 'prepaid'
  },
  disco: {
    type: String,
    default: 'Kaduna Electric'
  },
  address: {
    type: String,
    trim: true
  },
  alias: {
    type: String,
    trim: true,
    default: 'My Meter'
  },
  isValidated: {
    type: Boolean,
    default: false
  },
  customerName: {
    type: String,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate meters per user
meterSchema.index({ user: 1, meterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Meter', meterSchema);
