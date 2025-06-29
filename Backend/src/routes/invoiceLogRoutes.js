const express = require('express');
const router = express.Router();
const { getInvoiceLogs } = require('../controllers/invoiceLogController');
const { userAuth, adminOnly } = require('../middlewares/authMiddleware');

router.get('/invoice-logs', userAuth, adminOnly, getInvoiceLogs);

module.exports = router;
