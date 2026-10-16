<?php
/**
 * CaféNest API – GET /backend/api/get-order.php
 *
 * Returns order details. Customers see only their own orders.
 * Admins can see all orders.
 *
 * Query parameters:
 *   ?order_id=CAF-20261015-ABCDE   → single order
 *   (no params, admin only)         → all orders
 *   ?my=1  (customer)               → all orders by logged-in customer
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/auth-helper.php';
require_once __DIR__ . '/../includes/store.php';
require_once __DIR__ . '/../includes/order-service.php';
require_once __DIR__ . '/../includes/notification-service.php';

setCorsHeaders();
startSecureSession();
requireMethod('GET');

$orderId = sanitiseString($_GET['order_id'] ?? '') ?? '';

// ── Single order ───────────────────────────────────────────────────────
if ($orderId !== '') {
    $order = getOrder($orderId);
    if (!$order) sendError('Order not found.', 404);

    // Ownership: customer must own it, or admin must be logged in
    $isAdmin = !empty($_SESSION['admin_logged_in']);
    if (!$isAdmin) {
        $user = getCurrentUser();
        if (!$user) sendError('Login required to view order details.', 401);
        if ($order['customer_email'] !== $user['email']) {
            sendError('You are not authorised to view this order.', 403);
        }
    }

    sendSuccess('Order retrieved.', buildReceipt($order));
}

// ── All orders (admin) ─────────────────────────────────────────────────
if (!empty($_SESSION['admin_logged_in'])) {
    $all = getAllOrders();
    $summaries = array_map('buildOrderSummary', $all);
    sendSuccess('All orders retrieved.', ['orders' => $summaries, 'count' => count($summaries)]);
}

// ── My orders (customer) ──────────────────────────────────────────────
if (isset($_GET['my'])) {
    $user = requireCustomer();
    $mine = getOrdersByEmail($user['email']);
    $summaries = array_map('buildOrderSummary', $mine);
    sendSuccess('Your orders retrieved.', ['orders' => $summaries, 'count' => count($summaries)]);
}

sendError('Provide ?order_id= or ?my=1, or log in as admin.', 400);
