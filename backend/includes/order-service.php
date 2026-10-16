<?php
/**
 * CaféNest Backend – Order Service
 * Uses shared JSON flat-file store (store.php) so admin can see all customer orders.
 * No database code.
 */

require_once __DIR__ . '/menu-data.php';
require_once __DIR__ . '/coupon-service.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/store.php';

/**
 * Valid order statuses and their allowed next states.
 */
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

const STATUS_TRANSITIONS = [
    'Pending'   => ['Confirmed', 'Cancelled'],
    'Confirmed' => ['Preparing', 'Cancelled'],
    'Preparing' => ['Ready'],
    'Ready'     => ['Completed'],
    'Completed' => [],
    'Cancelled' => [],
];

function isValidTransition(string $from, string $to, bool $isAdmin = false): bool
{
    if ($isAdmin) {
        if (in_array($from, ['Completed', 'Cancelled'], true)) return false;
        return in_array($to, ORDER_STATUSES, true);
    }
    return in_array($to, STATUS_TRANSITIONS[$from] ?? [], true);
}

/**
 * Build itemised cart lines from the session cart.
 * Prices always come from MENU_ITEMS — never trusted from frontend.
 */
function buildCartLines(): array
{
    $cart     = $_SESSION['cart'] ?? [];
    $lines    = [];
    $subtotal = 0;

    foreach ($cart as $itemId => $qty) {
        $item = getMenuItem($itemId);
        if (!$item) continue;
        $lineTotal = $item['price'] * $qty;
        $lines[]   = [
            'item_id'   => $item['id'],
            'name'      => $item['name'],
            'price'     => $item['price'],
            'qty'       => $qty,
            'subtotal'  => $lineTotal,
            'prep_time' => $item['prep_time'],
        ];
        $subtotal += $lineTotal;
    }

    return [$lines, $subtotal];
}

/**
 * Generate a unique order reference: CAF-YYYYMMDD-XXXXX
 */
function generateOrderRef(): string
{
    do {
        $rand = strtoupper(substr(bin2hex(random_bytes(4)), 0, 5));
        $ref  = 'CAF-' . date('Ymd') . '-' . $rand;
    } while (getOrderById($ref) !== null);
    return $ref;
}

/**
 * Create an order from the current session cart.
 * Saved to shared JSON store — visible to all sessions including admin.
 */
function createOrder(array $customer, string $paymentMethod, string $couponCode = ''): array
{
    [$lines, $subtotal] = buildCartLines();
    if (empty($lines)) sendError('Cart is empty. Add items before placing an order.', 400);

    $discount = 0; $couponInfo = null;
    if ($couponCode !== '') {
        $r = validateCoupon($couponCode, $subtotal);
        if ($r['valid']) { $discount = $r['discount']; $couponInfo = $r['coupon']; }
    }

    $total   = max(0, $subtotal - $discount);
    $orderId = generateOrderRef();

    $order = [
        'order_id'       => $orderId,
        'status'         => 'Pending',
        'customer'       => $customer,
        'customer_email' => $customer['email'] ?? '',
        'items'          => $lines,
        'subtotal'       => $subtotal,
        'coupon_code'    => $couponCode !== '' ? strtoupper($couponCode) : null,
        'coupon_info'    => $couponInfo,
        'discount'       => $discount,
        'total'          => $total,
        'payment_method' => $paymentMethod,
        'payment_status' => 'Pending',
        'payment_note'   => '',
        'prep_time_mins' => calcPrepTime($lines),
        'created_at'     => date('d M Y, h:i A'),
        'updated_at'     => date('d M Y, h:i A'),
        'review'         => null,
    ];

    saveOrder($order);           // → shared JSON store
    $_SESSION['cart'] = [];      // clear cart
    return $order;
}

/**
 * Single order lookup (shared store).
 */
function getOrder(string $orderId): ?array
{
    return getOrderById($orderId);
}

/* getAllOrders() and getOrdersByEmail() are provided by store.php */

/**
 * Update order status and persist to shared store.
 */
function updateOrderStatus(string $orderId, string $newStatus, bool $isAdmin = false): ?array
{
    $order = getOrderById($orderId);
    if (!$order) return null;

    if (!isValidTransition($order['status'], $newStatus, $isAdmin)) {
        sendError("Cannot change order from '{$order['status']}' to '{$newStatus}'.", 422);
    }

    return updateOrderInStore($orderId, [
        'status'     => $newStatus,
        'updated_at' => date('d M Y, h:i A'),
    ]);
}
