document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('toursContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/tours');
    const result = await res.json();
    if (result.success && result.data.length > 0) {
      container.innerHTML = result.data.map(tour => {
        const isSoldOut = tour.availableSeats <= 0;
        const seatsClass = isSoldOut ? 'seats-soldout' : (tour.availableSeats <= 5 ? 'seats-low' : 'seats-ok');
        const seatsText = isSoldOut ? 'Sold Out' : `${tour.availableSeats} seats left`;

        return `
          <div class="tour-card">
            <div class="tour-card-img-wrap">
              <img src="${tour.image}" alt="${tour.name}" class="tour-card-img" onerror="this.src='https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'">
              <span class="tour-badge">${tour.category}</span>
            </div>
            <div class="tour-card-body">
              <h3 class="tour-card-title">${tour.name}</h3>
              <div class="tour-card-dest">📍 ${tour.destination}</div>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.8rem;">
                ${tour.description.length > 85 ? tour.description.substring(0, 85) + '...' : tour.description}
              </p>
              <div class="tour-card-meta">
                <span>⏱️ ${tour.duration}</span>
                <span class="seats-pill ${seatsClass}">${seatsText}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.85rem;">
                <div class="tour-card-price">₹${tour.price.toLocaleString('en-IN')}</div>
                <a href="tour-details.html?id=${tour._id}" class="btn ${isSoldOut ? 'btn-secondary' : 'btn-primary'} btn-sm">View Details</a>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No tour packages found.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Failed to load packages from database.</p>';
  }
});