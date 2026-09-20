# Tour & Travel Management System
**Academic Semester Mini-Project for AWT • DBMS • Software Engineering**

---

## 1. Project Overview
The **Tour & Travel Management System** is a complete, full-stack web application developed as an academic semester mini-project combining three core computer science subjects:
- **Advanced Web Technology (AWT)**: Asynchronous REST communication via `fetch()`, dynamic DOM updates with vanilla JavaScript, token authentication, and mobile-friendly responsive CSS.
- **Database Management Systems (DBMS)**: MongoDB document schemas, password hashing with bcrypt, CRUD operations, and aggregation pipelines (`$group`, `$sum`, `$sort`).
- **Software Engineering (SE)**: Role-based access control (Admin & User), transactional seat integrity, activity workflows, class modeling, and formal test cases.

---

## 2. Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6) — No React, Next.js, or external UI frameworks.
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB (`tour_travel_db`), Mongoose ODM
- **Authentication**: Stateless JWT token authentication with bcrypt password hashing
- **Server Architecture**: Unified Express server serving REST APIs and static frontend files directly on `http://localhost:5000`.

---

## 3. Predefined Credentials for Evaluation

| Role | Email | Password | Access / Destination |
|---|---|---|---|
| **Administrator** | `admin@tourtravel.com` | `Admin@123` | Full Admin Dashboard (`admin.html`), Tour CRUD, All Bookings, Aggregations |
| **Customer User** | `rahul@gmail.com` | `User@123` | Traveler Dashboard (`user-dashboard.html`), My Bookings, Tour Booking |
| **Customer User** | `priya@gmail.com` | `User@123` | Traveler Dashboard (`user-dashboard.html`), My Bookings, Tour Booking |

> Quick-fill helper buttons are available on `login.html` for rapid demonstration during lab and viva evaluations.

---

## 4. Project Directory Structure
```text
Tour-and-Travel/
│
├── frontend/
│   ├── index.html              # Home Page (Hero, Featured Tours, Dynamic Navbar)
│   ├── tours.html              # All Tours Catalog Page
│   ├── tour-details.html       # Individual Tour Detail & "Book Now"
│   ├── booking.html            # Booking Form with Live Price Calculation & User Auto-fill
│   ├── confirmation.html       # Booking Receipt with Print & My Bookings Link
│   ├── register.html           # User Registration with Client & Server Validation
│   ├── login.html              # Tabbed User & Admin Login with Quick-Fill
│   ├── user-dashboard.html     # Traveler Dashboard (My Bookings, Status & Cancellation)
│   ├── admin.html              # Admin Dashboard (Stats, Tour CRUD, All Bookings)
│   ├── css/
│   │   └── style.css           # Modern Responsive Travel Stylesheet
│   └── js/
│       ├── auth.js             # Client-side Auth state, tokens & dynamic navbar
│       ├── register.js         # Registration form validation and submission
│       ├── login.js            # User and Admin authentication logic
│       ├── user-dashboard.js   # User profile stats and bookings management
│       ├── main.js             # Featured Tours loader on Home Page
│       ├── tours.js            # All Tours fetch & card rendering
│       ├── tour-details.js     # Single Tour viewer
│       ├── booking.js          # Live total calculation & booking submission
│       └── admin.js            # Admin analytics, CRUD modals & status updates
│
├── backend/
│   ├── server.js               # Express server entry point
│   ├── package.json            # Node.js dependencies (express, mongoose, cors, bcryptjs, jsonwebtoken)
│   ├── config/
│   │   └── db.js               # MongoDB Connection configuration
│   ├── middleware/
│   │   └── auth.js             # JWT verification & Admin role guard (401/403)
│   ├── models/
│   │   ├── User.js             # User Schema with bcrypt password hashing
│   │   ├── Tour.js             # Tour Package Schema
│   │   └── Booking.js          # Customer Reservation Schema (linked to userId)
│   └── routes/
│       ├── authRoutes.js       # Register, Login, Me, and Logout endpoints
│       ├── tourRoutes.js       # CRUD endpoints for Tours (Admin protected)
│       ├── bookingRoutes.js    # User bookings, My Bookings, and Cancellation
│       └── dashboardRoutes.js  # Aggregation pipeline endpoints (Admin protected)
│
├── database/
│   └── sample-data.js          # Database seeder (8+ tours, 3 users with hashed passwords, 3 bookings)
│
├── docs/
│   ├── DBMS/
│   │   ├── database-design.md  # Schema definitions, ER diagram, constraints
│   │   ├── CRUD.md             # Shell commands & mappings (insertOne, find, updateOne, deleteOne)
│   │   └── aggregations.md     # Pipelines: Total Revenue ($sum) & Bookings by Tour ($sort)
│   │
│   └── SE/
│       ├── class-diagram.md    # Architecture & Class Diagram (Models, Controllers, UI)
│       ├── activity-diagram.md # Workflows: Customer Booking & Admin Status Management
│       └── test-cases.md       # Comprehensive functional & DBMS test cases
│
└── README.md                   # Setup, Execution, and Documentation
```

---

## 5. REST API Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account (`role: 'user'`) |
| `POST` | `/api/auth/login` | Public | Authenticate user or admin, return JWT token |
| `GET` | `/api/auth/me` | Logged In | Get profile of authenticated user |
| `POST` | `/api/auth/logout` | Public | Logout current session |

### Tour Endpoints (`/api/tours`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tours` | Public | Fetch all tour packages |
| `GET` | `/api/tours/:id` | Public | Fetch single tour details |
| `POST` | `/api/tours` | Admin Only | Add a new tour package |
| `PUT` | `/api/tours/:id` | Admin Only | Edit/update a tour package |
| `DELETE` | `/api/tours/:id` | Admin Only | Delete a tour package |

### Booking Endpoints (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Admin Only | Fetch all customer bookings across system |
| `GET` | `/api/bookings/my` | Logged In | Fetch bookings belonging to logged-in user |
| `GET` | `/api/bookings/:id` | Public/Owner | Fetch single booking confirmation |
| `POST` | `/api/bookings` | Public/User | Create booking, validate & deduct available seats |
| `PUT` | `/api/bookings/:id/status` | Admin Only | Update booking status & reconcile seats |
| `PUT` | `/api/bookings/:id/cancel` | Owner/Admin | Cancel booking and return seats to tour pool |

### Analytics Endpoints (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Admin Only | Aggregated metrics (Total Tours, Bookings, Revenue, Popular Tours) |

---

## 6. How to Run the Project

### Prerequisites:
1. **MongoDB**: Ensure MongoDB service is running on `mongodb://127.0.0.1:27017`
2. **Node.js**: Installed on your system (v16 or higher)

### Step-by-Step Commands:

```bash
# 1. Open terminal and navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Seed the database with 8+ tours, users, and initial bookings
node ../database/sample-data.js

# 4. Start the server
npm start
```

### Accessing the Web Application:
- **Home Page**: `http://localhost:5000`
- **Tours Catalog**: `http://localhost:5000/tours.html`
- **Customer Registration**: `http://localhost:5000/register.html`
- **Sign In (User & Admin)**: `http://localhost:5000/login.html`
- **Traveler Dashboard**: `http://localhost:5000/user-dashboard.html`
- **Admin Control Panel**: `http://localhost:5000/admin.html`