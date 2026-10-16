<?php
/**
 * CaféNest API – /backend/api/reviews.php
 *
 * POST  → submit a review (customer, authenticated, Completed orders only)
 * GET   → retrieve reviews
 *         ?all=1  (admin) → all reviews
 *         (default, customer) → my reviews only
 *
 * Session-only — no database.
 * Reviews are lost when the session expires.
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/auth-helper.php';
require_once __DIR__ . '/../includes/review-service.php';

setCorsHeaders();
startSecureSession();
requireMethod('GET', 'POST');

/* ── GET: retrieve reviews ────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_GET['all'])) {
        requireAdmin();
        $reviews = getAllReviews();
        sendSuccess('All reviews retrieved.', ['reviews' => $reviews, 'count' => count($reviews)]);
    }

    // Customer: return only their reviews
    $user    = requireCustomer();
    $all     = getAllReviews();
    $mine    = array_values(array_filter($all, fn($r) => $r['customer_email'] === $user['email']));
    sendSuccess('Your reviews retrieved.', ['reviews' => $mine, 'count' => count($mine)]);
}

/* ── POST: submit a review ────────────────────────────────────────── */
requireMethod('POST');

$body    = getJsonBody();
$orderId = requireString($body['order_id'] ?? '', 'order_id', 40);
$rating  = isset($body['rating']) && is_numeric($body['rating']) ? (int)$body['rating'] : 0;
$comment = sanitiseString($body['comment'] ?? '', REVIEW_MAX_LENGTH) ?? '';

if ($rating < REVIEW_MIN_RATING || $rating > REVIEW_MAX_RATING) {
    sendError('Rating must be between ' . REVIEW_MIN_RATING . ' and ' . REVIEW_MAX_RATING . '.', 422);
}

$review = submitReview($orderId, $rating, $comment);

sendSuccess('Review submitted successfully.', $review, 201);
