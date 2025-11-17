function initDashboard() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Redirect to auth if not logged in
    if (!token || !user) {
        window.location.href = 'auth.html';
        return;
    }

    document.getElementById('userEmail').textContent = `Email: ${user.email}`;

    displayBookings();
}

function displayBookings() {
    const bookingsList = document.getElementById('bookingsList');
    const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');

    if (bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                <h2>No Bookings Yet</h2>
                <p>Start exploring our rooms and book your perfect stay</p>
                <a href="rooms.html" class="btn btn-primary" style="display: inline-block; margin-top: 1rem;">Browse Rooms</a>
            </div>
        `;
        return;
    }

    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h3>${booking.roomName}</h3>
                <span class="booking-status ${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
            </div>

            <div class="booking-details">
                <div class="detail-item">
                    <div class="detail-label">Check-in</div>
                    <div class="detail-value">${new Date(booking.checkInDate).toLocaleDateString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Check-out</div>
                    <div class="detail-value">${new Date(booking.checkOutDate).toLocaleDateString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Price</div>
                    <div class="detail-value" style="color: #c9a961;">$${booking.totalPrice}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Booking ID</div>
                    <div class="detail-value">${booking.bookingId}</div>
                </div>
            </div>

            <button onclick="cancelBooking('${booking.bookingId}')" class="btn btn-secondary" style="margin-top: 1rem; width: 100%;">Cancel Booking</button>
        </div>
    `).join('');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        let bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        bookings = bookings.map(b => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b);
        localStorage.setItem('myBookings', JSON.stringify(bookings));
        displayBookings();
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
