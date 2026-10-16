<?php
/**
 * CaféNest Backend – Response Helpers
 * Centralised JSON output. No database code.
 */

/**
 * Set CORS + JSON headers. Handles pre-flight OPTIONS.
 */
function setCorsHeaders(): void
{
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Send a success JSON response and terminate.
 *
 * @param string $message Human-readable message.
 * @param mixed  $data    Optional payload under "data".
 * @param int    $code    HTTP status code (default 200).
 */
function sendSuccess(string $message = 'OK', $data = null, int $code = 200): void
{
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send an error JSON response and terminate.
 *
 * @param string $message Human-readable error.
 * @param int    $code    HTTP status code (default 400).
 */
function sendError(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'data'    => null,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Decode and return the raw JSON request body as array.
 * Terminates with 400 on invalid JSON.
 */
function getJsonBody(): array
{
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Request body must be valid JSON.', 400);
    }
    return is_array($body) ? $body : [];
}

/**
 * Assert HTTP method is one of the allowed values; 405 otherwise.
 */
function requireMethod(string ...$methods): void
{
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        sendError('Method not allowed.', 405);
    }
}
