<?php
// Booking and Stripe controller
class BookingController {
    public static function checkout() {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data['roomId'] || !$data['checkIn'] || !$data['checkOut'] || !$data['guests']) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $room = new Room();
        $roomDoc = $room->findById($data['roomId']);

        if (!$roomDoc) {
            http_response_code(404);
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        // Calculate nights
        $checkIn = new DateTime($data['checkIn']);
        $checkOut = new DateTime($data['checkOut']);
        $nights = $checkOut->diff($checkIn)->days;
        $totalPrice = $roomDoc['price'] * $nights;

        // Create order
        $order = new Order();
        $orderDoc = $order->create(
            $user['userId'],
            $data['roomId'],
            $data['checkIn'],
            $data['checkOut'],
            $data['guests'],
            $totalPrice
        );

        // Create Stripe PaymentIntent
        require_once __DIR__ . '/../services/stripe.php';
        $stripe = new StripeService();
        $paymentIntent = $stripe->createPaymentIntent(
            (int)($totalPrice * 100),
            (string)$orderDoc['_id'],
            $user['email']
        );

        // Update order with Stripe ID
        $order->update((string)$orderDoc['_id'], [
            'stripePaymentId' => $paymentIntent['id']
        ]);

        echo json_encode([
            'orderId' => (string)$orderDoc['_id'],
            'clientSecret' => $paymentIntent['client_secret'],
            'totalPrice' => $totalPrice,
            'nights' => $nights
        ]);
    }

    public static function getOrders() {
        $user = AuthMiddleware::authenticate();
        $page = $_GET['page'] ?? 1;

        $order = new Order();
        $orders = $order->findByUserId($user['userId'], $page);

        $ordersArray = array_map(function($o) {
            return [
                'id' => (string)$o['_id'],
                'roomId' => (string)$o['roomId'],
                'checkIn' => $o['checkIn']->toDateTime()->format('Y-m-d'),
                'checkOut' => $o['checkOut']->toDateTime()->format('Y-m-d'),
                'guests' => $o['guests'],
                'totalPrice' => $o['totalPrice'],
                'status' => $o['status']
            ];
        }, $orders);

        echo json_encode(['orders' => $ordersArray]);
    }

    public static function handleWebhook() {
        $payload = file_get_contents('php://input');
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

        require_once __DIR__ . '/../services/stripe.php';
        $stripe = new StripeService();

        $event = $stripe->verifyWebhook($payload, $sig_header);

        if ($event && $event['type'] === 'payment_intent.succeeded') {
            $paymentIntent = $event['data']['object'];
            $order = new Order();
            $orderDoc = $order->findByStripePaymentId($paymentIntent['id']);

            if ($orderDoc) {
                $order->update((string)$orderDoc['_id'], ['status' => 'paid']);
                http_response_code(200);
                echo json_encode(['success' => true]);
            }
        }

        http_response_code(200);
        echo json_encode(['received' => true]);
    }
}
?>
