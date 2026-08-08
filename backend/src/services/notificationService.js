const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    // Create reusable transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendTokenEmail(user, transaction) {
    try {
      const mailOptions = {
        from: `"Kaduna Electric" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Your Electricity Token - Kaduna Electric',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; margin: 0;">Kaduna Electric</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Token Vending System</p>
            </div>

            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #166534; font-size: 14px;">✅ Payment Successful</p>
              <h2 style="margin: 0; color: #166534; font-size: 28px; letter-spacing: 4px;">${transaction.token.match(/.{4}/g).join(' ')}</h2>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Enter this 20-digit token on your meter keypad</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666;">Meter Number</td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${transaction.meterNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666;">Amount Paid</td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">₦${transaction.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666;">Units Purchased</td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${transaction.units} kWh</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666;">Transaction Ref</td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${transaction.paystackReference}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #666;">Date</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">${new Date(transaction.createdAt).toLocaleString('en-NG')}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 12px; margin: 0;">Thank you for using Kaduna Electric Token Vending</p>
              <p style="color: #999; font-size: 11px; margin: 5px 0 0 0;">For support, contact customer care</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);

      // Save notification record
      await Notification.create({
        user: user._id,
        type: 'email',
        title: 'Token Purchase Successful',
        message: `Token for meter ${transaction.meterNumber}: ${transaction.token}`,
        status: 'sent'
      });

      return { success: true };
    } catch (error) {
      console.error('Email notification error:', error);

      await Notification.create({
        user: user._id,
        type: 'email',
        title: 'Token Purchase Successful',
        message: `Token for meter ${transaction.meterNumber}`,
        status: 'failed'
      });

      return { success: false, error: error.message };
    }
  }

  async sendTokenSMS(phone, token, meterNumber) {
    try {
      // In production, integrate with Termii API
      // For now, log the SMS
      console.log(`SMS to ${phone}: Your Kaduna Electric token for meter ${meterNumber}: ${token}`);

      return { success: true, message: 'SMS sent (simulated)' };
    } catch (error) {
      console.error('SMS notification error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
