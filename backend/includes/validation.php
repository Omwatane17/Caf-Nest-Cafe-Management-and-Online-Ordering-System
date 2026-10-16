<?php
/**
 * CaféNest Backend – Input Validation Helpers
 * No database code.
 */

/**
 * Trim and strip tags from a string.
 * Returns null if the result is empty or not a string.
 *
 * @param mixed  $value
 * @param int    $maxLen Maximum character length.
 */
function sanitiseString($value, int $maxLen = 255): ?string
{
    if (!isset($value) || $value === '') return null;
    $clean = trim(strip_tags((string) $value));
    if ($clean === '') return null;
    // Safe fallback: use mb_substr if mbstring is loaded, else substr
    return function_exists('mb_substr')
        ? mb_substr($clean, 0, $maxLen)
        : substr($clean, 0, $maxLen);
}

/**
 * Require a non-empty string field; terminate with 422 if missing.
 */
function requireString($value, string $field, int $maxLen = 255): string
{
    $clean = sanitiseString($value, $maxLen);
    if ($clean === null) {
        sendError("Field '{$field}' is required and must not be empty.", 422);
    }
    return $clean;
}

/**
 * Require a positive integer; terminate with 422 if invalid.
 */
function requirePositiveInt($value, string $field): int
{
    if (!isset($value) || !is_numeric($value) || (int)$value < 1) {
        sendError("Field '{$field}' must be a positive integer.", 422);
    }
    return (int)$value;
}

/**
 * Validate an email address (optional — returns null if empty).
 */
function optionalEmail($value): ?string
{
    $clean = sanitiseString($value);
    if ($clean === null) return null;
    if (!filter_var($clean, FILTER_VALIDATE_EMAIL)) {
        sendError("'email' must be a valid email address.", 422);
    }
    return strtolower($clean);
}

/**
 * Require a valid email address; terminate with 422 if invalid.
 */
function requireEmail($value, string $field = 'email'): string
{
    $email = optionalEmail($value);
    if ($email === null) {
        sendError("Field '{$field}' must be a valid email address.", 422);
    }
    return $email;
}

/**
 * Validate an Indian mobile number (10 digits, prefix optional).
 * Returns the 10-digit string; terminates with 422 if invalid.
 */
function requirePhone($value): string
{
    $raw = sanitiseString($value);
    if ($raw === null) sendError("'phone' is required.", 422);

    $cleaned = preg_replace('/[\s\-\(\)]/u', '', $raw);
    $cleaned = preg_replace('/^(\+91|91)/', '', $cleaned);

    if (!preg_match('/^[6-9]\d{9}$/', $cleaned)) {
        sendError("'phone' must be a valid 10-digit Indian mobile number.", 422);
    }
    return $cleaned;
}
