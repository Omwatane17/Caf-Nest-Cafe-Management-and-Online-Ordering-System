<?php
/**
 * CaféNest API – GET /backend/api/menu.php
 *
 * Returns menu items and categories from the PHP array (no database).
 *
 * Query parameters (all optional):
 *   ?cafe_id=brew-house
 *   ?category=coffee
 *   ?include_unavailable=1   (admin only)
 */

require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/menu-data.php';
require_once __DIR__ . '/../includes/validation.php';

setCorsHeaders();
startSecureSession();
requireMethod('GET');

$cafeId            = sanitiseString($_GET['cafe_id'] ?? '') ?? '';
$category          = sanitiseString($_GET['category'] ?? '') ?? '';
$includeUnavailable = isset($_GET['include_unavailable'])
                      && $_GET['include_unavailable'] === '1'
                      && !empty($_SESSION['admin_logged_in']);

// If ?categories=1 is passed, return the category list
if (isset($_GET['categories'])) {
    $cats = [];
    foreach (MENU_CATEGORIES as $slug => $cat) {
        $cats[] = ['slug' => $slug, 'name' => $cat['name'], 'icon' => $cat['icon']];
    }
    sendSuccess('Categories retrieved.', $cats);
}

$items = getMenuItems($cafeId, $category, $includeUnavailable);

sendSuccess('Menu items retrieved.', [
    'items' => $items,
    'count' => count($items),
]);
