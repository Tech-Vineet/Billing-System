const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  searchTransactions
} = require('../controllers/transactionControlller')

router.post('/create', createInvoice);
router.get('/getall', getAllInvoices);
router.get('/search', searchTransactions);

module.exports = router;
