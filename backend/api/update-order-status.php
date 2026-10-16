<?php
/**
 * CaféNest API – POST /backend/api/update-order-status.php
 *
 * Admin-only. Updates the status of any non-terminal order.
 * Validates allowed transitions from the status machine in order-service.php.
 * Session-only — no database.
 *
 * Body: { "order_id": "CAF-20261015-ABCDE", "status": "Preparing" }
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
requireAdmin();

$body      = getJsonBody();
$orderId   = requireString($body['order_id'] ?? '', 'order_id', 40);
$newStatus = requireString($body['status']   ?? '', 'status',   20);

if (!in_array($newStatus, ORDER_STATUSES, true)) {
    sendError(
        "Invalid status '{$newStatus}'. Allowed values: " . implode(', ', ORDER_STATUSES) . '.',
        422
    );
}

$order = getOrder($orderId);
if (!$order) sendError('Order not found.', 404);

$updated = updateOrderStatus($orderId, $newStatus, true); // isAdmin = true
if (!$updated) sendError('Status update failed.', 500);

sendSuccess("Order status updated to '{$newStatus}'.", buildOrderSummary($updated));
