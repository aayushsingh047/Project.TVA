// Account page logic
async function loadAccountData() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Load user info
    const userDiv = document.getElementById('userInfo');
    userDiv.innerHTML = `
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Member Since:</strong> ${new Date().toLocaleDateString()}</p>
    `;

    // Load bookings
    try {
        const data = await bookingAPI.getOrders();
        const bookingsList = document.getElementById('bookingsList');

        if (data.orders.length === 0) {
            bookingsList.innerHTML = '<p>No bookings yet.</p>';
        } else {
            bookingsList.innerHTML = data.orders.map(order => `
                <div class="booking-item">
                    <div class="booking-item-header">
                        <h3>Booking #${order.id.substring(0, 8)}</h3>
                        <span class="booking-status ${order.status}">${order.status.toUpperCase()}</span>
                    </div>
                    <div class="booking-item-info">
                        <p><strong>Check-in:</strong> ${order.checkIn}</p>
                        <p><strong>Check-out:</strong> ${order.checkOut}</p>
                        <p><strong>Guests:</strong> ${order.guests}</p>
                        <p><strong>Total:</strong> $${order.totalPrice}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load bookings:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadAccountData);
