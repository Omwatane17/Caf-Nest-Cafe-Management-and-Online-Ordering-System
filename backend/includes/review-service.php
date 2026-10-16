<?php
/**
 * CaféNest Backend – Review Service
 * Uses shared JSON store (store.php). No database code.
 */

require_once __DIR__ . '/response.php';
require_once __DIR__ . '/auth-helper.php';
require_once __DIR__ . '/store.php';

const REVIEW_MIN_RATING = 1;
const REVIEW_MAX_RATING = 5;
const REVIEW_MAX_LENGTH = 500;

/**
 * Submit a review for a completed order.
 */
function submitReview(string $orderId, int $rating, string $comment): array
{
    $order = getOrderById($orderId);
    if (!$order) sendError('Order not found.', 404);
    if ($order['status'] !== 'Completed') {
        sendError('Reviews can only be submitted for Completed orders.', 400);
    }

    $user = requireCustomer();
    if ($order['customer_email'] !== $user['email']) {
        sendError('You can only review your own orders.', 403);
    }
    if ($order['review'] !== null) {
        sendError('You have already submitted a review for this order.', 409);
    }
    if ($rating < REVIEW_MIN_RATING || $rating > REVIEW_MAX_RATING) {
        sendError('Rating must be between ' . REVIEW_MIN_RATING . ' and ' . REVIEW_MAX_RATING . '.', 422);
    }

    $comment = function_exists('mb_substr')
        ? mb_substr(trim($comment), 0, REVIEW_MAX_LENGTH)
        : substr(trim($comment), 0, REVIEW_MAX_LENGTH);

    $review = [
        'review_id'      => 'REV-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)),
        'order_id'       => $orderId,
        'customer_name'  => $user['name'] ?? 'Anonymous',
        'customer_email' => $user['email'],
        'rating'         => $rating,
        'comment'        => $comment,
        'created_at'     => date('d M Y, h:i A'),
    ];

    // Attach review to the order in shared store
    updateOrderInStore($orderId, ['review' => $review]);

    // Also persist to reviews store
    saveReview($review);

    return $review;
}

/**
 * Return all reviews from shared store.
 * Note: getAllReviews() is defined in store.php — available directly.
 */

/**
 * Return reviews for a specific cafe (matched through orders).
 */
function getReviewsByCafe(string $cafeId): array
{
    $all     = getAllReviews();
    $results = [];

    foreach ($all as $review) {
        $order = getOrderById($review['order_id']);
        if ($order && ($order['cafe_id'] ?? '') === $cafeId) {
            $results[] = $review;
        }
    }
    return $results;
}
