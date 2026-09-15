document.addEventListener('DOMContentLoaded', async () => {
  const tourId = new URLSearchParams(window.location.search).get('tourId');
  if (!tourId) {
    alert('Please select a tour package first.');
    window.location.href = 'tours.html';
    return;
  }

  const travelDateInput = document.getElementById('travelDate');
  travelDateInput.min = new Date().toISOString().split('T')[0];

  const peopleInput = document.getElementById('numberOfPeople');
  const unitPriceInput = document.getElementById('unitPrice');
  const displayTotal = document.getElementById('displayTotal');
  const availableSeatsInput = document.getElementById('availableSeats');
  const seatsNotice = document.getElementById('seatsNotice');

  try {
    const res = await fetch(`/api/tours/${tourId}`);
    const result = await res.json();
    if (result.success && result.data) {
      const tour = result.data;
      document.getElementById('tourHeaderLabel').textContent = `${tour.name} (₹${tour.price.toLocaleString('en-IN')} / person)`;
      document.getElementById('tourId').value = tour._id;
      unitPriceInput.value = tour.price;
      availableSeatsInput.value = tour.availableSeats;
      seatsNotice.textContent = `Available seats: ${tour.availableSeats}`;
      peopleInput.max = tour.availableSeats;

      if (tour.availableSeats <= 0) {
        alert('Sorry, this tour package is completely sold out!');
        window.location.href = 'tours.html';
        return;
      }
      calc();
    } else {
      alert('Tour package not found.');
      window.location.href = 'tours.html';
    }
  } catch (err) {
    alert('Error loading tour details');
  }

  // Real-time dynamic price calculation: Total Amount = Tour Price × Number of People
  function calc() {
    const price = parseFloat(unitPriceInput.value) || 0;
    const count = parseInt(peopleInput.value, 10) || 0;
    displayTotal.textContent = `₹${(price * count).toLocaleString('en-IN')}`;
  }

  peopleInput.addEventListener('input', calc);

  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const people = parseInt(peopleInput.value, 10);
    const available = parseInt(availableSeatsInput.value, 10);

    if (people > available) {
      alert(`Cannot book for ${people} people. Only ${available} seat(s) are remaining.`);
      return;
    }

    const payload = {
      customerName: document.getElementById('customerName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      tourId: document.getElementById('tourId').value,
      numberOfPeople: people,
      travelDate: travelDateInput.value
    };

    try {
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Processing Reservation...';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success && result.data) {
        window.location.href = `confirmation.html?id=${result.data._id}`;
      } else {
        alert(result.message || 'Booking submission failed');
        btn.disabled = false;
        btn.textContent = 'Confirm & Book Tour';
      }
    } catch (err) {
      alert('Booking error: ' + err.message);
      document.getElementById('submitBtn').disabled = false;
      document.getElementById('submitBtn').textContent = 'Confirm & Book Tour';
    }
  });
});