# MongoDB Aggregation Pipelines

The **MongoDB Aggregation Framework** executes multi-stage data transformations directly on the database engine. In the Tour & Travel Management System, aggregations power real-time analytical reports on the **Admin Dashboard** (`GET /api/dashboard/stats`).

---

## 1. Aggregation Pipeline 1: Total Revenue Calculation

### Objective:
Calculate the sum of all payments from non-cancelled customer bookings.

### Pipeline Stages:
1. **`$match`**: Filters out any reservation with status `'Cancelled'`, ensuring only active/confirmed revenue is counted.
2. **`$group`**: Groups all matching documents together (`_id: null`) and applies the `$sum` accumulator on the `totalAmount` field.

### MongoDB Shell Command:
```javascript
db.bookings.aggregate([
  {
    $match: {
      status: { $ne: "Cancelled" }
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$totalAmount" }
    }
  }
]);
```

### Sample Output:
```json
[
  {
    "_id": null,
    "totalRevenue": 103993
  }
]
```

### Express / Mongoose Implementation:
```javascript
// backend/routes/dashboardRoutes.js
const revenueAgg = await Booking.aggregate([
  { $match: { status: { $ne: 'Cancelled' } } },
  { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
]);
const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
```

---

## 2. Aggregation Pipeline 2: Bookings Grouped by Tour

### Objective:
Generate a performance breakdown for each tour package, reporting:
- Number of bookings made
- Total passengers booked
- Cumulative revenue generated per tour
- Ranked in descending order of popularity

### Pipeline Stages:
1. **`$group`**: Groups documents by `$tourName`.
   - `bookingCount`: Accumulates 1 per document using `{ $sum: 1 }`.
   - `totalPeople`: Sums the `$numberOfPeople` field.
   - `tourRevenue`: Sums the `$totalAmount` field.
2. **`$sort`**: Sorts the resulting groups in descending order (`-1`) of `bookingCount`.

### MongoDB Shell Command:
```javascript
db.bookings.aggregate([
  {
    $group: {
      _id: "$tourName",
      bookingCount: { $sum: 1 },
      totalPeople: { $sum: "$numberOfPeople" },
      tourRevenue: { $sum: "$totalAmount" }
    }
  },
  {
    $sort: { bookingCount: -1 }
  }
]);
```

### Sample Output:
```json
[
  {
    "_id": "Manali & Solang Valley Snow Trail",
    "bookingCount": 2,
    "totalPeople": 5,
    "tourRevenue": 79995
  },
  {
    "_id": "Goa Coastal Beach & Cruise Holiday",
    "bookingCount": 1,
    "totalPeople": 2,
    "tourRevenue": 25998
  },
  {
    "_id": "Kerala Backwaters & Munnar Tea Hills",
    "bookingCount": 1,
    "totalPeople": 2,
    "tourRevenue": 29998
  }
]
```

---


## 3. Why Use MongoDB Aggregation over Client-Side Computation?
1. **Database-Level Processing**: Aggregations execute directly inside the MongoDB memory engine, streaming only summary numbers back to Node.js rather than thousands of raw booking documents.
2. **Reduced Bandwidth & Latency**: Computing `$sum` in the database eliminates network serialization overhead.
3. **Index-Aware Execution**: The `$match` and `$sort` stages can utilize indexes (such as on `status` or `tourName`), providing $O(\log n)$ efficiency.
