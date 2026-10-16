<?php
/**
 * CaféNest Backend – Coupon Service
 * Session-only. No database code.
 *
 * ⚠️  Demo coupons only. These are configured in the COUPONS array below.
 *     In a production system coupon records would be stored in a database.
 */

require_once __DIR__ . '/response.php';

/**
 * Coupon definitions.
 *
 * type:       'percent' | 'fixed'
 * value:      discount amount (% or flat INR)
 * min_order:  minimum cart subtotal required
 * max_discount: cap on discount amount (only for percent type; 0 = no cap)
 * description: human-readable label
 */
const COUPONS = [
    'WELCOME10' => [
        'code'         => 'WELCOME10',
        'type'         => 'percent',
        'value'        => 10,
        'min_order'    => 150,
        'max_discount' => 50,
        'description'  => '10% off (up to ₹50) on orders above ₹150',
    ],
    'CAFE20' => [
        'code'         => 'CAFE20',
        'type'         => 'percent',
        'value'        => 20,
        'min_order'    => 300,
        'max_discount' => 100,
        'description'  => '20% off (up to ₹100) on orders above ₹300',
    ],
    'FLAT50' => [
        'code'         => 'FLAT50',
        'type'         => 'fixed',
        'value'        => 50,
        'min_order'    => 200,
        'max_discount' => 50,
        'description'  => '₹50 flat off on orders above ₹200',
    ],
    'BREWLOVE' => [
        'code'         => 'BREWLOVE',
        'type'         => 'percent',
        'value'        => 15,
        'min_order'    => 250,
        'max_discount' => 75,
        'description'  => '15% off (up to ₹75) on orders above ₹250',
    ],
];

/**
 * Validate a coupon code against a given subtotal.
 * Returns an array with keys: valid, coupon, discount, message.
 *
 * @param string $code      Coupon code submitted by the user.
 * @param int    $subtotal  Cart subtotal in INR (calculated server-side).
 */
function validateCoupon(string $code, int $subtotal): array
{
    $code   = strtoupper(trim($code));
    $coupon = COUPONS[$code] ?? null;

    if ($coupon === null) {
        return ['valid' => false, 'coupon' => null, 'discount' => 0,
                'message' => "Coupon code '{$code}' is not valid."];
    }

    if ($subtotal < $coupon['min_order']) {
        return ['valid' => false, 'coupon' => $coupon, 'discount' => 0,
                'message' => "This coupon requires a minimum order of ₹{$coupon['min_order']}."];
    }

    // Calculate discount
    if ($coupon['type'] === 'percent') {
        $discount = (int) round($subtotal * $coupon['value'] / 100);
        if ($coupon['max_discount'] > 0) {
            $discount = min($discount, $coupon['max_discount']);
        }
    } else {
        // fixed
        $discount = $coupon['value'];
    }

    // Ensure discount never exceeds subtotal (total cannot go negative)
    $discount = min($discount, $subtotal);

    return [
        'valid'    => true,
        'coupon'   => $coupon,
        'discount' => $discount,
        'message'  => "Coupon applied! You save ₹{$discount}.",
    ];
}

/**
 * Apply a validated coupon to a subtotal and return the pricing breakdown.
 *
 * @param string $code
 * @param int    $subtotal
 */
function applyCoupon(string $code, int $subtotal): array
{
    $result   = validateCoupon($code, $subtotal);
    $discount = $result['discount'];
    $total    = max(0, $subtotal - $discount);

    return [
        'coupon_code' => strtoupper(trim($code)),
        'valid'       => $result['valid'],
        'subtotal'    => $subtotal,
        'discount'    => $discount,
        'total'       => $total,
        'message'     => $result['message'],
        'coupon_info' => $result['coupon'],
    ];
}
