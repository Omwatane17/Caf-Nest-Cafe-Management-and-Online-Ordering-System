<?php
/**
 * CaféNest Backend – Auth Helpers
 * Session-based authentication. No database code.
 */

require_once __DIR__ . '/response.php';
require_once __DIR__ . '/session.php';

/* ── Customer auth ─────────────────────────────────────────────────────── */

/**
 * Return the currently logged-in customer array, or null if not logged in.
 */
function getCurrentUser(): ?array
{
    startSecureSession();
    return $_SESSION['current_user'] ?? null;
}

/**
 * Terminate with 401 if no customer is logged in.
 * Returns the customer array on success.
 */
function requireCustomer(): array
{
    $user = getCurrentUser();
    if ($user === null) {
        sendError('You must be logged in to perform this action.', 401);
    }
    return $user;
}

/* ── Admin auth ────────────────────────────────────────────────────────── */

/**
 * Terminate with 401 if the admin session is not active.
 */
function requireAdmin(): void
{
    startSecureSession();
    if (empty($_SESSION['admin_logged_in'])) {
        sendError('Unauthorised. Admin login required.', 401);
    }
}

/**
 * Check if the current user owns the given order.
 * Terminates with 403 if ownership fails.
 *
 * @param array $order Order array (must have 'customer_email' key).
 */
function requireOrderOwnership(array $order): void
{
    $user = requireCustomer();
    if (($order['customer_email'] ?? '') !== $user['email']) {
        sendError('You are not authorised to access this order.', 403);
    }
}
