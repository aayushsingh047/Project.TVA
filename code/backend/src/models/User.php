<?php
// User model
class User {
    private $collection;

    public function __construct() {
        $db = Database::getInstance()->getDb();
        $this->collection = $db->users;
    }

    public function create($email, $password, $name) {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        $user = [
            'email' => $email,
            'password' => $hashedPassword,
            'name' => $name,
            'role' => 'user',
            'isVerified' => true,
            'createdAt' => new MongoDB\BSON\UTCDateTime(),
        ];

        $result = $this->collection->insertOne($user);
        return $result->getInsertedId();
    }

    public function findByEmail($email) {
        return $this->collection->findOne(['email' => $email]);
    }

    public function findById($id) {
        return $this->collection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
    }

    public function verifyPassword($storedHash, $password) {
        return password_verify($password, $storedHash);
    }
}
?>
