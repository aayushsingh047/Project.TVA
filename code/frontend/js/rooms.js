let currentPage = 1;

const demoRooms = [
    {
        id: '1',
        name: 'Deluxe Suite',
        price: 299,
        description: 'Spacious suite with king bed and premium amenities',
        image: '/luxury-deluxe-suite-hotel.jpg',
    },
    {
        id: '2',
        name: 'Ocean View Room',
        price: 199,
        description: 'Beautiful room with ocean view and balcony',
        image: '/ocean-view-luxury-room.jpg',
    },
    {
        id: '3',
        name: 'Standard Room',
        price: 149,
        description: 'Comfortable room with modern furnishings',
        image: '/standard-hotel-room-modern.jpg',
    },
];

async function loadRooms() {
    try {
        const grid = document.getElementById('roomsGrid');
        
        grid.innerHTML = demoRooms.map(room => `
            <div class="room-card" onclick="window.location.href='room.html?id=${room.id}'" style="cursor: pointer;">
                <img src="${room.image}" alt="${room.name}" style="width: 100%; height: 200px; object-fit: cover;">
                <div class="room-card-content">
                    <h3 class="room-card-title">${room.name}</h3>
                    <p class="room-card-price" style="color: #c9a961;">$${room.price}/night</p>
                    <p class="room-card-desc">${room.description}</p>
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation();">View Details</button>
                </div>
            </div>
        `).join('');

        // Simple pagination for demo
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
    } catch (error) {
        console.error('[v0] Failed to load rooms:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadRooms);
