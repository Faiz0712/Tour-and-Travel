let mongoose;
let bcrypt;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = require('../backend/node_modules/mongoose');
}

try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = require('../backend/node_modules/bcryptjs');
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tour_travel_db';

const Tour = mongoose.model('Tour', new mongoose.Schema({
  name: String, destination: String, description: String, duration: String,
  price: Number, availableSeats: Number, category: String, image: String
}, { timestamps: true }));

const Booking = mongoose.model('Booking', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String, email: String, phone: String, tourId: mongoose.Schema.Types.ObjectId,
  tourName: String, numberOfPeople: Number, travelDate: Date, totalAmount: Number, status: String,
  createdAt: { type: Date, default: Date.now }
}));

const User = mongoose.model('User', new mongoose.Schema({
  name: String, email: String, phone: String, password: String, role: String
}, { timestamps: true }));

const sampleTours = [
  {
    name: "Goa Coastal Beach & Cruise Holiday",
    destination: "Goa, India",
    description: "Relax on sun-kissed beaches, enjoy water sports at Calangute, and experience sunset river cruises along the Mandovi river.",
    duration: "4 Days / 3 Nights",
    price: 12999,
    availableSeats: 25,
    category: "Beach",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Manali & Solang Valley Snow Trail",
    destination: "Himachal Pradesh, India",
    description: "Snow adventures at Solang Valley, Rohtang Pass excursion, white water river rafting, and scenic pine mountain valleys.",
    duration: "5 Days / 4 Nights",
    price: 15999,
    availableSeats: 18,
    category: "Adventure",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Kerala Backwaters & Munnar Tea Hills",
    destination: "Alleppey & Munnar, Kerala",
    description: "Traditional luxury houseboat cruise through peaceful backwaters and refreshing strolls across emerald tea plantations.",
    duration: "5 Days / 4 Nights",
    price: 14999,
    availableSeats: 15,
    category: "Nature",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Royal Rajasthan Heritage & Forts",
    destination: "Jaipur & Udaipur, Rajasthan",
    description: "Grand Amber Fort, City Palace, romantic Lake Pichola boat ride, vibrant cultural dances, and authentic Rajasthani cuisine.",
    duration: "6 Days / 5 Nights",
    price: 13999,
    availableSeats: 20,
    category: "Heritage",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Kashmir Paradise on Earth Odyssey",
    destination: "Srinagar & Gulmarg, Kashmir",
    description: "Shikara rides on serene Dal Lake, gondola cable car ride in Gulmarg, snow slopes, and fragrant Mughal Gardens.",
    duration: "6 Days / 5 Nights",
    price: 18999,
    availableSeats: 12,
    category: "Honeymoon",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Varanasi Spiritual & Ghats Journey",
    destination: "Varanasi, Uttar Pradesh",
    description: "Witness the awe-inspiring evening Ganga Aarti ceremony, morning sunrise boat tours, and sacred heritage temple trails.",
    duration: "3 Days / 2 Nights",
    price: 8999,
    availableSeats: 30,
    category: "Heritage",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Andaman Coral Reefs & Island Getaway",
    destination: "Port Blair & Havelock Island",
    description: "World-famous Radhanagar beach sunsets, scuba diving at Elephant Beach, and Cellular Jail light and sound experience.",
    duration: "6 Days / 5 Nights",
    price: 24999,
    availableSeats: 10,
    category: "Beach",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Darjeeling & Gangtok Himalayan Serenity",
    destination: "West Bengal & Sikkim",
    description: "Tiger Hill sunrise over Mt. Kanchenjunga, happy tea garden walks, ride on the Himalayan Toy Train, and serene monasteries.",
    duration: "5 Days / 4 Nights",
    price: 16499,
    availableSeats: 14,
    category: "Nature",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
  }
];

async function seed() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('[Seed] Connected to tour_travel_db');

    // Clean existing data
    await Tour.deleteMany({});
    await Booking.deleteMany({});
    await User.deleteMany({});

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash('Admin@123', salt);
    const userHashedPassword = await bcrypt.hash('User@123', salt);

    const sampleUsers = [
      { 
        name: "Rahul Sharma", 
        email: "rahul@gmail.com", 
        phone: "9876543210", 
        password: userHashedPassword, 
        role: "user" 
      },
      { 
        name: "Priya Patel", 
        email: "priya@gmail.com", 
        phone: "9876543211", 
        password: userHashedPassword, 
        role: "user" 
      },
      { 
        name: "Admin Officer", 
        email: "admin@tourtravel.com", 
        phone: "9876543212", 
        password: adminHashedPassword, 
        role: "admin" 
      }
    ];

    // Insert Users
    const users = await User.insertMany(sampleUsers);
    console.log(`[Seed] Inserted ${users.length} users with hashed credentials.`);
    console.log('   👤 Admin: admin@tourtravel.com / Admin@123');
    console.log('   👤 User:  rahul@gmail.com / User@123');
    console.log('   👤 User:  priya@gmail.com / User@123');

    // Insert Tours (8 items)
    const tours = await Tour.insertMany(sampleTours);
    console.log(`[Seed] Inserted ${tours.length} sample tour packages.`);

    // Insert 3 initial bookings linked to users
    const bookingsData = [
      {
        userId: users[0]._id,
        customerName: "Rahul Sharma",
        email: "rahul@gmail.com",
        phone: "9876543210",
        tourId: tours[0]._id,
        tourName: tours[0].name,
        numberOfPeople: 2,
        travelDate: new Date('2026-10-15'),
        totalAmount: tours[0].price * 2,
        status: "Confirmed"
      },
      {
        userId: users[1]._id,
        customerName: "Priya Patel",
        email: "priya@gmail.com",
        phone: "9876543211",
        tourId: tours[1]._id,
        tourName: tours[1].name,
        numberOfPeople: 3,
        travelDate: new Date('2026-11-01'),
        totalAmount: tours[1].price * 3,
        status: "Confirmed"
      },
      {
        userId: users[0]._id,
        customerName: "Rahul Sharma",
        email: "rahul@gmail.com",
        phone: "9876543210",
        tourId: tours[2]._id,
        tourName: tours[2].name,
        numberOfPeople: 2,
        travelDate: new Date('2026-12-05'),
        totalAmount: tours[2].price * 2,
        status: "Pending"
      }
    ];

    await Booking.insertMany(bookingsData);

    // Explicitly decrease available seats to reflect sample bookings
    await Tour.findByIdAndUpdate(tours[0]._id, { $inc: { availableSeats: -2 } });
    await Tour.findByIdAndUpdate(tours[1]._id, { $inc: { availableSeats: -3 } });
    await Tour.findByIdAndUpdate(tours[2]._id, { $inc: { availableSeats: -2 } });

    console.log('[Seed] Inserted 3 bookings and updated available seats.');
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seed();