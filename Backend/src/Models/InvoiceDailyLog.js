const mongoose = require('mongoose');

const invoiceLogSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalInvoices: { type: Number, default: 0 },
  b2bInvoices: { type: Number, default: 0 },
  b2cInvoices: { type: Number, default: 0 },
  buyInvoices: { type: Number, default: 0 },
  sellInvoices: { type: Number, default: 0 },
});

module.exports = mongoose.model('InvoiceDailyLog', invoiceLogSchema);
