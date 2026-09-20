/**
 * User Dashboard Logic - My Bookings & Profile
 * Tour & Travel Management System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce user authentication
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  const userNameEl = document.getElementById('user-display-name');
  const userEmailEl = document.getElementById('user-display-email');
  const userPhoneEl = document.getElementById('user-phone');
  const userRoleBadgeEl = document.getElementById('user-role-badge');
  const userAvatarEl = document.getElementById('user-avatar');
  const logoutBtn = document.getElementById('logout-btn');
  const alertBox = document.getElementById('dashboard-alert');
  const tbody = document.getElementById('bookings-tbody');
  const noBookingsEl = document.getElementById('no-bookings-placeholder');
  const refreshBtn = document.getElementById('refresh-bookings-btn');

  // Stats elements
  const statTotalBookings = document.getElementById('stat-total-bookings');
  const statConfirmedTrips = document.getElementById('stat-confirmed-trips');
  const statTotalSpent = document.getElementById('stat-total-spent');

  // Populate basic profile from cached storage
  if (user) {
    userNameEl.textContent = `Welcome back, ${user.name}!`;
    userEmailEl.textContent = user.email;
    if (user.phone) userPhoneEl.textContent = `Phone: ${user.phone}`;
    userRoleBadgeEl.textContent = user.role === 'admin' ? '👑 Administrator' : '🎒 Traveler Account';
    userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
  }

  function showAlert(message, type = 'success') {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
    setTimeout(() => {
      alertBox.classList.add('d-none');
    }, 4000);
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        Auth.logout();
      }
    });
  }

  // Fetch updated profile
  async function fetchUserProfile() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: Auth.getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          Auth.setAuth(Auth.getToken(), data.user);
          userNameEl.textContent = `Welcome back, ${data.user.name}!`;
          userEmailEl.textContent = data.user.email;
          if (data.user.phone) userPhoneEl.textContent = `Phone: ${data.user.phone}`;
        }
      }
    } catch (err) {
      console.warn('Could not refresh profile:', err);
    }
  }

  // Fetch User's Bookings
  async function loadMyBookings() {
    try {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">Loading your bookings...</td></tr>`;
      noBookingsEl.classList.add('d-none');

      const res = await fetch('/api/bookings/my', {
        headers: Auth.getAuthHeaders()
      });

      if (res.status === 401) {
        alert('Your session has expired. Please sign in again.');
        Auth.logout();
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">${escapeHtml(data.message || 'Error fetching bookings')}</td></tr>`;
        return;
      }

      const bookings = data.data || [];

      // Calculate stats
      let totalSpent = 0;
      let confirmedCount = 0;

      bookings.forEach(b => {
        if (b.status === 'Confirmed') {
          confirmedCount++;
          totalSpent += (b.totalAmount || 0);
        } else if (b.status === 'Pending') {
          totalSpent += (b.totalAmount || 0);
        }
      });

      statTotalBookings.textContent = bookings.length;
      statConfirmedTrips.textContent = confirmedCount;
      statTotalSpent.textContent = `₹${totalSpent.toLocaleString('en-IN')}`;

      if (bookings.length === 0) {
        tbody.innerHTML = '';
        noBookingsEl.classList.remove('d-none');
        return;
      }

      // Render bookings rows
      tbody.innerHTML = bookings.map(b => {
        const dateStr = b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'short', day: 'numeric'
        }) : 'N/A';

        const statusClass = b.status === 'Confirmed' ? 'badge-confirmed' :
                            b.status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending';

        const canCancel = b.status !== 'Cancelled';

        return `
          <tr>
            <td><code>#${escapeHtml(b._id.slice(-6).toUpperCase())}</code></td>
            <td><strong>${escapeHtml(b.tourName)}</strong></td>
            <td>${dateStr}</td>
            <td>${b.numberOfPeople} Person(s)</td>
            <td>₹${(b.totalAmount || 0).toLocaleString('en-IN')}</td>
            <td><span class="badge ${statusClass}">${escapeHtml(b.status)}</span></td>
            <td>
              ${canCancel ? `
                <button class="btn btn-sm btn-outline-danger cancel-booking-btn" data-id="${b._id}" data-tour="${escapeHtml(b.tourName)}">
                  Cancel
                </button>
              ` : `
                <span class="text-muted text-sm">No actions</span>
              `}
            </td>
          </tr>
        `;
      }).join('');

      // Attach cancel handlers
      document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const bookingId = e.target.getAttribute('data-id');
          const tourName = e.target.getAttribute('data-tour');

          if (!confirm(`Are you sure you want to cancel your booking for "${tourName}"? Seats will be returned to the pool.`)) {
            return;
          }

          try {
            e.target.disabled = true;
            e.target.textContent = 'Cancelling...';

            const cancelRes = await fetch(`/api/bookings/${bookingId}/cancel`, {
              method: 'PUT',
              headers: Auth.getAuthHeaders()
            });

            const cancelData = await cancelRes.json();
            if (cancelRes.ok && cancelData.success) {
              showAlert('Booking cancelled successfully. Seats have been returned.', 'success');
              loadMyBookings();
            } else {
              showAlert(cancelData.message || 'Failed to cancel booking.', 'error');
              e.target.disabled = false;
              e.target.textContent = 'Cancel';
            }
          } catch (err) {
            console.error('Cancel booking error:', err);
            showAlert('Network error while cancelling booking.', 'error');
            e.target.disabled = false;
            e.target.textContent = 'Cancel';
          }
        });
      });

    } catch (err) {
      console.error('Error loading user bookings:', err);
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load bookings from server.</td></tr>`;
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadMyBookings();
    });
  }

  // Initial load
  fetchUserProfile();
  loadMyBookings();
});
