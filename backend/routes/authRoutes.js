const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, verifyUser } = require('../middleware/auth');

// 1. POST /api/auth/register - User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Check all fields present
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check unique email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Force role: 'user' (disallow admin creation)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: 'user'
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please log in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
});

// 2. POST /api/auth/login - User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
});

// 3. GET /api/auth/me - Current User Profile
router.get('/me', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile.', error: err.message });
  }
});

// 4. POST /api/auth/logout - Logout
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
