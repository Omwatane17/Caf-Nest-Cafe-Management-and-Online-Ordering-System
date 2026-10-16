<?php
/**
 * CaféNest API – GET /backend/api/admin-stats.php
 *
 * Admin-only dashboard statistics computed from session orders.
 * Session-only — no database.
 *
 * ⚠️  Statistics cover only the orders present in the current session.
 *     Data is not permanently stored and will reset when the session expires.
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/auth-helper.php';
require_once __DIR__ . '/../includes/order-service.php';
require_once __DIR__ . '/../includes/menu-data.php';
require_once __DIR__ . '/../includes/store.php';

setCorsHeaders();
startSecureSession();
requireMethod('GET');
requireAdmin();

$orders = getAllOrders();

/* ── Status counts ─────────────────────────────────────────────────── */
$statusCounts = array_fill_keys(ORDER_STATUSES, 0);
foreach ($orders as $order) {
    $statusCounts[$order['status']] = ($statusCounts[$order['status']] ?? 0) + 1;
}

/* ── Revenue (exclude Cancelled; Simulated UPI counts as earned) ─── */
$totalRevenue   = 0;
$completedTotal = 0;
$pendingRevenue = 0;

foreach ($orders as $order) {
    if ($order['status'] === 'Cancelled') continue;
    $totalRevenue += $order['total'];
    if ($order['status'] === 'Completed') {
        $completedTotal += $order['total'];
    } else {
        $pendingRevenue += $order['total'];
    }
}

/* ── Popular items ────────────────────────────────────────────────── */
$itemCounts = [];
foreach ($orders as $order) {
    if ($order['status'] === 'Cancelled') continue;
    foreach ($order['items'] as $line) {
        $id = $line['item_id'];
        $itemCounts[$id] = ($itemCounts[$id] ?? 0) + $line['qty'];
    }
}
arsort($itemCounts);
$topItems = [];
$rank = 1;
foreach (array_slice($itemCounts, 0, 5, true) as $itemId => $qty) {
    $item = MENU_ITEMS[$itemId] ?? null;
    $topItems[] = [
        'rank'    => $rank++,
        'item_id' => $itemId,
        'name'    => $item['name'] ?? $itemId,
        'qty_sold'=> $qty,
    ];
}

/* ── Payment method split ────────────────────────────────────────── */
$paymentSplit = ['cash' => 0, 'upi_demo' => 0];
foreach ($orders as $order) {
    if ($order['status'] === 'Cancelled') continue;
    $method = $order['payment_method'] ?? 'cash';
    $paymentSplit[$method] = ($paymentSplit[$method] ?? 0) + 1;
}

/* ── Reviews summary ─────────────────────────────────────────────── */
$reviews    = getAllReviews();
$avgRating  = 0;
if (count($reviews) > 0) {
    $avgRating = round(array_sum(array_column($reviews, 'rating')) / count($reviews), 1);
}

sendSuccess('Dashboard statistics retrieved.', [
    'total_orders'      => count($orders),
    'status_counts'     => $statusCounts,
    'total_revenue'     => $totalRevenue,
    'completed_revenue' => $completedTotal,
    'pending_revenue'   => $pendingRevenue,
    'top_items'         => $topItems,
    'payment_split'     => $paymentSplit,
    'total_reviews'     => count($reviews),
    'average_rating'    => $avgRating,
    'disclaimer'        => 'Statistics cover session-scoped orders only. Data resets when the session expires.',
]);
