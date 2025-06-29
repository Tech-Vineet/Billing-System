const InvoiceDailyLog = require('../Models/InvoiceDailyLog');

// Add/update daily log when a transaction is made
const updateInvoiceLog = async (transaction) => {
  const today = new Date().toISOString().split('T')[0];
  const logDate = new Date(today);

  const update = {
    $inc: {
      totalInvoices: 1,
      [`${transaction.mode}Invoices`]: 1,
      [`${transaction.transactionType}Invoices`]: 1
    }
  };

  await InvoiceDailyLog.updateOne(
    { date: logDate },
    update,
    { upsert: true }
  );
};

// Get all daily invoice logs
const getInvoiceLogs = async (req, res) => {
  try {
    const logs = await InvoiceDailyLog.find().sort({ date: -1 });
    res.status(200).json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  updateInvoiceLog,
  getInvoiceLogs
};
