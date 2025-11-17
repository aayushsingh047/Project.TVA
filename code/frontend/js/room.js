const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id');
let roomData = null;

// Demo rooms data
const demoRooms = {
    '1': {
        id: '1',
        name: 'Deluxe Suite',
        price: 299,
        description: 'Spacious suite with king bed, premium amenities, and city view',
        amenities: ['Free WiFi', 'Air Conditioning', '32" Smart TV', 'Minibar', 'Premium Toiletries'],
        capacity: 2,
        image: '/luxury-deluxe-suite-hotel-room.jpg',
    },
    '2': {
        id: '2',
        name: 'Ocean View Room',
        price: 199,
        description: 'Beautiful room with ocean view, balcony, and modern furnishings',
        amenities: ['Ocean View Balcony', 'Free WiFi', 'Flat Screen TV', 'Work Desk', 'Bathroom with Shower'],
        capacity: 2,
        image: '/ocean-view-hotel-room.jpg',
    },
    '3': {
        id: '3',
        name: 'Standard Room',
        price: 149,
        description: 'Comfortable room with essential amenities for a pleasant stay',
        amenities: ['Free WiFi', 'Air Conditioning', 'LED TV', 'Work Desk', 'Private Bathroom'],
        capacity: 1,
        image: '/standard-hotel-room.jpg',
    },
};

async function loadRoomDetail() {
    try {
        roomData = demoRooms[roomId];
        
        if (!roomData) {
            document.getElementById('roomDetail').innerHTML = '<p style="color: #dc2626;">Room not found</p>';
            return;
        }

        const detailDiv = document.getElementById('roomDetail');
        
        detailDiv.innerHTML = `
            <div class="room-detail-image">
                <img src="${roomData.image}" alt="${roomData.name}" style="width: 100%; height: 400px; object-fit: cover; border-radius: 8px;">
            </div>
            <div class="room-detail-content">
                <h1>${roomData.name}</h1>
                <p class="price" style="font-size: 1.8rem; color: #c9a961; font-weight: bold; margin-bottom: 1rem;">$${roomData.price} per night</p>
                <p style="color: #6b7280; font-size: 1rem; margin-bottom: 1.5rem;">${roomData.description}</p>
                <div class="amenities">
                    <h3 style="color: #1f2937; font-weight: 600; margin-bottom: 0.75rem;">Amenities</h3>
                    <ul style="list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                        ${roomData.amenities.map(a => `<li style="padding: 0.5rem; background-color: #f3f4f6; border-radius: 4px; color: #1f2937;">✓ ${a}</li>`).join('')}
                    </ul>
                </div>
                <p style="margin-top: 1.5rem; color: #6b7280;"><strong>Capacity:</strong> Up to ${roomData.capacity} guest${roomData.capacity > 1 ? 's' : ''}</p>
            </div>
        `;
        
        const bookingDiv = document.getElementById('bookingWidget');
        bookingDiv.innerHTML = `
            <h3 style="font-size: 1.2rem; color: #1f2937; margin-bottom: 1.5rem;">Book This Room</h3>
            <form id="bookingForm" style="display: grid; gap: 1rem;">
                <div class="form-group">
                    <label style="display: block; margin-bottom: 0.5rem; color: #1f2937; font-weight: 500;">Check-in Date</label>
                    <input type="date" id="checkIn" class="form-input" required>
                </div>
                <div class="form-group">
                    <label style="display: block; margin-bottom: 0.5rem; color: #1f2937; font-weight: 500;">Check-out Date</label>
                    <input type="date" id="checkOut" class="form-input" required>
                </div>
                <div class="form-group">
                    <label style="display: block; margin-bottom: 0.5rem; color: #1f2937; font-weight: 500;">Number of Guests</label>
                    <input type="number" id="guests" class="form-input" value="1" min="1" max="${roomData.capacity}" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Proceed to Checkout</button>
                <p id="bookingMessage" style="display: none; margin-top: 0.75rem;"></p>
            </form>
        `;
        
        document.getElementById('bookingForm').addEventListener('submit', handleBooking);
    } catch (error) {
        console.error('[v0] Failed to load room:', error);
    }
}

async function handleBooking(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    
    // Redirect to auth if not logged in
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guests = document.getElementById('guests').value;
    
    // Validate dates
    if (new Date(checkIn) >= new Date(checkOut)) {
        showBookingMessage('Check-out date must be after check-in date', 'error');
        return;
    }

    // Calculate nights and total price
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * roomData.price;

    // Store booking data
    const bookingData = {
        roomId: roomData.id,
        roomName: roomData.name,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        pricePerNight: roomData.price,
        totalPrice: totalPrice,
        bookingId: 'booking_' + Date.now(),
    };

    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    showBookingMessage('Redirecting to checkout...', 'success');
    
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1000);
}

function showBookingMessage(message, type) {
    const messageEl = document.getElementById('bookingMessage');
    messageEl.style.display = 'block';
    messageEl.className = `auth-message ${type}`;
    messageEl.textContent = message;
}

document.addEventListener('DOMContentLoaded', loadRoomDetail);
