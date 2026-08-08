const fetch = require('node-fetch');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.headers = {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }

  async initializePayment(email, amount, metadata = {}) {
    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
          callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
          metadata: {
            ...metadata,
            cancel_action: `${process.env.FRONTEND_URL}/payment/cancel`
          }
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack initialize error:', error);
      throw error;
    }
  }

  async verifyTransaction(reference) {
    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack verify error:', error);
      throw error;
    }
  }

  async verifyWebhookSignature(body, signature) {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(body))
      .digest('hex');
    return hash === signature;
  }
}

module.exports = new PaystackService();
