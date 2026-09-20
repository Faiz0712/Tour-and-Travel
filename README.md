# Tour & Travel Management System
**Academic Semester Mini-Project for AWT • DBMS • Software Engineering**

---

## 1. Project Overview
The **Tour & Travel Management System** is a complete, full-stack web application developed as an academic semester mini-project combining three core computer science subjects:
- **Advanced Web Technology (AWT)**: Asynchronous REST communication via `fetch()`, dynamic DOM updates with vanilla JavaScript, and mobile-friendly CSS.
- **Database Management Systems (DBMS)**: MongoDB document schemas, CRUD operations (Create, Read, Update, Delete), and aggregation pipelines (`$group`, `$sum`, `$sort`).
- **Software Engineering (SE)**: Architectural layering, transactional seat integrity, activity workflows, class modeling, and formal test cases.

---

## 2. Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6) — No React, Next.js, or external UI frameworks.
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB (`tour_travel_db`), Mongoose ODM
- **Server Architecture**: Unified Express server serving REST APIs and static frontend files directly on `http://localhost:5000`.

---

## 3. Project Directory Structure
```text
Tour-and-Travel/
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

## 4. Academic Documentation (DBMS & SE)

Comprehensive academic reports and technical diagrams are organized inside the `docs/` folder:

### 🗄️ DBMS Documentation (`docs/DBMS/`)
- [**Database Design & Modeling**](docs/DBMS/database-design.md): Complete schema structures for `users`, `tours`, and `bookings`, Mermaid ER diagram, and seat invariants.
- [**MongoDB CRUD Operations**](docs/DBMS/CRUD.md): Implementation and Shell demonstration for `insertOne`, `insertMany`, `find`, `findOne`, `updateOne`, and `deleteOne`.
- [**MongoDB Aggregation Pipelines**](docs/DBMS/aggregations.md): Multi-stage aggregation pipelines for revenue summation (`$group` + `$sum`) and tour popularity ranking (`$group` + `$sum` + `$sort`).

### 📐 Software Engineering Documentation (`docs/SE/`)
- [**Class Diagram**](docs/SE/class-diagram.md): Object-oriented class relationships modeling database schemas, route controllers, and client modules.
- [**Activity Diagrams**](docs/SE/activity-diagram.md): Step-by-step state and activity flows for both the Customer Booking journey and the Admin Tour/Status lifecycle.
- [**Test Cases Specification**](docs/SE/test-cases.md): 12 verified test cases covering catalog display, live dynamic calculation ($Price \times People$), transactional seat deduction, cancellation refund, and aggregation reports.

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

## 6. How to Run the Project

### Prerequisites:
1. **MongoDB**: Ensure MongoDB service is running on `mongodb://127.0.0.1:27017`
2. **Node.js**: Installed on your system (v16 or higher)

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