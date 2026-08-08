const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meter',
    required: true
  },
  meterNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  units: {
    type: Number,
    default: 0
  },
  token: {
    type: String,
    default: null
  },
  paystackReference: {
    type: String,
    required: true,
    unique: true
  },
  paystackTransactionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'ussd', 'unknown'],
    default: 'unknown'
  },
  receiptUrl: {
    type: String
  },
  vendingResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ meterNumber: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
