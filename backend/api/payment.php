<?php
/**
 * CaféNest API – POST /backend/api/payment.php
 *
 * Process or re-process a demo payment for an existing order.
 * Session-only — no database. No real payment gateway.
 *
 * ⚠️  SIMULATION NOTICE
 *     UPI Demo does NOT initiate any real UPI transaction.
 *     Cash records that payment will be collected at the venue.
 *     No PINs, OTPs, card numbers, or banking credentials are accepted.
 *
 * Body: { "order_id": "CAF-20261015-ABCDE", "payment_method": "upi_demo" }
 *
 * Admin can also GET /backend/api/payment.php?order_id= to view payment status.
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/auth-helper.php';
require_once __DIR__ . '/../includes/payment-service.php';
require_once __DIR__ . '/../includes/notification-service.php';

setCorsHeaders();
startSecureSession();
requireMethod('GET', 'POST');

/* ── GET: view payment status ─────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAdmin();
    $orderId = sanitiseString($_GET['order_id'] ?? '') ?? '';
    if (!$orderId) sendError("'order_id' query parameter is required.", 400);

    $order = $_SESSION['orders'][$orderId] ?? null;
    if (!$order) sendError('Order not found.', 404);

    sendSuccess('Payment status retrieved.', [
        'order_id'       => $orderId,
        'payment_method' => $order['payment_method'],
        'payment_status' => $order['payment_status'],
        'payment_note'   => $order['payment_note'],
    ]);
}

/* ── POST: process payment ────────────────────────────────────────── */
$body          = getJsonBody();
$orderId       = requireString($body['order_id'] ?? '', 'order_id', 40);
$paymentMethod = sanitiseString($body['payment_method'] ?? 'cash', 20);

if (!in_array($paymentMethod, PAYMENT_METHODS, true)) {
    sendError("'payment_method' must be 'cash' or 'upi_demo'.", 422);
}

// Reject attempts to submit false payment results from the frontend
if (isset($body['payment_status']) || isset($body['status'])) {
    sendError('Payment status cannot be submitted by the client.', 403);
}

// Ownership check: customer must own the order, or admin
$order = $_SESSION['orders'][$orderId] ?? null;
if (!$order) sendError('Order not found.', 404);

$isAdmin = !empty($_SESSION['admin_logged_in']);
if (!$isAdmin) {
    $user = requireCustomer();
    if ($order['customer_email'] !== $user['email']) {
        sendError('You are not authorised to process payment for this order.', 403);
    }
}

$result = processPayment($orderId, $paymentMethod);

sendSuccess('Payment processed.', [
    'order_id'      => $orderId,
    'payment_result'=> $result,
    'order_summary' => buildOrderSummary($_SESSION['orders'][$orderId]),
]);
