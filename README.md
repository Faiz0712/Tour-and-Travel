# Tour & Travel Management System
**Academic Semester Mini-Project for AWT • DBMS • Software Engineering**

---

## 1. Project Overview
The **Tour & Travel Management System** is a complete, full-stack web application developed as an academic semester mini-project combining three core subjects:
- **Advanced Web Technology (AWT)**: Asynchronous REST communication via `fetch()`, DOM updates with vanilla JavaScript, and mobile-friendly CSS.
- **Database Management Systems (DBMS)**: MongoDB document schemas, CRUD operations (Create, Read, Update, Delete), and aggregation pipelines (`$group`, `$sum`, `$sort`).
- **Software Engineering (SE)**: Clean client-server separation, transaction integrity for seat reservations, validation, and modular structure.

---

## 2. Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6) — No React, Next.js, or external UI frameworks.
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB (`tour_travel_db`), Mongoose ODM
- **Server Architecture**: Single unified server serving REST APIs and static frontend files directly on `http://localhost:5000`.

---

## 3. Project Directory Structure
```text
tour-travel-management/
│
├── frontend/
│   ├── index.html              # Home Page (Hero, Featured Tours, About)
│   ├── tours.html              # All Tours Catalog Page
│   ├── tour-details.html       # Individual Tour Detail & "Book Now"
│   ├── booking.html            # Booking Form with Live Price Calculation
│   ├── confirmation.html       # Booking Receipt with Print Option
│   ├── admin.html              # Admin Dashboard (Stats, Tour CRUD, Bookings)
│   ├── css/
│   │   └── style.css           # Modern Responsive Travel Stylesheet
│   └── js/
│       ├── main.js             # Featured Tours loader on Home Page
│       ├── tours.js            # All Tours fetch & card rendering
│       ├── tour-details.js     # Single Tour viewer
│       ├── booking.js          # Live total calculation & booking submission
│       └── admin.js            # Admin analytics, CRUD modals & status updates
│
├── backend/
│   ├── server.js               # Express server entry point
│   ├── package.json            # Node.js dependencies
│   ├── config/
│   │   └── db.js               # MongoDB Connection configuration
│   ├── models/
│   │   ├── User.js             # Customer & Admin User Schema
│   │   ├── Tour.js             # Tour Package Schema
│   │   └── Booking.js          # Customer Reservation Schema
│   └── routes/
│       ├── tourRoutes.js       # CRUD endpoints for Tours
│       ├── bookingRoutes.js    # Booking creation, retrieval & status updates
│       └── dashboardRoutes.js  # Aggregation pipeline endpoints
│
├── database/
│   └── sample-data.js          # Database seeder (8+ tours, 3 users, 3 bookings)
│
└── README.md                   # Setup, Execution, and Documentation
```

---

## 4. Database Modeling (`tour_travel_db`)

### Collections:

1. **`users`**
   - `name` (String, required)
   - `email` (String, required, lowercase)
   - `phone` (String, required)
   - `role` (String, enum: `['customer', 'admin']`)

2. **`tours`**
   - `name` (String, required)
   - `destination` (String, required)
   - `description` (String, required)
   - `duration` (String, required, e.g. "4 Days / 3 Nights")
   - `price` (Number, required, Indian Rupee ₹)
   - `availableSeats` (Number, required, non-negative)
   - `category` (String, enum: `['Adventure', 'Beach', 'Heritage', 'Honeymoon', 'Nature']`)
   - `image` (String URL)

3. **`bookings`**
   - `customerName` (String, required)
   - `email` (String, required)
   - `phone` (String, required)
   - `tourId` (ObjectId, ref: `'Tour'`)
   - `tourName` (String, required)
   - `numberOfPeople` (Number, min: 1)
   - `travelDate` (Date, required)
   - `totalAmount` (Number, `price * numberOfPeople`)
   - `status` (String, enum: `['Pending', 'Confirmed', 'Cancelled']`)
   - `createdAt` (Date)

---

## 5. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tours` | Fetch all tour packages |
| `GET` | `/api/tours/:id` | Fetch single tour details |
| `POST` | `/api/tours` | Add a new tour package |
| `PUT` | `/api/tours/:id` | Edit/update a tour package |
| `DELETE` | `/api/tours/:id` | Delete a tour package |
| `GET` | `/api/bookings` | Fetch all customer bookings |
| `GET` | `/api/bookings/:id` | Fetch single booking confirmation |
| `POST` | `/api/bookings` | Create booking, validate & deduct seats |
| `PUT` | `/api/bookings/:id/status` | Update booking status & reconcile seats |
| `GET` | `/api/dashboard/stats` | Aggregated metrics (Tours, Bookings, Revenue) |

---

## 6. DBMS Operations & Aggregation Examples

### MongoDB CRUD Operations
- **CREATE**: `db.tours.insertOne({...})` / `Tour.create()`
- **READ**: `db.tours.find()` / `db.tours.findOne({ _id: ObjectId(...) })`
- **UPDATE**: `db.tours.updateOne({ _id: ... }, { $set: ... })`
- **DELETE**: `db.tours.deleteOne({ _id: ... })`

### Aggregation Pipelines (`$group`, `$sum`, `$sort`)
1. **Total Revenue** across active bookings:
```javascript
db.bookings.aggregate([
  { $match: { status: { $ne: 'Cancelled' } } },
  { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
]);
```

2. **Bookings by Tour**:
```javascript
db.bookings.aggregate([
  {
    $group: {
      _id: '$tourName',
      bookingCount: { $sum: 1 },
      totalPeople: { $sum: '$numberOfPeople' },
      tourRevenue: { $sum: '$totalAmount' }
    }
  },
  { $sort: { bookingCount: -1 } }
]);
```

---

## 7. How to Run the Project

### Prerequisites:
1. **MongoDB**: Ensure MongoDB service is running on `mongodb://127.0.0.1:27017`
2. **Node.js**: Installed on your system

### Commands:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Seed the database with 8+ tours, users, and initial bookings
node ../database/sample-data.js

# 4. Start the server
npm start
```

### Accessing the Web Application:
- **Customer Home Page**: `http://localhost:5000`
- **Tours Catalog**: `http://localhost:5000/tours.html`
- **Admin Dashboard**: `http://localhost:5000/admin.html`