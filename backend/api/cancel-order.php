<?php
/**
 * CaféNest API – POST /backend/api/cancel-order.php
 *
 * Allows customers to cancel their own Pending or Confirmed orders.
 * Admins can cancel any non-terminal order.
 * Session-only — no database.
 *
 * Body: { "order_id": "CAF-20261015-ABCDE" }
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/auth-helper.php';
require_once __DIR__ . '/../includes/order-service.php';
require_once __DIR__ . '/../includes/notification-service.php';

setCorsHeaders();
startSecureSession();
requireMethod('POST');

$body    = getJsonBody();
$orderId = requireString($body['order_id'] ?? '', 'order_id', 40);

$order   = getOrder($orderId);
if (!$order) sendError('Order not found.', 404);

$isAdmin = !empty($_SESSION['admin_logged_in']);

if (!$isAdmin) {
    // Customer: must own the order AND status must be Pending or Confirmed
    $user = requireCustomer();
    if ($order['customer_email'] !== $user['email']) {
        sendError('You are not authorised to cancel this order.', 403);
    }
    $cancellableStatuses = ['Pending', 'Confirmed'];
    if (!in_array($order['status'], $cancellableStatuses, true)) {
        sendError(
            "Your order cannot be cancelled because it is already '{$order['status']}'. "
            . "Only Pending or Confirmed orders can be cancelled by customers.",
            400
        );
    }
}

// Perform cancellation
$updated = updateOrderStatus($orderId, 'Cancelled', $isAdmin);
if (!$updated) sendError('Failed to cancel order.', 500);

sendSuccess('Order cancelled successfully.', buildOrderSummary($updated));
