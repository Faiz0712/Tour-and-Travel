const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tour_travel_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[DBMS] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DBMS Warning] MongoDB Connection Failed: ${error.message}`);
    console.log('[DBMS] Note: Please ensure MongoDB Community Server is started on port 27017.');
  }
};

module.exports = connectDB;