const Meter = require('../models/Meter');
const vendingService = require('../services/vendingService');

// @desc    Add new meter
// @route   POST /api/meters
// @access  Private
exports.addMeter = async (req, res, next) => {
  try {
    const { meterNumber, alias, address } = req.body;

    // Validate meter format
    const validation = await vendingService.validateMeter(meterNumber);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    // Check if meter already exists for this user
    const existingMeter = await Meter.findOne({ user: req.user.id, meterNumber });
    if (existingMeter) {
      return res.status(400).json({ success: false, message: 'Meter already added to your account' });
    }

    const meter = await Meter.create({
      user: req.user.id,
      meterNumber,
      alias: alias || 'My Meter',
      address,
      isValidated: true,
      customerName: validation.customerName,
      customerAddress: validation.customerAddress
    });

    res.status(201).json({
      success: true,
      meter: {
        id: meter._id,
        meterNumber: meter.meterNumber,
        alias: meter.alias,
        address: meter.address,
        isValidated: meter.isValidated,
        customerName: meter.customerName,
        createdAt: meter.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user meters
// @route   GET /api/meters
// @access  Private
exports.getMeters = async (req, res, next) => {
  try {
    const meters = await Meter.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: meters.length, meters });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meter
// @route   GET /api/meters/:id
// @access  Private
exports.getMeter = async (req, res, next) => {
  try {
    const meter = await Meter.findOne({ _id: req.params.id, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ success: false, message: 'Meter not found' });
    }
    res.json({ success: true, meter });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meter
// @route   DELETE /api/meters/:id
// @access  Private
exports.deleteMeter = async (req, res, next) => {
  try {
    const meter = await Meter.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ success: false, message: 'Meter not found' });
    }
    res.json({ success: true, message: 'Meter removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate meter
// @route   POST /api/meters/validate
// @access  Private
exports.validateMeter = async (req, res, next) => {
  try {
    const { meterNumber } = req.body;
    const validation = await vendingService.validateMeter(meterNumber);
    res.json(validation);
  } catch (error) {
    next(error);
  }
};
