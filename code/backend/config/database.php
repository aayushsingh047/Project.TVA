<?php
// MongoDB configuration
class Database {
    private static $instance;
    private $connection;

    private function __construct() {
        $mongoUri = getenv('MONGODB_URI');
        if (!$mongoUri) {
            die('Error: MONGODB_URI not set');
        }

        try {
            $this->connection = new MongoDB\Client($mongoUri);
            // Test connection
            $this->connection->listDatabases();
        } catch (Exception $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getDb() {
        return $this->connection->hotel_booking;
    }

    public function getConnection() {
        return $this->connection;
    }
}
?>
