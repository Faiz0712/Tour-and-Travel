# Software Engineering - Activity Diagrams

This document contains Activity Diagrams detailing the operational workflows of the **Tour & Travel Management System**, reflecting the actual client-server execution paths.

---

## 1. Activity Diagram 1: Customer Tour Booking Workflow

```mermaid
stateDiagram-v2
    [*] --> BrowseHomePage: Customer visits http://localhost:5000
    BrowseHomePage --> ViewCatalog: Click "Explore Tours"
    ViewCatalog --> InspectTourDetails: Select specific tour card ("View Details")
    InspectTourDetails --> CheckAvailability: System checks tour.availableSeats

    state CheckAvailability <<choice>>
    CheckAvailability --> SoldOutState: availableSeats <= 0
    CheckAvailability --> OpenBookingForm: availableSeats > 0

    SoldOutState --> ViewCatalog: Button disabled ("Sold Out")
    
    OpenBookingForm --> InputTravelers: Enter Customer Name, Email, Phone, Date
    InputTravelers --> DynamicCalculation: Change Number of People
    DynamicCalculation --> InputTravelers: Total Amount = Tour Price × People (Live in DOM)

    InputTravelers --> SubmitBooking: Click "Confirm & Book Tour"
    SubmitBooking --> ValidateBackendSeats: POST /api/bookings

    state ValidateBackendSeats <<choice>>
    ValidateBackendSeats --> RejectBooking: numberOfPeople > availableSeats
    ValidateBackendSeats --> PersistBooking: numberOfPeople <= availableSeats

    RejectBooking --> OpenBookingForm: Display Alert ("Insufficient seats")
    
    PersistBooking --> DeductSeats: Create Booking doc in MongoDB
    DeductSeats --> ShowConfirmation: tour.availableSeats = availableSeats - numberOfPeople
    ShowConfirmation --> [*]: Render Confirmation Receipt (ID, Total, Details)
```

---

## 2. Activity Diagram 2: Admin Tour & Booking Status Management Workflow

```mermaid
stateDiagram-v2
    [*] --> OpenAdminDashboard: Admin opens /admin.html
    OpenAdminDashboard --> FetchAnalytics: GET /api/dashboard/stats
    FetchAnalytics --> RenderDashboard: Display Total Tours, Bookings, Revenue ($sum), & Aggregation Breakdown

    state AdminAction <<choice>>
    RenderDashboard --> AdminAction: Select Action

    AdminAction --> AddTourFlow: Click "+ Add New Tour"
    AddTourFlow --> SubmitTour: Fill Form & Click "Save Package"
    SubmitTour --> TourCreated: POST /api/tours & DB insertOne
    TourCreated --> RenderDashboard: Refresh Dashboard & Tables

    AdminAction --> EditTourFlow: Click "Edit" on Tour row
    EditTourFlow --> SubmitEdit: Modify details & Submit
    SubmitEdit --> TourUpdated: PUT /api/tours/:id & DB updateOne
    TourUpdated --> RenderDashboard: Refresh Dashboard & Tables

    AdminAction --> DeleteTourFlow: Click "Delete" on Tour row
    DeleteTourFlow --> TourDeleted: DELETE /api/tours/:id & DB deleteOne
    TourDeleted --> RenderDashboard: Refresh Dashboard & Tables

    AdminAction --> ChangeBookingStatus: Change Status Dropdown
    
    state StatusBranch <<choice>>
    ChangeBookingStatus --> StatusBranch: Inspect Previous vs New Status

    StatusBranch --> ReturnSeats: Confirmed/Pending -> Cancelled
    ReturnSeats --> UpdateStatusDB: tour.availableSeats += numberOfPeople

    StatusBranch --> ReDeductSeats: Cancelled -> Confirmed/Pending
    
    state SeatCheck <<choice>>
    ReDeductSeats --> SeatCheck: Check if availableSeats >= numberOfPeople
    SeatCheck --> RejectReinstatement: Insufficient seats available
    RejectReinstatement --> RenderDashboard: Show Alert ("Cannot reinstate")
    SeatCheck --> DeductSeatsAgain: tour.availableSeats -= numberOfPeople
    DeductSeatsAgain --> UpdateStatusDB: Save updated seats

    UpdateStatusDB --> RenderDashboard: Save status & re-render table and aggregations
```