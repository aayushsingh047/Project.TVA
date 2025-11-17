<?php
// Room model
class Room {
    private $collection;

    public function __construct() {
        $db = Database::getInstance()->getDb();
        $this->collection = $db->rooms;
    }

    public function create($data) {
        $room = [
            'name' => $data['name'],
            'description' => $data['description'],
            'price' => (float)$data['price'],
            'capacity' => (int)$data['capacity'],
            'amenities' => $data['amenities'] ?? [],
            'image' => $data['image'] ?? '/placeholder.jpg',
            'available' => true,
            'createdAt' => new MongoDB\BSON\UTCDateTime(),
        ];

        $result = $this->collection->insertOne($room);
        return $room;
    }

    public function findAll($page = 1, $limit = 10) {
        $skip = ($page - 1) * $limit;
        $rooms = $this->collection->find(
            [],
            ['skip' => $skip, 'limit' => $limit, 'sort' => ['createdAt' => -1]]
        );
        return iterator_to_array($rooms);
    }

    public function findById($id) {
        return $this->collection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
    }

    public function update($id, $data) {
        $this->collection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($id)],
            ['$set' => $data]
        );
        return $this->findById($id);
    }

    public function delete($id) {
        $result = $this->collection->deleteOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
        return $result->getDeletedCount() > 0;
    }

    public function count() {
        return $this->collection->countDocuments();
    }
}
?>
