<?php
// Authentication middleware
class AuthMiddleware {
    public static function authenticate() {
        $token = self::getToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $payload = JWT::decode($token);
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }

        return $payload;
    }

    private static function getToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
                return $matches[1];
            }
        }
        return $_COOKIE['token'] ?? null;
    }

    public static function checkAdmin() {
        $user = self::authenticate();
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
        return $user;
    }
}
?>
