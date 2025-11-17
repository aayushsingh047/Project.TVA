<?php
// Stripe service
class StripeService {
    private $secretKey;
    private $webhookSecret;

    public function __construct() {
        $this->secretKey = getenv('STRIPE_SECRET_KEY');
        $this->webhookSecret = getenv('STRIPE_WEBHOOK_SECRET');

        if (!$this->secretKey || !$this->webhookSecret) {
            die('Error: Stripe keys not set');
        }
    }

    public function createPaymentIntent($amount, $orderId, $email) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://api.stripe.com/v1/payment_intents',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_USERPWD => $this->secretKey . ':',
            CURLOPT_POSTFIELDS => http_build_query([
                'amount' => $amount,
                'currency' => 'usd',
                'metadata' => ['orderId' => $orderId],
                'receipt_email' => $email,
            ]),
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    public function verifyWebhook($payload, $sigHeader) {
        $timestamp = 0;
        $signature = '';

        if (preg_match('/t=(\d+),v1=(.+)/', $sigHeader, $matches)) {
            $timestamp = $matches[1];
            $signature = $matches[2];
        }

        $computedSignature = hash_hmac('sha256', "$timestamp.$payload", $this->webhookSecret);

        if (hash_equals($signature, $computedSignature)) {
            return json_decode($payload, true);
        }

        return null;
    }
}
?>
