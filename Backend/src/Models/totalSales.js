const mongoose = require('mongoose');

const salesSummarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },

  b2bSales: {
    totalTransactions: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
  },

  b2cSales: {
    totalTransactions: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
  },

  grandTotal: {
    totalTransactions: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
  }
});

module.exports = mongoose.model('TotalSales', salesSummarySchema);
