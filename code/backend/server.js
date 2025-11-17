const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  firstName: String,
  lastName: String,
  password: String,
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  roomId: mongoose.Schema.Types.ObjectId,
  checkInDate: Date,
  checkOutDate: Date,
  totalPrice: Number,
  paymentId: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

// Room Schema
const roomSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  amenities: [String],
  image: String,
  available: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Room = mongoose.model('Room', roomSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// DEMO: Generate OTP (in production, send via email/SMS)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// DEMO: Send Email (commented - replace with real service like SendGrid/Nodemailer)
/*
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    to: email,
    subject: 'Your Hotel Booking OTP',
    html: `<h1>Your verification code is: ${otp}</h1>`,
  });
}
*/

// DEMO: Send SMS (commented - replace with real service like Twilio)
/*
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

async function sendOTPSMS(phone, otp) {
  await twilioClient.messages.create({
    body: `Your hotel booking OTP is: ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
}
*/

// Register/Request OTP endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, phone });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // DEMO: Log OTP instead of sending (replace with real service)
    console.log(`[DEMO] OTP for ${email}: ${otp}`);
    // sendOTPEmail(email, otp); // Uncomment for real email
    // sendOTPSMS(phone, otp); // Uncomment for real SMS

    res.json({
      message: 'OTP sent successfully (DEMO: Check console)',
      email,
      demo_otp: otp, // Remove in production
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP validity
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'OTP verified successfully',
      token,
      user: { email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Booking (Protected route)
app.post('/api/bookings', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { roomId, checkInDate, checkOutDate, totalPrice } = req.body;

    const booking = new Booking({
      userId: decoded.userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'pending',
    });

    await booking.save();
    res.json({ message: 'Booking created', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe Payment endpoint (DEMO)
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    // DEMO: Return mock payment intent (replace with real Stripe)
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
    });
    */

    // Demo response
    res.json({
      clientSecret: 'pi_demo_' + Math.random().toString(36).substr(2, 9),
      bookingId,
      amount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
