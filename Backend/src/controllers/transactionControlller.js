const Invoice = require('../Models/Transaction');
const Item = require('../Models/Item');
const Customer = require('../Models/Customer');
const Counter = require('../Models/Counter');
const transactionValidator = require('../validators/transactionValidators');
const mongoose = require('mongoose');
const generatePdf = require('../controllers/generatepdf')

// Improved parseDate function with better error handling and debugging
// function parseDate(dateString) {
//   console.log('Received dateString:', JSON.stringify(dateString));
  
//   // Check if dateString exists and is a string
//   if (!dateString) {
//     throw new Error("Expiry date is required");
//   }
  
//   if (typeof dateString !== 'string') {
//     throw new Error(`Expiry date must be a string, received: ${typeof dateString} - ${JSON.stringify(dateString)}`);
//   }
  
//   const trimmedDate = dateString.trim();
//   console.log('Trimmed dateString:', JSON.stringify(trimmedDate));
  
//   if (!trimmedDate) {
//     throw new Error("Expiry date cannot be empty");
//   }

//   // Split by both - and / separators
//   const parts = trimmedDate.split(/[-/]/);
//   console.log('Date parts:', parts);
  
//   if (parts.length !== 3) {
//     throw new Error(`Invalid date format. Expected dd-mm-yyyy or dd/mm/yyyy, received: ${dateString}`);
//   }

//   const [dd, mm, yyyy] = parts.map(part => {
//     const num = parseInt(part, 10);
//     if (isNaN(num)) {
//       throw new Error(`Invalid date component: ${part} in date: ${dateString}`);
//     }
//     return num;
//   });

//   console.log('Parsed components:', { dd, mm, yyyy });

//   // Validate date components
//   if (dd < 1 || dd > 31) {
//     throw new Error(`Invalid day: ${dd}. Must be between 1 and 31`);
//   }
  
//   if (mm < 1 || mm > 12) {
//     throw new Error(`Invalid month: ${mm}. Must be between 1 and 12`);
//   }
  
//   if (yyyy < 1900 || yyyy > 2100) {
//     throw new Error(`Invalid year: ${yyyy}. Must be between 1900 and 2100`);
//   }

//   const parsedDate = new Date(yyyy, mm - 1, dd);
//   console.log('Final parsed date:', parsedDate);
  
//   // Check if the date is valid (handles cases like Feb 30th)
//   if (parsedDate.getDate() !== dd || parsedDate.getMonth() !== mm - 1 || parsedDate.getFullYear() !== yyyy) {
//     throw new Error(`Invalid date: ${dateString} does not represent a valid calendar date`);
//   }

//   return parsedDate;
// }

const path = require('path');
const fs = require('fs');

const createInvoice = async (req, res) => {
  try {
    const { mode, b2bCustomerId, b2cCustomer, items } = req.body;

    if (!mode || !items?.length) {
      return res.status(400).json({ success: false, message: "Mode and items are required" });
    }

    const counter = await Counter.findOneAndUpdate(
      { name: 'invoice' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    let customerDetails = {};
    let customerRef = null;

    if (mode === 'b2b') {
      const customer = await Customer.findById(b2bCustomerId);
      if (!customer) throw new Error('Invalid B2B customer ID');

      customerDetails = {
        businessName: customer.businessName,
        gstNumber: customer.gstNumber,
        address: customer.address,
        contactPerson: customer.contactPerson,
        contactNumber: customer.contactNumber,
        email: customer.email
      };

      customerRef = customer._id;
    } else {
      customerDetails = b2cCustomer || {};
    }

    const calculatedItems = [];
    let totalAmount = 0, gstAmount = 0;

    for (const i of items) {
      const item = await Item.findById(i.itemId);
      const batch = item?.batches.find(b => b.batchNumber === i.batchNumber);
      if (!item || !batch) throw new Error("Invalid item or batch");

      if (batch.stockQuantity < i.quantity) throw new Error(`Insufficient stock`);

      const basePrice = batch.price * i.quantity;
      const gst = (basePrice * (item.gstRate || 0)) / 100;
      const discount = (batch.discount || 0) * i.quantity;

      totalAmount += basePrice;
      gstAmount += gst;

      batch.stockQuantity -= i.quantity;
      await item.save();

      calculatedItems.push({
        itemId: item._id,
        itemName: item.name,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: i.quantity,
        price: batch.price,
        gst: item.gstRate || 0,
        discount: batch.discount || 0,
        quantityType: "unit"
      });
    }

    const finalAmount = totalAmount + gstAmount;

    const invoice = await Invoice.create({
      billNo: counter.seq,
      transactionType: "sell",
      mode,
      b2bCustomer: mode === 'b2b' ? customerRef : undefined,
      b2cCustomer: mode === 'b2c' ? customerDetails : undefined,
      items: calculatedItems,
      totalAmount,
      gstAmount,
      finalAmount
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('b2bCustomer', 'businessName gstNumber contactPerson contactNumber address email');

    // ✅ Generate and save PDF to /public/invoices
    const fileName = `invoice-${invoice._id}.pdf`;
    const filePath = path.join(__dirname, '..', 'public', 'invoices', fileName);

    await generatePdf(populatedInvoice, filePath);

    // ✅ Respond with public URL
    res.status(200).json({
      success: true,
      message: 'Invoice created and PDF generated',
      invoiceId: invoice._id,
      pdfUrl: `/invoices/${fileName}`  // can be opened in new tab by frontend
    });

  } catch (err) {
    console.error("Invoice creation error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};



// Get Transaction History for B2B Customer
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("b2bCustomer");

    const formattedInvoices = invoices.map((invoice) => {
      let customer = null;

      if (invoice.mode === "b2b" && invoice.b2bCustomer) {
        customer = {
          name: invoice.b2bCustomer.businessName,
          gstNumber: invoice.b2bCustomer.gstNumber,
          contact: invoice.b2bCustomer.contactNumber,
          address: invoice.b2bCustomer.address,
        };
      } else if (invoice.mode === "b2c" && invoice.b2cCustomer?.name) {
        customer = invoice.b2cCustomer;
      }

      return {
        _id: invoice._id,
        billNo: invoice.billNo,
        date: invoice.date,
        totalAmount: invoice.totalAmount,
        finalAmount: invoice.finalAmount,
        customer,
        pdfUrl: `/invoices/invoice-${invoice._id}.pdf` // static path to PDF
      };
    });

    res.status(200).json(formattedInvoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search Transactions
const searchTransactions = async (req, res) => {
  try {
    const { billNo, b2bCustomer, startDate, endDate, transactionType, mode } = req.query;
    const query = {};

    // Build search query
    if (billNo) {
      const billNumber = Number(billNo);
      if (isNaN(billNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bill number format'
        });
      }
      query.billNo = billNumber;
    }

    if (b2bCustomer) {
      if (!mongoose.Types.ObjectId.isValid(Customer)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer ID format'
        });
      }
      query.Customer = Customer;
    }

    if (transactionType && ['buy', 'sell'].includes(transactionType)) {
      query.transactionType = transactionType;
    }

    if (mode && ['b2b', 'b2c'].includes(mode)) {
      query.mode = mode;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid start date format'
          });
        }
        query.date.$gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end date format'
          });
        }
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    console.log('Search query:', JSON.stringify(query, null, 2));

    const results = await Transaction.find(query)
      .populate('Customer', 'businessName contactPerson contactNumber')
      .sort({ date: -1 });

    res.status(200).json({ 
      success: true, 
      results,
      count: results.length,
      query: req.query
    });
    
  } catch (err) {
    console.error('Search transactions error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get single transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    const transaction = await Transaction.findById(transactionId)
      .populate('Customer', 'businessName gstNumber contactPerson contactNumber email address');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });

  } catch (err) {
    console.error('Get transaction by ID error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  searchTransactions,
  getTransactionById
};
