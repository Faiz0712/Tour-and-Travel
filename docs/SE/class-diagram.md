# Software Engineering - Class Diagram

This Class Diagram represents the actual object-oriented and data-modeling architecture of the **Tour & Travel Management System**, depicting the data models, server-side route controllers, and client-side modules.

---

## 1. Class Diagram (Mermaid)

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String phone
        +String role
        +Date createdAt
        +Date updatedAt
    }

    class Tour {
        +ObjectId _id
        +String name
        +String destination
        +String description
        +String duration
        +Number price
        +Number availableSeats
        +String category
        +String image
        +Date createdAt
        +Date updatedAt
        +checkSeatAvailability(people: Number): Boolean
        +deductSeats(people: Number): void
        +restoreSeats(people: Number): void
    }

    class Booking {
        +ObjectId _id
        +String customerName
        +String email
        +String phone
        +ObjectId tourId
        +String tourName
        +Number numberOfPeople
        +Date travelDate
        +Number totalAmount
        +String status
        +Date createdAt
        +calculateTotal(unitPrice: Number, count: Number): Number
    }

    class TourController {
        +getAllTours(req, res): Promise
        +getTourById(req, res): Promise
        +createTour(req, res): Promise
        +updateTour(req, res): Promise
        +deleteTour(req, res): Promise
    }

    class BookingController {
        +getAllBookings(req, res): Promise
        +getBookingById(req, res): Promise
        +createBooking(req, res): Promise
        +updateBookingStatus(req, res): Promise
    }

    class DashboardController {
        +getDashboardStats(req, res): Promise
        +aggregateRevenue(): Promise
        +aggregateBookingsByTour(): Promise
    }

    class ClientBookingModule {
        +tourId: String
        +unitPrice: Number
        +availableSeats: Number
        +init(): void
        +calcTotal(): Number
        +validateForm(): Boolean
        +submitBooking(payload): Promise
    }

    class ClientAdminModule {
        +loadDashboardData(): Promise
        +fetchStats(): Promise
        +renderToursTable(): void
        +renderBookingsTable(): void
        +updateStatus(id, newStatus): Promise
        +saveTour(payload): Promise
        +deleteTour(id): Promise
    }

    Tour "1" <-- "*" Booking : references tourId
    User "1" <-- "*" Booking : made by customer
    TourController ..> Tour : manages
    BookingController ..> Booking : creates/updates
    BookingController ..> Tour : adjusts seats
    DashboardController ..> Tour : counts
    DashboardController ..> Booking : aggregates
    ClientBookingModule ..> BookingController : POST /api/bookings
    ClientAdminModule ..> DashboardController : GET /api/dashboard/stats
    ClientAdminModule ..> TourController : CRUD /api/tours
    ClientAdminModule ..> BookingController : PUT /api/bookings/:id/status
```

---

## 2. Component Descriptions

### Domain Models
- **`Tour`**: Encapsulates holiday itinerary attributes, unit price in INR, and live seat inventory.
- **`Booking`**: Captures customer details, departure date, passenger count, total calculated bill, and reservation status (`Confirmed`, `Pending`, `Cancelled`).
- **`User`**: Manages basic user profile information and access roles (`customer` vs `admin`).

### Backend Route Controllers
- **`TourController` (`backend/routes/tourRoutes.js`)**: Exposes REST endpoints to query and mutate `Tour` documents.
- **`BookingController` (`backend/routes/bookingRoutes.js`)**: Orchestrates booking persistence while enforcing transactional seat decrements and status reconciliation.
- **`DashboardController` (`backend/routes/dashboardRoutes.js`)**: Executes MongoDB multi-stage aggregation pipelines for revenue and package booking distributions.

### Client-Side JavaScript Modules
- **`ClientBookingModule` (`frontend/js/booking.js`)**: Handles DOM events, live formula calculation ($Price \times People$), input constraints, and asynchronous submission via `fetch()`.
- **`ClientAdminModule` (`frontend/js/admin.js`)**: Controls admin UI updates, modal popups for adding/editing tours, status toggle dropdowns, and aggregation tables.