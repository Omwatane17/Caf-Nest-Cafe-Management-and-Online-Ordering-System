<?php
/**
 * CaféNest Backend – Menu Data (PHP Array — No Database)
 *
 * This file is the single source of truth for menu items and prices.
 * Prices are NEVER accepted from the frontend; they are always read here.
 *
 * NOTE: This is temporary/demo data for the college DBMS Lab project.
 *       In a production system this would be persisted in a database.
 *
 * Structure per item:
 *   id          – unique slug used in cart / order payloads
 *   cafe_id     – which cafe this belongs to
 *   category    – category slug (coffee, tea, snacks, breakfast, desserts, cold-beverages)
 *   name        – display name
 *   description – short description
 *   price       – price in INR (integer)
 *   available   – bool; unavailable items cannot be added to cart
 *   prep_time   – estimated preparation time in minutes (per unit)
 *   image       – filename inside frontend/user/assets/
 */

const MENU_ITEMS = [

    /* ── The Brew House ─────────────────────────────────────── */
    'item-bh-1' => [
        'id' => 'item-bh-1', 'cafe_id' => 'brew-house', 'category' => 'coffee',
        'name' => 'Cappuccino',        'description' => 'Rich and smooth coffee',
        'price' => 120, 'available' => true, 'prep_time' => 4,
        'image' => 'assets/menu-cappuccino.jpg',
    ],
    'item-bh-2' => [
        'id' => 'item-bh-2', 'cafe_id' => 'brew-house', 'category' => 'coffee',
        'name' => 'Latte',             'description' => 'Mild and creamy coffee',
        'price' => 140, 'available' => true, 'prep_time' => 4,
        'image' => 'assets/menu-latte.jpg',
    ],
    'item-bh-3' => [
        'id' => 'item-bh-3', 'cafe_id' => 'brew-house', 'category' => 'coffee',
        'name' => 'Americano',         'description' => 'Strong and classic',
        'price' => 100, 'available' => true, 'prep_time' => 3,
        'image' => 'assets/menu-americano.jpg',
    ],
    'item-bh-4' => [
        'id' => 'item-bh-4', 'cafe_id' => 'brew-house', 'category' => 'cold-beverages',
        'name' => 'Cold Coffee',       'description' => 'Chilled and refreshing',
        'price' => 150, 'available' => true, 'prep_time' => 5,
        'image' => 'assets/menu-cold-coffee.jpg',
    ],
    'item-bh-5' => [
        'id' => 'item-bh-5', 'cafe_id' => 'brew-house', 'category' => 'cold-beverages',
        'name' => 'Chocolate Shake',   'description' => 'Rich chocolate flavor',
        'price' => 160, 'available' => true, 'prep_time' => 5,
        'image' => 'assets/menu-chocolate-shake.jpg',
    ],
    'item-bh-6' => [
        'id' => 'item-bh-6', 'cafe_id' => 'brew-house', 'category' => 'snacks',
        'name' => 'Veg Sandwich',      'description' => 'Freshly made with vegetables',
        'price' => 120, 'available' => true, 'prep_time' => 8,
        'image' => 'assets/menu-veg-sandwich.jpg',
    ],
    'item-bh-7' => [
        'id' => 'item-bh-7', 'cafe_id' => 'brew-house', 'category' => 'tea',
        'name' => 'Masala Chai',       'description' => 'Traditional spiced ginger and cardamom tea',
        'price' => 60, 'available' => true, 'prep_time' => 5,
        'image' => 'assets/menu-masala-chai.jpg',
    ],
    'item-bh-8' => [
        'id' => 'item-bh-8', 'cafe_id' => 'brew-house', 'category' => 'breakfast',
        'name' => 'Butter Croissant',  'description' => 'Flaky French pastry served warm',
        'price' => 110, 'available' => true, 'prep_time' => 6,
        'image' => 'assets/menu-croissant.jpg',
    ],
    'item-bh-9' => [
        'id' => 'item-bh-9', 'cafe_id' => 'brew-house', 'category' => 'desserts',
        'name' => 'Blueberry Cheesecake', 'description' => 'Silky smooth baked cheesecake topped with berry compote',
        'price' => 190, 'available' => true, 'prep_time' => 3,  // pre-made, just plating
        'image' => 'assets/menu-cheesecake.jpg',
    ],
    'item-bh-10' => [
        'id' => 'item-bh-10', 'cafe_id' => 'brew-house', 'category' => 'snacks',
        'name' => 'Margherita Pizza',  'description' => 'Classic Italian pizza',
        'price' => 220, 'available' => true, 'prep_time' => 15,
        'image' => 'assets/menu-pizza.jpg',
    ],
    'item-bh-11' => [
        'id' => 'item-bh-11', 'cafe_id' => 'brew-house', 'category' => 'snacks',
        'name' => 'French Fries',      'description' => 'Crispy and golden',
        'price' => 100, 'available' => true, 'prep_time' => 8,
        'image' => 'assets/menu-fries.jpg',
    ],

    /* ── Urban Chai Cafe ─────────────────────────────────────── */
    'item-uc-1' => [
        'id' => 'item-uc-1', 'cafe_id' => 'urban-chai', 'category' => 'tea',
        'name' => 'Special Kulhad Chai',   'description' => 'Steaming clay-pot tea with roasted spices',
        'price' => 50, 'available' => true, 'prep_time' => 5,
        'image' => 'assets/menu-kulhad-chai.jpg',
    ],
    'item-uc-2' => [
        'id' => 'item-uc-2', 'cafe_id' => 'urban-chai', 'category' => 'tea',
        'name' => 'Ginger Lemon Honey Tea', 'description' => 'Soothing blend of fresh ginger and pure honey',
        'price' => 70, 'available' => true, 'prep_time' => 5,
        'image' => 'assets/menu-lemon-tea.jpg',
    ],
    'item-uc-3' => [
        'id' => 'item-uc-3', 'cafe_id' => 'urban-chai', 'category' => 'snacks',
        'name' => 'Bun Maska',            'description' => 'Toasted pav bun filled with generous butter',
        'price' => 60, 'available' => true, 'prep_time' => 4,
        'image' => 'assets/menu-bun-maska.jpg',
    ],
    'item-uc-4' => [
        'id' => 'item-uc-4', 'cafe_id' => 'urban-chai', 'category' => 'snacks',
        'name' => 'Crispy Samosa Platter', 'description' => 'Golden spiced potato turnovers with mint chutney',
        'price' => 80, 'available' => true, 'prep_time' => 6,
        'image' => 'assets/menu-samosa.jpg',
    ],

    /* ── The Coffee Club ────────────────────────────────────── */
    'item-cc-1' => [
        'id' => 'item-cc-1', 'cafe_id' => 'coffee-club', 'category' => 'coffee',
        'name' => 'Caramel Macchiato',    'description' => 'Espresso marked with velvety milk and caramel drizzle',
        'price' => 180, 'available' => true, 'prep_time' => 5,
        'image' => 'assets/menu-macchiato.jpg',
    ],
    'item-cc-2' => [
        'id' => 'item-cc-2', 'cafe_id' => 'coffee-club', 'category' => 'desserts',
        'name' => 'Belgian Waffle',       'description' => 'Crisp waffle loaded with chocolate sauce and cream',
        'price' => 210, 'available' => true, 'prep_time' => 10,
        'image' => 'assets/menu-waffle.jpg',
    ],
    'item-cc-3' => [
        'id' => 'item-cc-3', 'cafe_id' => 'coffee-club', 'category' => 'cold-beverages',
        'name' => 'Iced Hazelnut Frappe', 'description' => 'Blended chilled espresso with nutty hazelnut cream',
        'price' => 195, 'available' => true, 'prep_time' => 6,
        'image' => 'assets/menu-frappe.jpg',
    ],

    /* ── Cafe 24 ────────────────────────────────────────────── */
    'item-c24-1' => [
        'id' => 'item-c24-1', 'cafe_id' => 'cafe-24', 'category' => 'snacks',
        'name' => 'Farmhouse Pizza',      'description' => 'Loaded with bell peppers, olives, corn, and mozzarella',
        'price' => 280, 'available' => true, 'prep_time' => 18,
        'image' => 'assets/menu-pizza.jpg',
    ],
    'item-c24-2' => [
        'id' => 'item-c24-2', 'cafe_id' => 'cafe-24', 'category' => 'snacks',
        'name' => 'Crispy Paneer Burger', 'description' => 'Golden spiced patty with crunchy lettuce and house mayo',
        'price' => 140, 'available' => true, 'prep_time' => 10,
        'image' => 'assets/menu-burger.jpg',
    ],
    'item-c24-3' => [
        'id' => 'item-c24-3', 'cafe_id' => 'cafe-24', 'category' => 'cold-beverages',
        'name' => 'KitKat Thickshake',   'description' => 'Crushed chocolate wafers whipped into rich ice cream',
        'price' => 170, 'available' => true, 'prep_time' => 6,
        'image' => 'assets/menu-kitkat-shake.jpg',
    ],
];

/**
 * Menu category definitions (mirrors frontend MENU_CATEGORIES).
 */
const MENU_CATEGORIES = [
    'all'             => ['name' => 'All Items',       'icon' => 'grid'],
    'coffee'          => ['name' => 'Coffee',          'icon' => 'coffee'],
    'tea'             => ['name' => 'Tea',             'icon' => 'cup'],
    'snacks'          => ['name' => 'Snacks',          'icon' => 'snack'],
    'breakfast'       => ['name' => 'Breakfast',       'icon' => 'breakfast'],
    'desserts'        => ['name' => 'Desserts',        'icon' => 'cake'],
    'cold-beverages'  => ['name' => 'Cold Beverages',  'icon' => 'glass'],
];

/**
 * Return a single menu item by ID, or null if not found / unavailable.
 *
 * @param string $id
 * @param bool   $allowUnavailable  Set true for admin calls.
 */
function getMenuItem(string $id, bool $allowUnavailable = false): ?array
{
    $item = MENU_ITEMS[$id] ?? null;
    if ($item === null) return null;
    if (!$allowUnavailable && !$item['available']) return null;
    return $item;
}

/**
 * Return all menu items, optionally filtered by cafe_id and/or category.
 * By default only available items are returned.
 */
function getMenuItems(string $cafeId = '', string $category = '', bool $includeUnavailable = false): array
{
    $results = [];
    foreach (MENU_ITEMS as $item) {
        if (!$includeUnavailable && !$item['available']) continue;
        if ($cafeId   && $item['cafe_id']  !== $cafeId)   continue;
        if ($category && $category !== 'all' && $item['category'] !== $category) continue;
        $results[] = $item;
    }
    return array_values($results);
}

/**
 * Preparation time constants (minutes).
 * Minimum order prep time (queue, plating).
 */
const PREP_TIME_BASE_MINUTES = 5;
const PREP_TIME_PER_EXTRA_QTY = 2; // added per extra unit beyond 1

/**
 * Calculate estimated preparation time for a cart/order.
 *
 * Rule: base_time + max(item_prep_times) + (total_extra_qty * 2)
 * Returned as an integer (minutes).
 *
 * @param array $cartLines  Array of {item_id, qty, ...}
 */
function calcPrepTime(array $cartLines): int
{
    if (empty($cartLines)) return 0;

    $maxItemTime = 0;
    $totalExtraQty = 0;

    foreach ($cartLines as $line) {
        $item = MENU_ITEMS[$line['item_id']] ?? null;
        if (!$item) continue;
        if ($item['prep_time'] > $maxItemTime) {
            $maxItemTime = $item['prep_time'];
        }
        $totalExtraQty += max(0, (int)$line['qty'] - 1);
    }

    return PREP_TIME_BASE_MINUTES + $maxItemTime + ($totalExtraQty * PREP_TIME_PER_EXTRA_QTY);
}
