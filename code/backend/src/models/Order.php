<?php
// Order model
class Order {
    private $collection;

    public function __construct() {
        $db = Database::getInstance()->getDb();
        $this->collection = $db->orders;
    }

    public function create($userId, $roomId, $checkIn, $checkOut, $guests, $totalPrice) {
        $order = [
            'userId' => new MongoDB\BSON\ObjectId($userId),
            'roomId' => new MongoDB\BSON\ObjectId($roomId),
            'checkIn' => new DateTime($checkIn),
            'checkOut' => new DateTime($checkOut),
            'guests' => (int)$guests,
            'totalPrice' => (float)$totalPrice,
            'status' => 'pending',
            'stripePaymentId' => null,
            'createdAt' => new MongoDB\BSON\UTCDateTime(),
        ];

        $result = $this->collection->insertOne($order);
        return array_merge($order, ['_id' => $result->getInsertedId()]);
    }

    public function findById($id) {
        return $this->collection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
    }

    public function findByUserId($userId, $page = 1, $limit = 10) {
        $skip = ($page - 1) * $limit;
        $orders = $this->collection->find(
            ['userId' => new MongoDB\BSON\ObjectId($userId)],
            ['skip' => $skip, 'limit' => $limit, 'sort' => ['createdAt' => -1]]
        );
        return iterator_to_array($orders);
    }

    public function update($id, $data) {
        $this->collection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($id)],
            ['$set' => $data]
        );
        return $this->findById($id);
    }

    public function findByStripePaymentId($paymentId) {
        return $this->collection->findOne(['stripePaymentId' => $paymentId]);
    }
}
?>
