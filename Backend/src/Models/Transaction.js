const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },

  quantity: { type: Number, required: true },
  quantityType: { type: String, enum: ['unit', 'pack', 'box'], required: true },

  price: { type: Number, required: true },       // Price per unit
  gst: { type: Number, default: 0 },             // % GST
  discount: { type: Number, default: 0 },        // per unit discount
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  billNo: { type: Number, unique: true, required: true },
  transactionType: { type: String, enum: ['sell'], default: 'sell' },
  mode: { type: String, enum: ['b2b', 'b2c'], required: true },
  

  // B2B: send only customer ID
b2bCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },


  // B2C: fill manually
  b2cCustomer: {
    name: { type: String },
    contact: { type: String },
    doctor: { type: String },
    age: { type: Number }
  },

  items: [invoiceItemSchema],

  totalAmount: { type: Number, required: true },   // subtotal before gst/discount
  gstAmount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },   // total + gst - discount

  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', invoiceSchema);

