<?php
/**
 * CaféNest API – POST /backend/api/apply-coupon.php
 *
 * Validates and applies a coupon code to a cart subtotal.
 * Returns the pricing breakdown (subtotal, discount, total).
 * Final totals are ALWAYS calculated server-side.
 * Session-only — no database.
 *
 * Body: { "coupon_code": "WELCOME10", "subtotal": 350 }
 * The submitted subtotal is used ONLY to validate the coupon minimum —
 * the actual cart subtotal is recalculated from session data internally.
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/coupon-service.php';
require_once __DIR__ . '/../includes/menu-data.php';

setCorsHeaders();
startSecureSession();
requireMethod('POST');

$body       = getJsonBody();
$couponCode = requireString($body['coupon_code'] ?? '', 'coupon_code', 30);

// Recalculate subtotal from session cart (never trust submitted subtotal)
$cart     = $_SESSION['cart'] ?? [];
$subtotal = 0;
foreach ($cart as $itemId => $qty) {
    $item = getMenuItem($itemId);
    if ($item) $subtotal += $item['price'] * $qty;
}

if ($subtotal === 0) {
    sendError('Cart is empty. Add items before applying a coupon.', 400);
}

$result = applyCoupon($couponCode, $subtotal);

if (!$result['valid']) {
    sendError($result['message'], 400);
}

// Store applied coupon in session so create-order can reference it
$_SESSION['applied_coupon'] = $couponCode;

sendSuccess($result['message'], [
    'coupon_code' => $result['coupon_code'],
    'subtotal'    => $result['subtotal'],
    'discount'    => $result['discount'],
    'total'       => $result['total'],
    'coupon_info' => $result['coupon_info'],
]);
