const API_BASE = 'http://localhost:5000/api';

let bookingData = null;

function initializeCheckout() {
    const roomInfo = JSON.parse(sessionStorage.getItem('bookingRoom') || '{}');
    
    bookingData = {
      roomId: roomInfo.roomId,
      roomName: roomInfo.roomName,
      pricePerNight: roomInfo.roomPrice,
      totalPrice: roomInfo.roomPrice,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    };
    
    if (!bookingData.roomId) {
        document.getElementById('paymentMessage').innerHTML = '<p style="color: #dc2626;">No booking data found. <a href="rooms.html" style="text-decoration: underline;">Go back to rooms</a></p>';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
        document.getElementById('guestEmail').value = user.email;
    }

    // Display order summary
    displayOrderSummary();

    // Handle form submission
    document.getElementById('checkoutForm').addEventListener('submit', handlePayment);

    // Format card inputs
    formatCardInputs();
}

function displayOrderSummary() {
    const orderDetails = document.getElementById('orderDetails');
    const totalAmount = document.getElementById('totalAmount');

    const checkInDate = new Date(bookingData.checkInDate).toLocaleDateString();
    const checkOutDate = new Date(bookingData.checkOutDate).toLocaleDateString();
    const nights = Math.ceil((new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24));

    orderDetails.innerHTML = `
        <div class="summary-item">
            <span>Room:</span>
            <span>${bookingData.roomName}</span>
        </div>
        <div class="summary-item">
            <span>Check-in:</span>
            <span>${checkInDate}</span>
        </div>
        <div class="summary-item">
            <span>Check-out:</span>
            <span>${checkOutDate}</span>
        </div>
        <div class="summary-item">
            <span>Nights:</span>
            <span>${nights}</span>
        </div>
        <div class="summary-item">
            <span>Price per night:</span>
            <span>$${bookingData.pricePerNight}</span>
        </div>
    `;

    totalAmount.textContent = `$${bookingData.totalPrice}`;
}

function formatCardInputs() {
    // Card number formatting
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = formattedValue;
    });

    // Expiry date formatting
    document.getElementById('cardExpiry').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // CVV number only
    document.getElementById('cardCVV').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

async function handlePayment(e) {
    e.preventDefault();

    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;

    // Validate card details
    if (cardNumber.length !== 16) {
        showPaymentMessage('Invalid card number', 'error');
        return;
    }

    if (cardExpiry.length !== 5) {
        showPaymentMessage('Invalid expiry date', 'error');
        return;
    }

    if (cardCVV.length !== 3) {
        showPaymentMessage('Invalid CVV', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        
        // Create payment intent via backend
        const paymentResponse = await fetch(`${API_BASE}/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                amount: bookingData.totalPrice,
                bookingId: bookingData.bookingId,
            }),
        });

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
            throw new Error(paymentData.error || 'Payment failed');
        }

        // DEMO: Simulate payment processing
        showPaymentMessage('Processing payment...', 'info');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Demo success response
        const booking = await bookingAPI.create(
            bookingData.roomId,
            bookingData.checkInDate,
            bookingData.checkOutDate,
            bookingData.totalPrice
        );

        // Store successful booking
        const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        bookings.push({
            ...bookingData,
            bookingId: Math.random().toString(36).substr(2, 9),
            status: 'confirmed',
            paymentId: paymentData.clientSecret,
            bookedAt: new Date().toISOString(),
        });
        localStorage.setItem('myBookings', JSON.stringify(bookings));

        showPaymentMessage('Payment successful! Redirecting...', 'success');
        
        setTimeout(() => {
            sessionStorage.removeItem('bookingData');
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {
        console.error('[v0] Payment error:', error);
        showPaymentMessage('Payment failed: ' + error.message, 'error');
    }
}

function showPaymentMessage(message, type) {
    const messageEl = document.getElementById('paymentMessage');
    messageEl.className = `auth-message ${type}`;
    messageEl.textContent = message;
}

document.addEventListener('DOMContentLoaded', initializeCheckout);
