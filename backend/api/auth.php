<?php
/**
 * CaféNest API – /backend/api/auth.php
 *
 * Handles customer registration, login, logout, and profile retrieval.
 * Session-only — no database. User records stored in $_SESSION['registered_users'].
 *
 * POST ?action=register  { name, email, password, phone }
 * POST ?action=login     { email, password }
 * POST ?action=logout
 * GET  ?action=me        → returns current user (sanitised)
 *
 * ⚠️  DEMO NOTICE
 *     Registered accounts persist only for the duration of the session.
 *     There is NO permanent user storage without a database.
 *
 *     Demo Admin credentials (NOT for production):
 *       Email:    owner@cafenest.com
 *       Password: admin@123
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/auth-helper.php';

setCorsHeaders();
startSecureSession();

$action = sanitiseString($_GET['action'] ?? 'me') ?? 'me';

/* ── GET /auth.php?action=me ─────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'me') {
    $user = getCurrentUser();
    if ($user === null) {
        sendError('Not logged in.', 401);
    }
    // Return sanitised profile (no password hash)
    $safe = ['name' => $user['name'], 'email' => $user['email'], 'phone' => $user['phone'] ?? ''];
    sendSuccess('Authenticated.', $safe);
}

requireMethod('POST');

$body = getJsonBody();

/* ── POST ?action=register ───────────────────────────────────────────── */
if ($action === 'register') {
    $name     = requireString($body['name']     ?? '', 'name', 80);
    $email    = requireEmail($body['email']     ?? '');
    $password = sanitiseString($body['password'] ?? '', 100);
    $phone    = requirePhone($body['phone']     ?? '');

    if (!$password || strlen($password) < 6) {
        sendError('Password must be at least 6 characters.', 422);
    }

    // Check for duplicate email within the session store
    $users = &$_SESSION['registered_users'];
    foreach ($users as $u) {
        if ($u['email'] === $email) {
            sendError('An account with this email address already exists in this session.', 409);
        }
    }

    $newUser = [
        'id'           => 'USR-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)),
        'name'         => $name,
        'email'        => $email,
        'phone'        => $phone,
        'password_hash'=> password_hash($password, PASSWORD_BCRYPT),
        'role'         => 'customer',
        'created_at'   => date('d M Y, h:i A'),
    ];

    $users[] = $newUser;

    sendSuccess('Account created! (Demo — data persists only in this session.)', [
        'id'    => $newUser['id'],
        'name'  => $newUser['name'],
        'email' => $newUser['email'],
    ], 201);
}

/* ── POST ?action=login ──────────────────────────────────────────────── */
if ($action === 'login') {
    $email    = requireEmail($body['email']     ?? '');
    $password = sanitiseString($body['password'] ?? '', 100);

    if (!$password) {
        sendError("'password' is required.", 422);
    }

    // ── Admin login (DEMO CREDENTIALS — NOT for production) ──────────────
    // For a real system, store the hash in a database and use password_verify().
    // Demo password is intentionally stored as a plain string here for reliability.
    // Change ADMIN_DEMO_PASSWORD in session.php or here before any real deployment.
    $ADMIN_EMAIL    = 'owner@cafenest.com';
    $ADMIN_PASSWORD = 'admin@123';   // ← change before deployment
    $ADMIN_NAME     = 'Cafe Owner';

    if ($email === $ADMIN_EMAIL && $password === $ADMIN_PASSWORD) {
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['current_user']    = null;
        sendSuccess('Admin login successful.', ['role' => 'admin', 'name' => $ADMIN_NAME]);
    }

    // Customer login
    $users    = $_SESSION['registered_users'] ?? [];
    $matched  = null;
    foreach ($users as $u) {
        if ($u['email'] === $email) { $matched = $u; break; }
    }

    if (!$matched || !password_verify($password, $matched['password_hash'])) {
        sendError('Invalid email or password.', 401);
    }

    session_regenerate_id(true);
    $_SESSION['admin_logged_in'] = false;
    $_SESSION['current_user'] = [
        'id'    => $matched['id'],
        'name'  => $matched['name'],
        'email' => $matched['email'],
        'phone' => $matched['phone'] ?? '',
        'role'  => 'customer',
    ];

    sendSuccess('Login successful.', [
        'role'  => 'customer',
        'name'  => $matched['name'],
        'email' => $matched['email'],
    ]);
}

/* ── POST ?action=logout ─────────────────────────────────────────────── */
if ($action === 'logout') {
    $_SESSION['current_user']    = null;
    $_SESSION['admin_logged_in'] = false;
    $_SESSION['cart']            = [];
    sendSuccess('Logged out successfully.');
}

sendError("Unknown action '{$action}'.", 400);
