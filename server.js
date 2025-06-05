require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Donation = mongoose.model('Donation', new mongoose.Schema({
  amount: Number,
  method: String,
  phone: String,
  email: String,
  name: String,
  transactionId: String,
  status: { type: String, default: 'pending' }, // pending, completed, failed
  createdAt: { type: Date, default: Date.now }
}));

// --- MPESA Endpoints --- //
app.post('/api/mpesa', async (req, res) => {
  try {
    const { phone, amount, name } = req.body;
    
    // 1. Get OAuth Token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const tokenRes = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    });
    
    // 2. Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    
    const stkRes = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: `254${phone.substring(1)}`, // Convert 07... to 254...
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: `254${phone.substring(1)}`,
        CallBackURL: `${process.env.BASE_URL}/api/mpesa-callback`,
        AccountReference: `DON-${name.substring(0, 8)}`,
        TransactionDesc: 'Donation'
      },
      { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } }
    );

    // Save to database
    const donation = new Donation({
      amount,
      method: 'mpesa',
      phone,
      name,
      transactionId: stkRes.data.CheckoutRequestID,
      status: 'pending'
    });
    await donation.save();

    res.json({ 
      success: true,
      message: 'MPESA prompt sent to your phone',
      data: stkRes.data
    });
  } catch (error) {
    console.error('MPESA Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      message: error.response?.data?.errorMessage || 'MPESA payment failed'
    });
  }
});

// MPESA Callback
app.post('/api/mpesa-callback', async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('MPESA Callback:', callbackData);
    
    // Update donation status
    await Donation.updateOne(
      { transactionId: callbackData.CheckoutRequestID },
      { 
        status: callbackData.ResultCode === '0' ? 'completed' : 'failed',
        transactionId: callbackData.MpesaReceiptNumber || callbackData.CheckoutRequestID
      }
    );
    
    res.status(200).send();
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).send();
  }
});

// --- PayPal Endpoints --- //
app.post('/api/paypal', async (req, res) => {
  try {
    const { amount, email, name } = req.body;
    
    // 1. Get Access Token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    const tokenRes = await axios.post(
      'https://api-m.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      { headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}` 
      }}
    );
    
    // 2. Create Order
    const orderRes = await axios.post(
      'https://api-m.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'KES', value: amount },
          payee: { email_address: process.env.PAYPAL_MERCHANT_EMAIL },
          description: `Donation from ${name}`
        }],
        payer: { email_address: email }
      },
      { headers: { 
        'Authorization': `Bearer ${tokenRes.data.access_token}`,
        'Content-Type': 'application/json'
      }}
    );
    
    // Save to database
    const donation = new Donation({
      amount,
      method: 'paypal',
      email,
      name,
      transactionId: orderRes.data.id,
      status: 'pending'
    });
    await donation.save();
    
    res.json({
      success: true,
      approval_url: orderRes.data.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    console.error('PayPal Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'PayPal payment failed'
    });
  }
});

// PayPal Webhook (Configure in PayPal Dashboard)
app.post('/api/paypal-webhook', async (req, res) => {
  try {
    const event = req.body;
    
    // Verify event is from PayPal (important for production)
    
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      await Donation.updateOne(
        { transactionId: event.resource.id },
        { status: 'completed' }
      );
    }
    
    res.status(200).send();
  } catch (error) {
    console.error('PayPal Webhook Error:', error);
    res.status(500).send();
  }
});

// --- Bank Transfer Endpoint --- //
app.post('/api/bank', async (req, res) => {
  try {
    const { name, amount, email } = req.body;
    const reference = `DON-${Date.now().toString().slice(-6)}`;
    
    // Save to database (actual bank API integration would go here)
    const donation = new Donation({
      amount,
      method: 'bank',
      email,
      name,
      transactionId: reference,
      status: 'pending' // Will update when bank confirms
    });
    await donation.save();
    
    res.json({
      success: true,
      reference,
      bankDetails: {
        name: process.env.BANK_ACCOUNT_NAME,
        number: process.env.BANK_ACCOUNT_NUMBER,
        branch: process.env.BANK_BRANCH,
        swift: process.env.BANK_SWIFT_CODE
      }
    });
  } catch (error) {
    console.error('Bank Error:', error);
    res.status(500).json({
      success: false,
      message: 'Bank transfer failed'
    });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
