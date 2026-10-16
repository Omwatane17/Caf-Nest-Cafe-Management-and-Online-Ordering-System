<?php
/**
 * CaféNest Backend – Session Bootstrap
 *
 * Call startSecureSession() at the top of every API endpoint.
 * Configures secure cookie parameters before session_start().
 * No database code.
 */

function startSecureSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return; // already started
    }

    // Harden session cookie
    session_set_cookie_params([
        'lifetime' => 0,          // session cookie (expires when browser closes)
        'path'     => '/',
        'domain'   => '',
        'secure'   => false,      // set true when using HTTPS in production
        'httponly' => true,       // JS cannot access session cookie
        'samesite' => 'Lax',
    ]);

    session_name('CAFENEST_SESS');
    session_start();

    // Initialise top-level session namespaces if absent
    if (!isset($_SESSION['cafenest_init'])) {
        $_SESSION['cafenest_init']  = true;
        $_SESSION['cart']           = [];      // array of {item_id => qty}
        $_SESSION['orders']         = [];      // array keyed by order_id
        $_SESSION['reviews']        = [];      // flat array of review objects
        $_SESSION['current_user']   = null;    // logged-in customer record
        $_SESSION['registered_users'] = [];    // temporary user store
        $_SESSION['admin_logged_in']  = false;
    }
}

/**
 * Generate a cryptographically random CSRF token and store it in the session.
 * Returns the token string.
 */
function generateCsrfToken(): string
{
    startSecureSession();
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    return $token;
}

/**
 * Validate a CSRF token from a request header or body field.
 * Terminates with 403 on mismatch.
 */
function validateCsrfToken(string $submittedToken): void
{
    startSecureSession();
    $expected = $_SESSION['csrf_token'] ?? '';
    if (!$expected || !hash_equals($expected, $submittedToken)) {
        sendError('CSRF token mismatch. Refresh the page and try again.', 403);
    }
}
