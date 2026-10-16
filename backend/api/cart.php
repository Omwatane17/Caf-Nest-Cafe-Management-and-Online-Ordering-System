<?php
/**
 * CaféNest API – /backend/api/cart.php
 *
 * Cart is stored in $_SESSION['cart'] as { item_id => qty }.
 * Prices are NEVER trusted from the frontend; always read from menu-data.php.
 * Session-only — no database.
 *
 * GET                          → view cart
 * POST ?action=add             { item_id, qty }
 * POST ?action=update          { item_id, qty }  (qty=0 removes item)
 * POST ?action=remove          { item_id }
 * POST ?action=clear
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/menu-data.php';

setCorsHeaders();
startSecureSession();

const CART_MAX_QTY_PER_ITEM = 20;

/**
 * Build and return a full cart view with server-calculated totals.
 */
function cartView(): array
{
    $cart     = $_SESSION['cart'] ?? [];
    $lines    = [];
    $subtotal = 0;

    foreach ($cart as $itemId => $qty) {
        $item = getMenuItem($itemId);
        if (!$item) continue; // skip unavailable items silently
        $lineTotal = $item['price'] * $qty;
        $lines[]   = [
            'item_id'   => $itemId,
            'name'      => $item['name'],
            'price'     => $item['price'],
            'qty'       => $qty,
            'subtotal'  => $lineTotal,
            'image'     => $item['image'],
            'available' => $item['available'],
        ];
        $subtotal += $lineTotal;
    }

    return [
        'items'      => $lines,
        'item_count' => count($lines),
        'total_qty'  => array_sum(array_column($lines, 'qty')),
        'subtotal'   => $subtotal,
    ];
}

/* ── GET: view cart ──────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    sendSuccess('Cart retrieved.', cartView());
}

requireMethod('POST');
$action = sanitiseString($_GET['action'] ?? 'add') ?? 'add';
$body   = getJsonBody();

/* ── add ─────────────────────────────────────────────────────────────── */
if ($action === 'add') {
    $itemId = requireString($body['item_id'] ?? '', 'item_id', 64);
    $qty    = requirePositiveInt($body['qty'] ?? 1, 'qty');

    $item = getMenuItem($itemId);
    if (!$item) sendError("Menu item '{$itemId}' not found or unavailable.", 404);

    $currentQty = $_SESSION['cart'][$itemId] ?? 0;
    $newQty     = $currentQty + $qty;

    if ($newQty > CART_MAX_QTY_PER_ITEM) {
        sendError("Maximum quantity per item is " . CART_MAX_QTY_PER_ITEM . ".", 422);
    }

    $_SESSION['cart'][$itemId] = $newQty;

    sendSuccess("{$item['name']} added to cart.", cartView());
}

/* ── update ──────────────────────────────────────────────────────────── */
if ($action === 'update') {
    $itemId = requireString($body['item_id'] ?? '', 'item_id', 64);
    $qty    = isset($body['qty']) && is_numeric($body['qty']) ? (int)$body['qty'] : -1;

    if ($qty < 0) sendError("'qty' must be 0 or greater.", 422);
    if ($qty > CART_MAX_QTY_PER_ITEM) sendError("Maximum quantity per item is " . CART_MAX_QTY_PER_ITEM . ".", 422);

    if (!isset($_SESSION['cart'][$itemId])) {
        sendError("Item '{$itemId}' is not in the cart.", 404);
    }

    if ($qty === 0) {
        unset($_SESSION['cart'][$itemId]);
        sendSuccess('Item removed from cart.', cartView());
    }

    $item = getMenuItem($itemId);
    if (!$item) sendError("Menu item '{$itemId}' not found or unavailable.", 404);

    $_SESSION['cart'][$itemId] = $qty;
    sendSuccess('Cart updated.', cartView());
}

/* ── remove ──────────────────────────────────────────────────────────── */
if ($action === 'remove') {
    $itemId = requireString($body['item_id'] ?? '', 'item_id', 64);
    unset($_SESSION['cart'][$itemId]);
    sendSuccess('Item removed from cart.', cartView());
}

/* ── clear ───────────────────────────────────────────────────────────── */
if ($action === 'clear') {
    $_SESSION['cart'] = [];
    sendSuccess('Cart cleared.', cartView());
}

sendError("Unknown cart action '{$action}'.", 400);
