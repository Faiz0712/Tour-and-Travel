# MongoDB CRUD Operations

This document demonstrates the core Create, Read, Update, and Delete (CRUD) operations implemented in the **Tour & Travel Management System**, executable directly in the MongoDB Shell (`mongosh`) and mapped to our backend Mongoose controllers.

---

## 1. CREATE Operations

### `insertOne`: Add a single new Tour Package
Used in the Admin Dashboard (`POST /api/tours`) when adding a new itinerary.

```javascript
db.tours.insertOne({
  name: "Kashmir Paradise on Earth Odyssey",
  destination: "Srinagar & Gulmarg, Kashmir",
  description: "Shikara rides on serene Dal Lake, gondola cable car ride in Gulmarg, snow slopes, and fragrant Mughal Gardens.",
  duration: "6 Days / 5 Nights",
  price: 18999,
  availableSeats: 12,
  category: "Honeymoon",
  image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### `insertMany`: Batch Seeding Initial Tours & Users
Used in `database/sample-data.js` to seed 8+ tours and initial customers in one network round-trip.

```javascript
db.users.insertMany([
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Priya Patel",
    email: "priya@gmail.com",
    phone: "9876543211",
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Admin Officer",
    email: "admin@tourtravel.com",
    phone: "9876543212",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

---

## 2. READ Operations

### `find`: Retrieve all Tour Packages sorted by recency
Used on the customer catalog page (`GET /api/tours`) and admin management list.

```javascript
// Find all active tours sorted from newest to oldest
db.tours.find().sort({ createdAt: -1 }).pretty();

// Filtered Read: Find all packages under ₹15,000
db.tours.find({ price: { $lte: 15000 } }).pretty();
```

### `findOne`: Retrieve a Single Tour by ID or Destination
Used on the Tour Details page (`GET /api/tours/:id`) before booking.

```javascript
// Find by ObjectId
db.tours.findOne({ _id: ObjectId("664f1092a1e8bc001ef00201") });

// Find by Destination regex
db.tours.findOne({ destination: /Goa/i });
```

---

## 3. UPDATE Operations

### `updateOne`: Seat Inventory Decrement
Executed during customer booking submission (`POST /api/bookings`) to atomically reduce seats.

```javascript
// Deduct 2 seats from Goa package after successful booking
db.tours.updateOne(
  { _id: ObjectId("664f1092a1e8bc001ef00201") },
  { 
    $inc: { availableSeats: -2 },
    $set: { updatedAt: new Date() }
  }
);
```

### `updateOne`: Change Booking Status with Seat Restoration
Used in Admin Panel (`PUT /api/bookings/:id/status`) to cancel or confirm a reservation.

```javascript
// Update booking status to Cancelled
db.bookings.updateOne(
  { _id: ObjectId("664f1092a1e8bc001ef00301") },
  { $set: { status: "Cancelled" } }
);

// Restore the 2 seats back to the tour inventory
db.tours.updateOne(
  { _id: ObjectId("664f1092a1e8bc001ef00201") },
  { $inc: { availableSeats: 2 } }
);
```

---

## 4. DELETE Operations

### `deleteOne`: Remove an Obsolete Tour Package
Executed in Admin Panel (`DELETE /api/tours/:id`).

```javascript
db.tours.deleteOne({ _id: ObjectId("664f1092a1e8bc001ef00201") });
```

---

## 5. Summary of CRUD Mapping in Express Backend

| Operation | MongoDB Shell Command | Mongoose Method | Express Route |
|---|---|---|---|
| **Create Tour** | `db.tours.insertOne()` | `Tour.create()` | `POST /api/tours` |
| **Create Booking** | `db.bookings.insertOne()` | `Booking.create()` | `POST /api/bookings` |
| **Batch Seed** | `db.tours.insertMany()` | `Tour.insertMany()` | `node database/sample-data.js` |
| **Get All Tours** | `db.tours.find()` | `Tour.find().sort()` | `GET /api/tours` |
| **Get One Tour** | `db.tours.findOne()` | `Tour.findById()` | `GET /api/tours/:id` |
| **Get All Bookings** | `db.bookings.find()` | `Booking.find().sort()` | `GET /api/bookings` |
| **Get Single Booking** | `db.bookings.findOne()` | `Booking.findById()` | `GET /api/bookings/:id` |
| **Update Tour** | `db.tours.updateOne()` | `Tour.findByIdAndUpdate()` | `PUT /api/tours/:id` |
| **Update Status** | `db.bookings.updateOne()` | `Booking.findById()` + `save()` | `PUT /api/bookings/:id/status` |
| **Delete Tour** | `db.tours.deleteOne()` | `Tour.findByIdAndDelete()` | `DELETE /api/tours/:id` |