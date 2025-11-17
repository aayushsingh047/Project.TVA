<?php
// Authentication controller
class AuthController {
    public static function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data['email'] || !$data['password'] || !$data['name']) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $user = new User();
        if ($user->findByEmail($data['email'])) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            exit;
        }

        $userId = $user->create($data['email'], $data['password'], $data['name']);
        $userDoc = $user->findById((string)$userId);

        $token = JWT::encode([
            'userId' => (string)$userId,
            'email' => $data['email'],
            'role' => 'user'
        ]);

        setcookie('token', $token, time() + (7 * 24 * 60 * 60), '/', '', false, true);

        echo json_encode([
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => [
                'id' => (string)$userDoc['_id'],
                'email' => $userDoc['email'],
                'name' => $userDoc['name'],
                'role' => $userDoc['role']
            ]
        ]);
    }

    public static function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data['email'] || !$data['password']) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing email or password']);
            exit;
        }

        $user = new User();
        $userDoc = $user->findByEmail($data['email']);

        if (!$userDoc || !$user->verifyPassword($userDoc['password'], $data['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit;
        }

        $token = JWT::encode([
            'userId' => (string)$userDoc['_id'],
            'email' => $userDoc['email'],
            'role' => $userDoc['role']
        ]);

        setcookie('token', $token, time() + (7 * 24 * 60 * 60), '/', '', false, true);

        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => (string)$userDoc['_id'],
                'email' => $userDoc['email'],
                'name' => $userDoc['name'],
                'role' => $userDoc['role']
            ]
        ]);
    }

    public static function logout() {
        setcookie('token', '', time() - 3600, '/');
        echo json_encode(['message' => 'Logged out successfully']);
    }

    public static function me() {
        $user = AuthMiddleware::authenticate();
        echo json_encode($user);
    }
}
?>
