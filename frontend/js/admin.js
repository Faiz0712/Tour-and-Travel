document.addEventListener('DOMContentLoaded', () => {
  loadAdminDashboard();
  setupModalEvents();
  setupLogout();
});

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('adminLoggedIn');
      fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
      window.location.href = 'admin-login.html';
    });
  }
}

async function loadAdminDashboard() {
  await fetchStats();
  await fetchTours();
  await fetchBookings();
}

// 1. Stats and MongoDB Aggregation Report
async function fetchStats() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const result = await res.json();
    if (result.success) {
      const { totalTours, totalBookings, totalRevenue, bookingsByTour } = result.data;
      document.getElementById('statTours').textContent = totalTours;
      document.getElementById('statBookings').textContent = totalBookings;
      document.getElementById('statRevenue').textContent = `₹${(totalRevenue || 0).toLocaleString('en-IN')}`;

      const aggTbody = document.getElementById('aggTbody');
      if (bookingsByTour && bookingsByTour.length > 0) {
        aggTbody.innerHTML = bookingsByTour.map(item => `
          <tr>
            <td><strong>${item._id}</strong></td>
            <td>${item.bookingCount}</td>
            <td>${item.totalPeople}</td>
            <td style="color: var(--primary); font-weight: 700;">₹${item.tourRevenue.toLocaleString('en-IN')}</td>
          </tr>
        `).join('');
      } else {
        aggTbody.innerHTML = '<tr><td colspan="4">No bookings recorded yet.</td></tr>';
      }
    }
  } catch (err) {
    console.error('Stats loading error:', err);
  }
}

// 2. Fetch and render tours
async function fetchTours() {
  const tbody = document.getElementById('toursTbody');
  try {
    const res = await fetch('/api/tours');
    const result = await res.json();
    if (result.success && result.data.length > 0) {
      tbody.innerHTML = result.data.map(t => `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td>${t.destination}</td>
          <td>${t.duration}</td>
          <td>₹${t.price.toLocaleString('en-IN')}</td>
          <td>${t.availableSeats}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick='openEditModal(${JSON.stringify(t)})'>Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteTour('${t._id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6">No tours in database.</td></tr>';
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:red;">Failed to load tours</td></tr>';
  }
}

// 3. Fetch and render customer bookings
async function fetchBookings() {
  const tbody = document.getElementById('bookingsTbody');
  try {
    const res = await fetch('/api/bookings');
    const result = await res.json();
    if (result.success && result.data.length > 0) {
      tbody.innerHTML = result.data.map(b => `
        <tr>
          <td>
            <strong>${b.customerName}</strong><br>
            <small style="color: var(--text-muted);">${b.email} | ${b.phone}</small>
          </td>
          <td>${b.tourName}</td>
          <td>${new Date(b.travelDate).toLocaleDateString()}</td>
          <td>${b.numberOfPeople}</td>
          <td><strong>₹${b.totalAmount.toLocaleString('en-IN')}</strong></td>
          <td><span class="badge badge-${b.status}">${b.status}</span></td>
          <td>
            <select onchange="updateBookingStatus('${b._id}', this.value)" class="form-control" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">
              <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="7">No customer bookings recorded yet.</td></tr>';
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="color:red;">Failed to load bookings</td></tr>';
  }
}

// 4. Update booking status
async function updateBookingStatus(id, status) {
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    if (!result.success) {
      alert(result.message || 'Status update failed');
    }
    loadAdminDashboard();
  } catch (err) {
    alert('Error updating status: ' + err.message);
  }
}

// 5. Delete tour
async function deleteTour(id) {
  if (!confirm('Are you sure you want to delete this tour package?')) return;
  try {
    const res = await fetch(`/api/tours/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) {
      alert(result.message || 'Deletion failed');
    }
    loadAdminDashboard();
  } catch (err) {
    alert('Failed to delete tour: ' + err.message);
  }
}

// 6. Modal controls for Add & Edit
function setupModalEvents() {
  const modal = document.getElementById('tourModal');
  const addBtn = document.getElementById('addTourBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('tourForm');

  addBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New Tour Package';
    document.getElementById('editTourId').value = '';
    form.reset();
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editTourId').value;
    const payload = {
      name: document.getElementById('mName').value.trim(),
      destination: document.getElementById('mDest').value.trim(),
      duration: document.getElementById('mDuration').value.trim(),
      price: parseFloat(document.getElementById('mPrice').value),
      availableSeats: parseInt(document.getElementById('mSeats').value, 10),
      category: document.getElementById('mCategory').value,
      description: document.getElementById('mDesc').value.trim(),
      image: document.getElementById('mImage').value.trim()
    };

    const endpoint = id ? `/api/tours/${id}` : '/api/tours';
    const method = id ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!result.success) {
        alert(result.message || 'Failed to save tour');
        return;
      }
      modal.classList.remove('active');
      loadAdminDashboard();
    } catch (err) {
      alert('Error saving tour: ' + err.message);
    }
  });
}

function openEditModal(tour) {
  const modal = document.getElementById('tourModal');
  document.getElementById('modalTitle').textContent = 'Edit Tour Package';
  document.getElementById('editTourId').value = tour._id;
  document.getElementById('mName').value = tour.name;
  document.getElementById('mDest').value = tour.destination;
  document.getElementById('mDuration').value = tour.duration;
  document.getElementById('mPrice').value = tour.price;
  document.getElementById('mSeats').value = tour.availableSeats;
  document.getElementById('mCategory').value = tour.category;
  document.getElementById('mDesc').value = tour.description;
  document.getElementById('mImage').value = tour.image;
  modal.classList.add('active');
}