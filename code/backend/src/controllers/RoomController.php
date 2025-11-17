<?php
// Room controller
class RoomController {
    public static function listRooms() {
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 10;

        $room = new Room();
        $rooms = $room->findAll($page, $limit);
        $total = $room->count();

        $roomsArray = array_map(function($r) {
            return [
                'id' => (string)$r['_id'],
                'name' => $r['name'],
                'description' => $r['description'],
                'price' => $r['price'],
                'capacity' => $r['capacity'],
                'amenities' => $r['amenities'],
                'image' => $r['image']
            ];
        }, $rooms);

        echo json_encode([
            'rooms' => $roomsArray,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]);
    }

    public static function getRoom($id) {
        $room = new Room();
        $roomDoc = $room->findById($id);

        if (!$roomDoc) {
            http_response_code(404);
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        echo json_encode([
            'id' => (string)$roomDoc['_id'],
            'name' => $roomDoc['name'],
            'description' => $roomDoc['description'],
            'price' => $roomDoc['price'],
            'capacity' => $roomDoc['capacity'],
            'amenities' => $roomDoc['amenities'],
            'image' => $roomDoc['image']
        ]);
    }

    public static function createRoom() {
        $user = AuthMiddleware::checkAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data['name'] || !$data['price']) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $room = new Room();
        $newRoom = $room->create($data);

        http_response_code(201);
        echo json_encode([
            'message' => 'Room created',
            'room' => [
                'id' => (string)$newRoom['_id'],
                'name' => $newRoom['name'],
                'price' => $newRoom['price']
            ]
        ]);
    }

    public static function updateRoom($id) {
        AuthMiddleware::checkAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        $room = new Room();

        if (!$room->findById($id)) {
            http_response_code(404);
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        $updated = $room->update($id, $data);
        echo json_encode(['message' => 'Room updated', 'room' => $updated]);
    }

    public static function deleteRoom($id) {
        AuthMiddleware::checkAdmin();

        $room = new Room();
        if ($room->delete($id)) {
            echo json_encode(['message' => 'Room deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Room not found']);
        }
    }
}
?>
