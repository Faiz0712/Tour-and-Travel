const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  availableSeats: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    default: 'Adventure', 
    enum: ['Adventure', 'Beach', 'Heritage', 'Honeymoon', 'Nature'] 
  },
  image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);