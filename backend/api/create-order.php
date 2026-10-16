<?php
/**
 * CaféNest API – POST /backend/api/create-order.php
 *
 * Creates an order from the current session cart.
 * Session-only — no database.
 *
 * Expected JSON body:
 * {
 *   "name":            "Tejaswini Sonone",
 *   "phone":           "+91 98765 43210",
 *   "email":           "tejaswini@gmail.com",   // optional
 *   "special_requests":"",                       // optional
 *   "payment_method":  "cash",                  // "cash" | "upi_demo"
 *   "coupon_code":     "WELCOME10"              // optional
 * }
 *
 * Response includes full receipt + estimated prep time.
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/order-service.php';
require_once __DIR__ . '/../includes/payment-service.php';
require_once __DIR__ . '/../includes/notification-service.php';

setCorsHeaders();
startSecureSession();
requireMethod('POST');

$body = getJsonBody();

// ── Validate input ─────────────────────────────────────────────────────
$name            = requireString($body['name']    ?? '', 'name', 80);
$phone           = requirePhone($body['phone']    ?? '');
$email           = optionalEmail($body['email']   ?? '') ?? '';
$specialRequests = sanitiseString($body['special_requests'] ?? '', 300) ?? '';
$paymentMethod   = sanitiseString($body['payment_method'] ?? 'cash', 20);
$couponCode      = sanitiseString($body['coupon_code'] ?? '', 30) ?? '';

if (!in_array($paymentMethod, PAYMENT_METHODS, true)) {
    sendError("'payment_method' must be 'cash' or 'upi_demo'.", 422);
}

// ── Create order ───────────────────────────────────────────────────────
$order = createOrder(
    [
        'name'             => $name,
        'phone'            => $phone,
        'email'            => $email,
        'special_requests' => $specialRequests,
    ],
    $paymentMethod,
    $couponCode
);

// ── Process demo payment immediately ─────────────────────────────────
processPayment($order['order_id'], $paymentMethod);

// Re-fetch order from shared store after payment update
$order = getOrderById($order['order_id']);

sendSuccess('Order placed successfully.', buildReceipt($order), 201);
