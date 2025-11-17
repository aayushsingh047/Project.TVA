// Admin panel logic
async function checkAdminAccess() {
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
}

async function loadRooms() {
    try {
        const data = await roomsAPI.list(1, 50);
        const roomsList = document.getElementById('roomsList');

        roomsList.innerHTML = data.rooms.map(room => `
            <div class="room-item">
                <div class="room-item-info">
                    <h3>${room.name}</h3>
                    <p>$${room.price}/night | Capacity: ${room.capacity}</p>
                </div>
                <div class="room-item-actions">
                    <button onclick="editRoom('${room.id}')" class="btn btn-secondary btn-small">Edit</button>
                    <button onclick="deleteRoom('${room.id}')" class="btn btn-danger btn-small">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load rooms:', error);
    }
}

async function handleRoomSubmit(e) {
    e.preventDefault();

    const room = {
        name: document.getElementById('roomName').value,
        description: document.getElementById('roomDesc').value,
        price: parseFloat(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        amenities: ['WiFi', 'Air Conditioning', 'TV'],
    };

    try {
        await roomsAPI.create(room);
        document.getElementById('roomForm').reset();
        loadRooms();
        alert('Room created successfully!');
    } catch (error) {
        alert('Failed to create room: ' + error.message);
    }
}

async function deleteRoom(id) {
    if (confirm('Are you sure?')) {
        try {
            await roomsAPI.delete(id);
            loadRooms();
        } catch (error) {
            alert('Failed to delete room: ' + error.message);
        }
    }
}

// Tab switching
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    loadRooms();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');
        });
    });

    document.getElementById('roomForm').addEventListener('submit', handleRoomSubmit);
});
