<?php
/**
 * CaféNest Backend – Payment Service (Demo)
 * Uses shared JSON store (store.php). No database. No real payment gateway.
 *
 * ⚠️  SIMULATION NOTICE
 *     - UPI Demo does NOT initiate any real UPI transaction.
 *     - Cash mode records that payment will be collected at the venue.
 *     - No real money changes hands.
 */

require_once __DIR__ . '/response.php';
require_once __DIR__ . '/store.php';

/** Supported payment methods. */
const PAYMENT_METHODS = ['cash', 'upi_demo'];

/**
 * Process a demo payment for an order.
 * Updates order in shared JSON store.
 *
 * @param string $orderId
 * @param string $method   'cash' | 'upi_demo'
 * @param bool   $forceSuccess  Admin override to force success (for testing).
 * @return array  Payment result.
 */
function processPayment(string $orderId, string $method, bool $forceSuccess = false): array
{
    $order = getOrderById($orderId);
    if (!$order) sendError('Order not found for payment.', 404);

    if (!in_array($method, PAYMENT_METHODS, true)) {
        sendError("Payment method must be 'cash' or 'upi_demo'.", 422);
    }

    if ($order['status'] === 'Cancelled') {
        sendError('Cannot process payment for a cancelled order.', 400);
    }

    $updates = [
        'payment_method' => $method,
        'updated_at'     => date('d M Y, h:i A'),
    ];

    $paymentResult = [
        'method'       => $method,
        'processed_at' => date('d M Y, h:i A'),
        'note'         => '',
        'status'       => '',
        'demo'         => true,
    ];

    if ($method === 'cash') {
        $paymentResult['status'] = 'Pending';
        $paymentResult['note']   = 'Cash payment to be collected at the venue. This is a demo — no real payment occurs.';
        $updates['payment_status'] = 'Pending';
        $updates['payment_note']   = $paymentResult['note'];
    } else {
        // upi_demo: 80% success simulation seeded by order ID for reproducibility
        $seed    = crc32($orderId) % 10;
        $success = $forceSuccess || ($seed < 8);

        if ($success) {
            $paymentResult['status'] = 'Successful (Demo)';
            $paymentResult['note']   = 'SIMULATED UPI payment — No real transaction occurred.';
            $updates['status']         = 'Confirmed'; // auto-confirm on UPI success
            $updates['payment_status'] = 'Successful (Demo)';
            $updates['payment_note']   = $paymentResult['note'];
        } else {
            $paymentResult['status'] = 'Failed (Demo)';
            $paymentResult['note']   = 'SIMULATED UPI payment failed (demo). Retry or choose Cash.';
            $updates['payment_status'] = 'Failed (Demo)';
            $updates['payment_note']   = $paymentResult['note'];
        }
    }

    // Persist to shared store
    updateOrderInStore($orderId, $updates);

    return $paymentResult;
}
