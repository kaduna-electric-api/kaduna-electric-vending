const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addMeter,
  getMeters,
  getMeter,
  deleteMeter,
  validateMeter
} = require('../controllers/meterController');

router.post('/', protect, addMeter);
router.get('/', protect, getMeters);
router.get('/:id', protect, getMeter);
router.delete('/:id', protect, deleteMeter);
router.post('/validate', protect, validateMeter);

module.exports = router;
