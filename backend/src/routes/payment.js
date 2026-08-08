const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');
const {
  initializePayment,
  verifyPayment,
  webhook,
  getHistory,
  getTransaction,
  downloadReceipt
} = require('../controllers/paymentController');

router.post('/initialize', protect, paymentLimiter, initializePayment);
router.get('/verify/:reference', verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);
router.get('/history', protect, getHistory);
router.get('/transactions/:id', protect, getTransaction);
router.get('/transactions/:id/receipt', protect, downloadReceipt);

module.exports = router;
