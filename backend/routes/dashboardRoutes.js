const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const totalTours = await Tour.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Aggregation 1: Total Revenue ($match non-cancelled, $group, $sum)
    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Aggregation 2: Bookings grouped by tour ($group, $sum, $sort)
    const bookingsByTour = await Booking.aggregate([
      {
        $group: {
          _id: '$tourName',
          bookingCount: { $sum: 1 },
          totalPeople: { $sum: '$numberOfPeople' },
          tourRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { bookingCount: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTours,
        totalBookings,
        totalRevenue,
        bookingsByTour
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;