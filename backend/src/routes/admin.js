const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboard,
  getUsers,
  getTransactions,
  getMeters,
  updateUser
} = require('../controllers/adminController');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users', protect, adminOnly, getUsers);
router.get('/transactions', protect, adminOnly, getTransactions);
router.get('/meters', protect, adminOnly, getMeters);
router.put('/users/:id', protect, adminOnly, updateUser);

module.exports = router;
