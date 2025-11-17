<?php
// JWT utility class
class JWT {
    private static $secret = 'f82d1f0e2c9b49e4a7d9c1f38e6f4b7a91b3c28f7c4d92ea83f7b6d4c2a9e3f1';

    public static function encode($payload) {
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iat'] = time();
        $payload['exp'] = time() + (7 * 24 * 60 * 60); // 7 days
        $payload = base64_encode(json_encode($payload));

        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        return "$header.$payload.$signature";
    }

    public static function decode($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        $signature = base64_encode(hash_hmac('sha256', "{$parts[0]}.{$parts[1]}", self::$secret, true));
        if ($signature !== $parts[2]) return null;

        $payload = json_decode(base64_decode($parts[1]), true);
        if ($payload['exp'] < time()) return null;

        return $payload;
    }

    public static function verify($token) {
        return self::decode($token) !== null;
    }
}
?>
