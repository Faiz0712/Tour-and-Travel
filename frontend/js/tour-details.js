document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('tourDetailsContent');
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id) {
    container.innerHTML = '<p style="color: var(--danger);">No tour selected. <a href="tours.html">Return to catalog</a></p>';
    return;
  }

  try {
    const res = await fetch(`/api/tours/${id}`);
    const result = await res.json();
    if (result.success && result.data) {
      const tour = result.data;
      const isSoldOut = tour.availableSeats <= 0;
      container.innerHTML = `
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; padding: 1.8rem; box-shadow: var(--shadow);">
          <img src="${tour.image}" alt="${tour.name}" style="width: 100%; height: 380px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'">
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <span style="background: var(--secondary); color: #fff; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; width: fit-content; margin-bottom: 0.5rem;">${tour.category}</span>
            <h1 style="font-size: 2rem; color: var(--secondary); margin-bottom: 0.3rem;">${tour.name}</h1>
            <div style="color: var(--primary); font-weight: 600; font-size: 1.05rem; margin-bottom: 1rem;">📍 ${tour.destination}</div>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.95rem;">${tour.description}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border);">
              <div><small style="color: var(--text-muted);">Duration</small><div style="font-weight: 700; color: var(--secondary);">⏱️ ${tour.duration}</div></div>
              <div><small style="color: var(--text-muted);">Price per person</small><div style="font-size: 1.25rem; color: var(--primary); font-weight: 800;">₹${tour.price.toLocaleString('en-IN')}</div></div>
              <div><small style="color: var(--text-muted);">Available Seats</small><div><strong style="color: ${isSoldOut ? 'var(--danger)' : 'var(--success)'};">${isSoldOut ? 'Sold Out (0 Seats Left)' : `${tour.availableSeats} Seats Remaining`}</strong></div></div>
              <div><small style="color: var(--text-muted);">Category</small><div style="font-weight: 600;">${tour.category}</div></div>
            </div>
            ${
              isSoldOut 
                ? '<button class="btn btn-secondary" disabled style="padding: 0.75rem; cursor: not-allowed;">Sold Out</button>' 
                : `<a href="booking.html?tourId=${tour._id}" class="btn btn-primary" style="font-size: 1rem; padding: 0.8rem;">Book Now</a>`
            }
          </div>
        </div>
      `;
    } else {
      container.innerHTML = '<p style="color: var(--danger);">Tour package not found.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="color: var(--danger);">Failed to load tour details.</p>';
  }
});