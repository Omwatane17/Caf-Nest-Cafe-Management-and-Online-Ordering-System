<?php
/**
 * CaféNest Backend – Notification / Receipt Service
 * Session-only. No email/SMS sent. Returns JSON receipts only.
 */

require_once __DIR__ . '/menu-data.php';

/**
 * Build a full order receipt / confirmation payload.
 * This is returned as the "data" in order confirmation responses.
 *
 * @param array $order  Order array from $_SESSION['orders'].
 * @return array        Receipt array ready for JSON output.
 */
function buildReceipt(array $order): array
{
    return [
        'order_id'        => $order['order_id'],
        'status'          => $order['status'],
        'customer'        => [
            'name'  => $order['customer']['name'] ?? '',
            'phone' => $order['customer']['phone'] ?? '',
            'email' => $order['customer']['email'] ?? '',
            'special_requests' => $order['customer']['special_requests'] ?? '',
        ],
        'items'           => $order['items'],
        'subtotal'        => $order['subtotal'],
        'coupon_code'     => $order['coupon_code'],
        'discount'        => $order['discount'],
        'total'           => $order['total'],
        'payment_method'  => $order['payment_method'],
        'payment_status'  => $order['payment_status'],
        'payment_note'    => $order['payment_note'],
        'prep_time_mins'  => $order['prep_time_mins'],
        'prep_time_label' => "~{$order['prep_time_mins']} minutes (estimate only)",
        'created_at'      => $order['created_at'],
        'updated_at'      => $order['updated_at'],
        'review'          => $order['review'],
        'disclaimer'      => 'This is a DEMO receipt for the CaféNest College DBMS Lab project. '
                           . 'Orders are stored in temporary session memory and will not persist after the session expires.',
    ];
}

/**
 * Build a summary notification array (lightweight, for list views).
 *
 * @param array $order
 * @return array
 */
function buildOrderSummary(array $order): array
{
    return [
        'order_id'       => $order['order_id'],
        'status'         => $order['status'],
        'total'          => $order['total'],
        'item_count'     => array_sum(array_column($order['items'], 'qty')),
        'payment_method' => $order['payment_method'],
        'payment_status' => $order['payment_status'],
        'prep_time_mins' => $order['prep_time_mins'],
        'created_at'     => $order['created_at'],
    ];
}
