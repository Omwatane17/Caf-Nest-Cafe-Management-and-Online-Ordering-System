<?php
/**
 * CaféNest – Shared Data Store
 *
 * Since PHP sessions are per-user, we use a lightweight JSON flat-file
 * to share orders and reviews across sessions (customer ↔ admin).
 *
 * ⚠️  Demo only — data is lost when temp files are cleared.
 *     No database is used. This intentionally replaces a database for
 *     the college DBMS Lab session-only demo.
 */

define('STORE_DIR', sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafenest_store');
define('ORDERS_FILE',  STORE_DIR . DIRECTORY_SEPARATOR . 'orders.json');
define('REVIEWS_FILE', STORE_DIR . DIRECTORY_SEPARATOR . 'reviews.json');

/**
 * Ensure store directory exists.
 */
function ensureStoreDir(): void
{
    if (!is_dir(STORE_DIR)) {
        mkdir(STORE_DIR, 0777, true);
    }
}

/**
 * Read JSON from a file; returns [] on missing/corrupt file.
 */
function readStore(string $file): array
{
    ensureStoreDir();
    if (!file_exists($file)) return [];
    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Write array to JSON file atomically.
 */
function writeStore(string $file, array $data): void
{
    ensureStoreDir();
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

/* ── Order store helpers ────────────────────────────────────────────── */

function getAllOrders(): array
{
    return array_values(readStore(ORDERS_FILE));
}

function getOrderById(string $orderId): ?array
{
    $orders = readStore(ORDERS_FILE);
    return $orders[$orderId] ?? null;
}

function getOrdersByEmail(string $email): array
{
    $all = readStore(ORDERS_FILE);
    return array_values(array_filter($all, fn($o) => ($o['customer_email'] ?? '') === $email));
}

function saveOrder(array $order): void
{
    $orders = readStore(ORDERS_FILE);
    $orders[$order['order_id']] = $order;
    writeStore(ORDERS_FILE, $orders);
}

function updateOrderInStore(string $orderId, array $updates): ?array
{
    $orders = readStore(ORDERS_FILE);
    if (!isset($orders[$orderId])) return null;
    $orders[$orderId] = array_merge($orders[$orderId], $updates);
    writeStore(ORDERS_FILE, $orders);
    return $orders[$orderId];
}

/* ── Review store helpers ───────────────────────────────────────────── */

function getAllReviews(): array
{
    return readStore(REVIEWS_FILE);
}

function saveReview(array $review): void
{
    $reviews = readStore(REVIEWS_FILE);
    // Deduplicate by order_id
    $reviews = array_filter($reviews, fn($r) => $r['order_id'] !== $review['order_id']);
    $reviews[] = $review;
    writeStore(REVIEWS_FILE, array_values($reviews));
}
