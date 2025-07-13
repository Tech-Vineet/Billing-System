// // validators/transactionValidator.js
// const { z } = require('zod');
// const mongoose = require('mongoose');

// // Custom validator for MongoDB ObjectId
// const objectId = z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
//   message: 'Invalid ObjectId',
// });

// // Regex patterns
// const nameRegex = /^[A-Za-z\s]{2,50}$/;
// const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
// const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// const transactionSchema = z.object({
//   transactionType: z.enum(['buy', 'sell']),
//   mode: z.enum(['b2b', 'b2c']),

//   b2bCustomer: z.optional(objectId),

//   b2cCustomer: z.optional(z.object({
//     name: z.string().regex(nameRegex, { message: 'Name must contain only letters and spaces' }),
//     contact: z.string().regex(phoneRegex, { message: 'Invalid contact number' }),
//   })),

//   items: z.array(z.object({
//     itemId: objectId,
//     quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
//     expiryDate: z.string().min(1, "Expiry date is required")
//     price: z.number().min(0, { message: 'Price cannot be negative' }),
//     gst: z.number().min(0).max(100, { message: 'GST must be between 0 and 100' }),
//     discount: z.number().min(0).max(100, { message: 'Discount must be between 0 and 100' }),
//   })).min(1, { message: 'At least one item is required' }),
// });

// transactionValidators.js
const { z } = require('zod');

const itemSchema = z.object({
  itemId: z.string().min(1, { message: "Item ID is required" }),
  itemName: z.string().optional(), // Optional since it's filled from DB
  batchNumber: z.string().min(1, { message: "Batch number is required" }),
  expiryDate: z.string().min(1, { message: "Expiry date is required" }),
  quantity: z.number().positive({ message: "Quantity must be positive" }),
  price: z.number().min(0, { message: "Price cannot be negative" }),
  gst: z.number().min(0, { message: "GST cannot be negative" }).max(100, { message: "GST cannot exceed 100%" }),
  discount: z.number().min(0, { message: "Discount cannot be negative" }).default(0)
});

const transactionValidator = z.object({
  billNo: z.number().optional(), // Optional since it's generated
  transactionType: z.enum(['buy', 'sell'], {
    errorMap: () => ({ message: "Transaction type must be 'buy' or 'sell'" })
  }),
  mode: z.enum(['b2b', 'b2c'], {
    errorMap: () => ({ message: "Mode must be 'b2b' or 'b2c'" })
  }),
  b2bCustomer: z.string().optional(), // Required when mode is b2b
  b2cCustomer: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional()
  }).optional(),
  items: z.array(itemSchema).min(1, { message: "At least one item is required" }),
  totalAmount: z.number().optional(), // Optional since it's calculated
  gstAmount: z.number().optional(), // Optional since it's calculated
  finalAmount: z.number().optional() // Optional since it's calculated
}).refine((data) => {
  // Custom validation: b2bCustomer is required when mode is 'b2b'
  if (data.mode === 'b2b' && !data.b2bCustomer) {
    return false;
  }
  return true;
}, {
  message: "B2B customer is required when mode is 'b2b'",
  path: ['b2bCustomer']
});

module.exports = transactionValidator;



