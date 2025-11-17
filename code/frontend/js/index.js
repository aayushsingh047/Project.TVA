const demoFeaturedRooms = [
    {
        id: '1',
        name: 'Deluxe Suite',
        price: 299,
        description: 'Spacious suite with king bed and premium amenities',
        image: '/placeholder.svg?key=luxurysuite',
    },
    {
        id: '2',
        name: 'Ocean View Room',
        price: 199,
        description: 'Beautiful room with ocean view and balcony',
        image: '/placeholder.svg?key=oceanview',
    },
    {
        id: '3',
        name: 'Standard Room',
        price: 149,
        description: 'Comfortable room with modern furnishings',
        image: '/placeholder.svg?key=standardroom',
    },
];

async function loadFeaturedRooms() {
    try {
        const grid = document.getElementById('roomsGrid');
        
        grid.innerHTML = demoFeaturedRooms.map(room => `
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
    } catch (error) {
        console.error('[v0] Failed to load rooms:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadFeaturedRooms);
