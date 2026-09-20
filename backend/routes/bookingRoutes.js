const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const { verifyUser, optionalUser } = require('../middleware/auth');

// 1. GET ALL BOOKINGS: GET /api/bookings (Admin & System)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET LOGGED IN USER'S BOOKINGS: GET /api/bookings/my (User Only)
router.get('/my', verifyUser, async (req, res) => {
  try {
    // Only return bookings that belong to this logged-in user
    const query = {
      $or: [
        { userId: req.user.id },
        { email: req.user.email.toLowerCase() }
      ]
    };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET SINGLE BOOKING: GET /api/bookings/:id
router.get('/:id', optionalUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Prevent unauthorized user from viewing another user's booking
    if (req.user && booking.userId && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You cannot access another user\'s booking.' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. CREATE BOOKING: POST /api/bookings
router.post('/', optionalUser, async (req, res) => {
  try {
    const { customerName, email, phone, tourId, numberOfPeople, travelDate } = req.body;
    if (!customerName || !email || !phone || !tourId || !numberOfPeople || !travelDate) {
      return res.status(400).json({ success: false, message: 'All booking fields are required.' });
    }

    const people = parseInt(numberOfPeople, 10);
    if (people < 1) {
      return res.status(400).json({ success: false, message: 'Must book for at least 1 person.' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Selected tour does not exist.' });
    }

    // Check available seats
    if (tour.availableSeats <= 0 || tour.availableSeats < people) {
      return res.status(400).json({
        success: false,
        message: tour.availableSeats <= 0
          ? 'This tour package is completely sold out!'
          : `Insufficient seats! Only ${tour.availableSeats} seat(s) remaining.`
      });
    }

    const totalAmount = tour.price * people;

    // Create booking document
    const bookingData = {
      customerName: customerName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      tourId: tour._id,
      tourName: tour.name,
      numberOfPeople: people,
      travelDate: new Date(travelDate),
      totalAmount,
      status: 'Confirmed'
    };

    // If a user is logged in, attach their userId
    if (req.user && req.user.id) {
      bookingData.userId = req.user.id;
    }

    const newBooking = await Booking.create(bookingData);

    // Reduce available seats
    tour.availableSeats -= people;
    await tour.save();

    res.status(201).json({ success: true, message: 'Tour booked successfully!', data: newBooking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 5. UPDATE BOOKING STATUS: PUT /api/bookings/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const prevStatus = booking.status;
    const tour = await Tour.findById(booking.tourId);

    // Rule: Confirmed/Pending -> Cancelled: return seats
    if (prevStatus !== 'Cancelled' && status === 'Cancelled') {
      if (tour) {
        tour.availableSeats += booking.numberOfPeople;
        await tour.save();
      }
    }
    // Rule: Cancelled -> Confirmed/Pending: check seats first, then deduct
    else if (prevStatus === 'Cancelled' && (status === 'Confirmed' || status === 'Pending')) {
      if (tour) {
        if (tour.availableSeats < booking.numberOfPeople) {
          return res.status(400).json({
            success: false,
            message: `Cannot reinstate booking. Only ${tour.availableSeats} seat(s) available for this tour.`
          });
        }
        tour.availableSeats -= booking.numberOfPeople;
        await tour.save();
      }
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;