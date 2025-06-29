const Transaction = require('../Models/Transaction');
const TotalSales = require('../Models/totalSales');



const getSalesSummaryByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date is required" });

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const summary = await TotalSales.findOne({ date: targetDate });
    if (!summary) return res.status(404).json({ success: false, message: "No summary found" });

    res.status(200).json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST or UPDATE daily summary (admin only)
const updateDailySales = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ success: false, message: "Date is required" });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const salesData = await Transaction.aggregate([
      { $match: { transactionType: 'sell', date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: '$mode',
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          gstAmount: { $sum: '$gstAmount' },
          finalAmount: { $sum: '$finalAmount' },
        }
      }
    ]);

    const summary = {
      date: start,
      b2bSales: { totalTransactions: 0, totalAmount: 0, gstAmount: 0, finalAmount: 0 },
      b2cSales: { totalTransactions: 0, totalAmount: 0, gstAmount: 0, finalAmount: 0 },
      grandTotal: { totalTransactions: 0, totalAmount: 0, gstAmount: 0, finalAmount: 0 }
    };

    salesData.forEach(s => {
      const mode = s._id === 'b2b' ? 'b2bSales' : 'b2cSales';
      summary[mode] = {
        totalTransactions: s.totalTransactions,
        totalAmount: s.totalAmount,
        gstAmount: s.gstAmount,
        finalAmount: s.finalAmount,
      };

      summary.grandTotal.totalTransactions += s.totalTransactions;
      summary.grandTotal.totalAmount += s.totalAmount;
      summary.grandTotal.gstAmount += s.gstAmount;
      summary.grandTotal.finalAmount += s.finalAmount;
    });

    const updated = await TotalSales.findOneAndUpdate(
      { date: start },
      summary,
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, summary: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSalesSummaryByDate,
  updateDailySales
};
