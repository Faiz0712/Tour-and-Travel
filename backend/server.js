const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.post('/api/admin/login', (req, res) => {
  const { adminId, password } = req.body;
  if (adminId === 'admin' && password === 'admin@123') {
    return res.status(200).json({ success: true, message: 'Admin login successful' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid Admin ID or Password' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tours', require('./routes/tourRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
const server = app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 Tour & Travel System Server running on port ${PORT}`);
  console.log(`🌐 Website URL:   http://localhost:${PORT}`);
  console.log(`📊 Admin Panel:   http://localhost:${PORT}/admin.html`);
  console.log('========================================================');
});

module.exports = { app, server };