const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');

// 1. GET ALL TOURS: GET /api/tours
router.get('/', async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tours.length, data: tours });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET SINGLE TOUR: GET /api/tours/:id
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: 'Tour package not found' });
    res.status(200).json({ success: true, data: tour });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. CREATE TOUR: POST /api/tours
router.post('/', async (req, res) => {
  try {
    const { name, destination, description, duration, price, availableSeats, category, image } = req.body;
    if (!name || !destination || !price || availableSeats === undefined || availableSeats === null) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const newTour = await Tour.create({
      name,
      destination,
      description: description || 'Scenic tour package with memorable experiences.',
      duration: duration || '4 Days / 3 Nights',
      price: Number(price),
      availableSeats: Number(availableSeats),
      category: category || 'Adventure',
      image: image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'
    });

    res.status(201).json({ success: true, message: 'Tour created successfully', data: newTour });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4. UPDATE TOUR: PUT /api/tours/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTour) return res.status(404).json({ success: false, message: 'Tour package not found' });
    res.status(200).json({ success: true, message: 'Tour updated successfully', data: updatedTour });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 5. DELETE TOUR: DELETE /api/tours/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    if (!deletedTour) return res.status(404).json({ success: false, message: 'Tour package not found' });
    res.status(200).json({ success: true, message: 'Tour deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;