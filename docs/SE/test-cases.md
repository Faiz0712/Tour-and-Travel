# Software Engineering - Test Cases Specification

This document defines the formal test cases designed and verified for the **Tour & Travel Management System**, verifying that all functional requirements, DBMS transaction rules, and UI calculations operate correctly.

---

## 1. Test Suite Summary

| Module | Test Cases | Scope |
|---|---|---|
| **Customer Tour Catalog** | TC-01 to TC-03 | Package browsing, card rendering, and details retrieval |
| **Booking & Seat Logic** | TC-04 to TC-07 | Formula validation, seat deduction, overbooking guard, cancellation refund |
| **Admin Tour CRUD** | TC-08 to TC-10 | Adding, modifying, and deleting holiday packages |
| **DBMS Aggregation** | TC-11 to TC-12 | Analytical metrics, total revenue pipeline, and tour grouping reports |

---

## 2. Test Cases Specification Table

### TC-01: Browse All Tour Packages
- **Test ID**: TC-01
- **Module**: Customer Catalog
- **Preconditions**: MongoDB is running and database is seeded with sample tours.
- **Test Steps**:
  1. Open browser and navigate to `http://localhost:5000/tours.html`.
  2. Inspect the network request and rendered cards.
- **Expected Result**: Frontend issues `GET /api/tours` and dynamically displays at least 8 packages with image, title, destination, price (in ₹), duration, and remaining seats.
- **Status**: Passed

---

### TC-02: View Single Tour Details
- **Test ID**: TC-02
- **Module**: Tour Details
- **Preconditions**: Tours exist in database.
- **Test Steps**:
  1. Click "View Details" on the "Goa Coastal Beach & Cruise Holiday" card.
  2. Observe the loaded page `tour-details.html?id=<tourId>`.
- **Expected Result**: Page fetches `GET /api/tours/:id` and displays complete high-resolution photo, full description, category badge, and active "Book Now" button.
- **Status**: Passed

---

### TC-03: Real-Time Dynamic Price Calculation
- **Test ID**: TC-03
- **Module**: Booking Form
- **Preconditions**: Selected tour has unit price of ₹12,999.
- **Test Steps**:
  1. Navigate to `booking.html?tourId=<goaTourId>`.
  2. In the "Number of People" input, change the value from `1` to `3`.
  3. Observe the "Total Amount" display box.
- **Expected Result**: Live JavaScript calculation triggers without page reload:
  $$\text{Total Amount} = ₹12,999 \times 3 = ₹38,997$$
  Display updates instantly to `₹38,997`.
- **Status**: Passed

---

### TC-04: Successful Booking Creation and Seat Deduction
- **Test ID**: TC-04
- **Module**: Transactional Booking
- **Preconditions**: Tour has 25 available seats.
- **Test Steps**:
  1. Fill customer details: Name: "Amit Kumar", Email: "amit@example.com", Phone: "9876543210".
  2. Select Travel Date: future date.
  3. Set Number of People: `2`.
  4. Submit form by clicking "Confirm & Book Tour".
- **Expected Result**:
  1. Backend receives `POST /api/bookings`.
  2. Booking document is created with status `Confirmed`.
  3. Tour `availableSeats` in MongoDB decreases from 25 to 23.
  4. Browser is redirected to `confirmation.html?id=<newBookingId>` showing receipt.
- **Status**: Passed

---

### TC-05: Overbooking Prevention when Travelers Exceed Available Seats
- **Test ID**: TC-05
- **Module**: Validation & Integrity
- **Preconditions**: Tour has 5 available seats remaining.
- **Test Steps**:
  1. Attempt to book the tour with Number of People set to `6`.
  2. Submit the form.
- **Expected Result**:
  1. Client-side validation restricts `max="5"` on the input.
  2. If bypassed, backend endpoint `POST /api/bookings` verifies `tour.availableSeats < 6` and responds with `HTTP 400 Bad Request` (`"Insufficient seats! Only 5 seat(s) remaining"`).
  3. No booking document is created and seats remain at 5.
- **Status**: Passed

---

### TC-06: Booking Cancellation and Automatic Seat Refund
- **Test ID**: TC-06
- **Module**: Admin Status Management
- **Preconditions**: Booking exists with 2 passengers; tour currently has 23 seats remaining.
- **Test Steps**:
  1. Open Admin Dashboard at `http://localhost:5000/admin.html`.
  2. In the Bookings table, locate the reservation and change status dropdown from `Confirmed` to `Cancelled`.
- **Expected Result**:
  1. Backend executes `PUT /api/bookings/:id/status` with payload `{ status: "Cancelled" }`.
  2. Tour document in MongoDB increments available seats by 2:
     $$\text{availableSeats} = 23 + 2 = 25$$
  3. Status badge updates to red `Cancelled`.
- **Status**: Passed

---

### TC-07: Cancelled Booking Reinstatement with Seat Capacity Check
- **Test ID**: TC-07
- **Module**: Admin Status Management
- **Preconditions**: A booking for 4 people was previously `Cancelled`. The tour only has 2 seats left.
- **Test Steps**:
  1. In the Bookings table, attempt to change status dropdown back from `Cancelled` to `Confirmed`.
- **Expected Result**:
  1. Backend checks `tour.availableSeats < booking.numberOfPeople` ($2 < 4$).
  2. Request is rejected with `HTTP 400` (`"Cannot reinstate booking. Only 2 seat(s) available for this tour."`).
  3. Status remains `Cancelled` and negative seats are prevented.
- **Status**: Passed

---

### TC-08: Admin Add New Tour Package
- **Test ID**: TC-08
- **Module**: Tour CRUD (Create)
- **Preconditions**: Admin dashboard is open.
- **Test Steps**:
  1. Click "+ Add New Tour".
  2. Enter Name: "Shimla Pine Forest Trek", Destination: "Himachal Pradesh", Duration: "4 Days / 3 Nights", Price: `11999`, Available Seats: `20`, Category: "Adventure", Image: valid URL.
  3. Click "Save Package".
- **Expected Result**: Request sent to `POST /api/tours`. New tour is stored in MongoDB `tours` collection, modal closes, and tour appears immediately in the table.
- **Status**: Passed

---

### TC-09: Admin Edit Existing Tour Package
- **Test ID**: TC-09
- **Module**: Tour CRUD (Update)
- **Preconditions**: Tour exists in database.
- **Test Steps**:
  1. Click "Edit" button next to "Shimla Pine Forest Trek".
  2. Change Price from `11999` to `12499`.
  3. Submit modal.
- **Expected Result**: Request sent to `PUT /api/tours/:id`. MongoDB document is updated via `findByIdAndUpdate` and price refreshes on both admin and customer pages.
- **Status**: Passed

---

### TC-10: Admin Delete Tour Package
- **Test ID**: TC-10
- **Module**: Tour CRUD (Delete)
- **Preconditions**: Tour exists in database.
- **Test Steps**:
  1. Click "Delete" button next to a tour.
  2. Confirm browser confirmation alert.
- **Expected Result**: Request sent to `DELETE /api/tours/:id`. Document is deleted via `findByIdAndDelete` and row disappears from table.
- **Status**: Passed

---

### TC-11: MongoDB Aggregation Pipeline - Total Revenue Metric
- **Test ID**: TC-11
- **Module**: DBMS Aggregation
- **Preconditions**: Bookings collection has active bookings with values ₹25,998, ₹47,997, and ₹29,998 (Sum = ₹103,993), plus one Cancelled booking.
- **Test Steps**:
  1. Open Admin Dashboard.
  2. Observe the "TOTAL REVENUE ($sum)" card.
- **Expected Result**: Endpoint `GET /api/dashboard/stats` executes aggregation `$match: { status: { $ne: 'Cancelled' } }` followed by `$group: { _id: null, totalRevenue: { $sum: '$totalAmount' } }`. Value accurately displays `₹1,03,993`, excluding the cancelled booking.
- **Status**: Passed

---

### TC-12: MongoDB Aggregation Pipeline - Bookings by Tour Ranking
- **Test ID**: TC-12
- **Module**: DBMS Aggregation
- **Preconditions**: Multiple bookings exist across different tours.
- **Test Steps**:
  1. Inspect the "Aggregation Analytics: Bookings by Tour" table on `/admin.html`.
- **Expected Result**: MongoDB executes `$group` by `$tourName` computing `$sum: 1`, `$sum: '$numberOfPeople'`, and `$sum: '$totalAmount'`, sorted by `$sort: { bookingCount: -1 }`. Table ranks the most popular tours at the top with passenger count and total revenue generated.
- **Status**: Passed