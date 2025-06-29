const express = require('express');
const router = express.Router();
const { authenticateUser, adminOnly } = require('../middlewares/authMiddleware');
const {
  getSalesSummaryByDate,
  updateDailySales
} = require('../controllers/totalSalesApi');

router.get('/totalsales', authenticateUser, getSalesSummaryByDate);
router.post('/totalsales/update', authenticateUser, adminOnly, updateDailySales);

module.exports = router;
