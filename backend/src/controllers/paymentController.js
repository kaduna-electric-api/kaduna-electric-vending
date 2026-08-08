const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Meter = require('../models/Meter');
const User = require('../models/User');
const paystackService = require('../services/paystackService');
const vendingService = require('../services/vendingService');
const notificationService = require('../services/notificationService');
const receiptGenerator = require('../utils/generateReceipt');

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private
exports.initializePayment = async (req, res, next) => {
  try {
    const { meterId, amount } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum amount is ₦100' });
    }
    if (amount > 500000) {
      return res.status(400).json({ success: false, message: 'Maximum amount is ₦500,000' });
    }

    // Get meter
    const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ success: false, message: 'Meter not found' });
    }

    // Initialize Paystack payment
    const paystackResponse = await paystackService.initializePayment(
      req.user.email,
      amount,
      {
        meter_id: meterId,
        meter_number: meter.meterNumber,
        user_id: req.user.id.toString(),
        user_name: `${req.user.firstName} ${req.user.lastName}`,
        user_phone: req.user.phone
      }
    );

    if (!paystackResponse.status) {
      return res.status(400).json({ success: false, message: paystackResponse.message });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      meter: meterId,
      meterNumber: meter.meterNumber,
      amount,
      paystackReference: paystackResponse.data.reference,
      status: 'pending'
    });

    res.json({
      success: true,
      authorization_url: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      transactionId: transaction._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment (callback)
// @route   GET /api/payments/verify/:reference
// @access  Public (called by frontend after redirect)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const verification = await paystackService.verifyTransaction(reference);

    if (!verification.status || verification.data.status !== 'success') {
      await Transaction.findOneAndUpdate(
        { paystackReference: reference },
        { status: 'failed' }
      );
      return res.json({ success: false, message: 'Payment verification failed', status: verification.data?.status });
    }

    // Check if already processed
    const existingTransaction = await Transaction.findOne({ paystackReference: reference });
    if (!existingTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (existingTransaction.status === 'success') {
      return res.json({
        success: true,
        message: 'Payment already processed',
        transaction: existingTransaction
      });
    }

    // Update transaction with Paystack data
    await Transaction.findOneAndUpdate(
      { paystackReference: reference },
      {
        status: 'processing',
        paystackTransactionId: verification.data.id,
        paymentMethod: verification.data.channel
      }
    );

    // Call vending API to generate token
    const vendingResult = await vendingService.vendToken({
      meterNumber: existingTransaction.meterNumber,
      amount: existingTransaction.amount,
      phone: req.user?.phone || verification.data.customer.phone
    });

    if (!vendingResult.success) {
      await Transaction.findOneAndUpdate(
        { paystackReference: reference },
        { status: 'failed' }
      );
      return res.status(500).json({ success: false, message: 'Token generation failed. Please contact support.' });
    }

    // Update transaction with token
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { paystackReference: reference },
      {
        status: 'success',
        token: vendingResult.token,
        units: vendingResult.units,
        vendingResponse: vendingResult.rawResponse,
        completedAt: new Date()
      },
      { new: true }
    );

    // Get user for notifications
    const user = await User.findById(existingTransaction.user);

    // Send notifications
    await notificationService.sendTokenEmail(user, updatedTransaction);
    await notificationService.sendTokenSMS(user.phone, vendingResult.token, existingTransaction.meterNumber);

    // Generate receipt
    try {
      const receipt = await receiptGenerator.generateReceipt(updatedTransaction, user);
      await Transaction.findOneAndUpdate(
        { paystackReference: reference },
        { receiptUrl: receipt.filename }
      );
    } catch (receiptError) {
      console.error('Receipt generation error:', receiptError);
    }

    res.json({
      success: true,
      message: 'Payment successful',
      transaction: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Paystack webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'];

    if (!signature) {
      return res.status(401).send('No signature');
    }

    const isValid = await paystackService.verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      // Check if already processed
      const existing = await Transaction.findOne({ paystackReference: reference });
      if (!existing || existing.status === 'success') {
        return res.sendStatus(200);
      }

      // Double-check with Paystack API
      const verified = await paystackService.verifyTransaction(reference);
      if (!verified.status || verified.data.status !== 'success') {
        return res.sendStatus(200);
      }

      // Update to processing
      await Transaction.findOneAndUpdate(
        { paystackReference: reference },
        {
          status: 'processing',
          paystackTransactionId: event.data.id,
          paymentMethod: event.data.channel
        }
      );

      // Generate token
      const vendingResult = await vendingService.vendToken({
        meterNumber: metadata.meter_number,
        amount: event.data.amount / 100,
        phone: metadata.user_phone
      });

      if (vendingResult.success) {
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { paystackReference: reference },
          {
            status: 'success',
            token: vendingResult.token,
            units: vendingResult.units,
            vendingResponse: vendingResult.rawResponse,
            completedAt: new Date()
          },
          { new: true }
        );

        // Send notifications
        const user = await User.findById(metadata.user_id);
        if (user) {
          await notificationService.sendTokenEmail(user, updatedTransaction);
          await notificationService.sendTokenSMS(user.phone, vendingResult.token, metadata.meter_number);
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // Always return 200 to Paystack to prevent retries
  }
};

// @desc    Get transaction history
// @route   GET /api/transactions/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('meter', 'alias meterNumber');

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('meter', 'alias meterNumber address');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Download receipt
// @route   GET /api/transactions/:id/receipt
// @access  Private
exports.downloadReceipt = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Receipt only available for successful transactions' });
    }

    // Generate fresh receipt
    const user = await User.findById(req.user.id);
    const receipt = await receiptGenerator.generateReceipt(transaction, user);

    res.download(receipt.filepath, receipt.filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up temp file after download
      setTimeout(() => {
        const fs = require('fs');
        if (fs.existsSync(receipt.filepath)) {
          fs.unlinkSync(receipt.filepath);
        }
      }, 60000);
    });
  } catch (error) {
    next(error);
  }
};
