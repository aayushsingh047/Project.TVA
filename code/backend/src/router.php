<?php
// Router
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../src/middleware/auth.php';
require_once __DIR__ . '/../src/models/User.php';
require_once __DIR__ . '/../src/models/Room.php';
require_once __DIR__ . '/../src/models/Order.php';
require_once __DIR__ . '/../src/controllers/AuthController.php';
require_once __DIR__ . '/../src/controllers/RoomController.php';
require_once __DIR__ . '/../src/controllers/BookingController.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);

// Auth routes
if ($path === '/auth/register' && $method === 'POST') {
    AuthController::register();
} elseif ($path === '/auth/login' && $method === 'POST') {
    AuthController::login();
} elseif ($path === '/auth/logout' && $method === 'POST') {
    AuthController::logout();
} elseif ($path === '/auth/me' && $method === 'GET') {
    AuthController::me();
}
// Room routes
elseif ($path === '/rooms' && $method === 'GET') {
    RoomController::listRooms();
} elseif (preg_match('#^/rooms/([a-f0-9]+)$#', $path, $matches) && $method === 'GET') {
    RoomController::getRoom($matches[1]);
} elseif ($path === '/rooms' && $method === 'POST') {
    RoomController::createRoom();
} elseif (preg_match('#^/rooms/([a-f0-9]+)$#', $path, $matches) && $method === 'PUT') {
    RoomController::updateRoom($matches[1]);
} elseif (preg_match('#^/rooms/([a-f0-9]+)$#', $path, $matches) && $method === 'DELETE') {
    RoomController::deleteRoom($matches[1]);
}
// Booking routes
elseif ($path === '/checkout' && $method === 'POST') {
    BookingController::checkout();
} elseif ($path === '/orders' && $method === 'GET') {
    BookingController::getOrders();
} elseif ($path === '/webhooks/stripe' && $method === 'POST') {
    BookingController::handleWebhook();
}
else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>
