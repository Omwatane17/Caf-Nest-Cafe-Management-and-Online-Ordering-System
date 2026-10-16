/**
 * CaféNest - Master Data Source
 * Represents database-ready cafe records and menu catalog for Home, Explore, and Details pages.
 */

const CAFES_DATA = [
  {
    id: 'brew-house',
    name: 'The Brew House',
    city: 'Amravati',
    distanceKm: 1.2,
    rating: 4.5,
    reviewCount: 120,
    reviewCountDisplay: '120+',
    tags: ['Coffee', 'Snacks', 'Continental'],
    cuisines: ['Coffee', 'Snacks'],
    priceMin: 300,
    priceMax: 700,
    // Demo-only fields
    address: 'Camp Road, Near Gandhi Chowk, Amravati',
    description: 'A cozy neighborhood cafe offering specialty single-origin roasts, artisanal tea, freshly baked pastries, and warm conversations.',
    facilities: ['Indoor Seating', 'Outdoor Seating', 'Wi-Fi', 'Parking'],
    image: 'assets/cafe-brew-house.jpg',
    defaultFavorited: true
  },
  {
    id: 'urban-chai',
    name: 'Urban Chai Cafe',
    city: 'Amravati',
    distanceKm: 2.5,
    rating: 4.3,
    reviewCount: 98,
    reviewCountDisplay: '98+',
    tags: ['Chai', 'Snacks', 'Light Bites'],
    cuisines: ['Tea', 'Snacks'],
    priceMin: 100,
    priceMax: 400,
    address: 'Rajkamal Square, Main Market, Amravati',
    description: 'Authentic Indian chai varieties paired with quick bites and comforting street snacks in an intimate rustic setting.',
    facilities: ['Indoor Seating', 'Wi-Fi'],
    image: 'assets/cafe-urban-chai.jpg',
    defaultFavorited: false
  },
  {
    id: 'coffee-club',
    name: 'The Coffee Club',
    city: 'Amravati',
    distanceKm: 3.1,
    rating: 4.7,
    reviewCount: 210,
    reviewCountDisplay: '210+',
    tags: ['Coffee', 'Desserts', 'Continental'],
    cuisines: ['Coffee', 'Desserts'],
    priceMin: 300,
    priceMax: 800,
    address: 'Badnera Road, Ambika Nagar, Amravati',
    description: 'Premium continental delicacies, hand-crafted espresso, live acoustic sessions, and signature gourmet desserts.',
    facilities: ['Indoor Seating', 'Outdoor Seating', 'Wi-Fi', 'Live Music'],
    image: 'assets/cafe-coffee-club.jpg',
    defaultFavorited: false
  },
  {
    id: 'cafe-24',
    name: 'Cafe 24',
    city: 'Amravati',
    distanceKm: 4.8,
    rating: 4.2,
    reviewCount: 76,
    reviewCountDisplay: '76+',
    tags: ['Pizza', 'Burgers', 'Fast Food'],
    cuisines: ['Pizza', 'Fast Food'],
    priceMin: 200,
    priceMax: 600,
    address: 'Tapovan Gate, Bypass Highway, Amravati',
    description: 'Youthful and lively hangout spot famous for wood-fired pizza, loaded burgers, and ice-cold shakes.',
    facilities: ['Indoor Seating', 'Outdoor Seating', 'Parking'],
    image: 'assets/cafe-24.jpg',
    defaultFavorited: false
  }
];

// Cuisine category mapping helper for filter comparisons
const CUISINE_MAPPING = {
  'Coffee': ['Coffee'],
  'Tea': ['Tea', 'Chai'],
  'Snacks': ['Snacks', 'Light Bites'],
  'Desserts': ['Desserts'],
  'Pizza': ['Pizza'],
  'Fast Food': ['Fast Food', 'Burgers']
};

/**
 * Menu Category Master Definitions
 */
const MENU_CATEGORIES = [
  { id: 'all', name: 'All Items', icon: 'grid' },
  { id: 'coffee', name: 'Coffee', icon: 'coffee' },
  { id: 'tea', name: 'Tea', icon: 'cup' },
  { id: 'snacks', name: 'Snacks', icon: 'snack' },
  { id: 'breakfast', name: 'Breakfast', icon: 'breakfast' },
  { id: 'desserts', name: 'Desserts', icon: 'cake' },
  { id: 'cold-beverages', name: 'Cold Beverages', icon: 'glass' }
];

/**
 * Menu Items Catalog (relational records referencing cafeId and categoryId)
 */
const MENU_ITEMS = [
  // The Brew House Menu (matching reference image cafe details.png)
  {
    id: 'item-bh-1',
    cafeId: 'brew-house',
    categoryId: 'coffee',
    name: 'Cappuccino',
    description: 'Rich and smooth coffee',
    price: 120,
    available: true,
    image: 'assets/menu-cappuccino.jpg'
  },
  {
    id: 'item-bh-2',
    cafeId: 'brew-house',
    categoryId: 'coffee',
    name: 'Latte',
    description: 'Mild and creamy coffee',
    price: 140,
    available: true,
    image: 'assets/menu-latte.jpg'
  },
  {
    id: 'item-bh-3',
    cafeId: 'brew-house',
    categoryId: 'coffee',
    name: 'Americano',
    description: 'Strong and classic',
    price: 100,
    available: true,
    image: 'assets/menu-americano.jpg'
  },
  {
    id: 'item-bh-4',
    cafeId: 'brew-house',
    categoryId: 'cold-beverages',
    name: 'Cold Coffee',
    description: 'Chilled and refreshing',
    price: 150,
    available: true,
    image: 'assets/menu-cold-coffee.jpg'
  },
  {
    id: 'item-bh-5',
    cafeId: 'brew-house',
    categoryId: 'cold-beverages',
    name: 'Chocolate Shake',
    description: 'Rich chocolate flavor',
    price: 160,
    available: true,
    image: 'assets/menu-chocolate-shake.jpg'
  },
  {
    id: 'item-bh-6',
    cafeId: 'brew-house',
    categoryId: 'snacks',
    name: 'Veg Sandwich',
    description: 'Freshly made with vegetables',
    price: 120,
    available: true,
    image: 'assets/menu-veg-sandwich.jpg'
  },
  {
    id: 'item-bh-7',
    cafeId: 'brew-house',
    categoryId: 'tea',
    name: 'Masala Chai',
    description: 'Traditional spiced ginger and cardamom tea',
    price: 60,
    available: true,
    image: 'assets/menu-masala-chai.jpg'
  },
  {
    id: 'item-bh-8',
    cafeId: 'brew-house',
    categoryId: 'breakfast',
    name: 'Butter Croissant',
    description: 'Flaky French pastry served warm',
    price: 110,
    available: true,
    image: 'assets/menu-croissant.jpg'
  },
  {
    id: 'item-bh-9',
    cafeId: 'brew-house',
    categoryId: 'desserts',
    name: 'Blueberry Cheesecake',
    description: 'Silky smooth baked cheesecake topped with berry compote',
    price: 190,
    available: true,
    image: 'assets/menu-cheesecake.jpg'
  },

  // Urban Chai Cafe Menu Items
  {
    id: 'item-uc-1',
    cafeId: 'urban-chai',
    categoryId: 'tea',
    name: 'Special Kulhad Chai',
    description: 'Steaming clay-pot tea with roasted spices',
    price: 50,
    available: true,
    image: 'assets/menu-kulhad-chai.jpg'
  },
  {
    id: 'item-uc-2',
    cafeId: 'urban-chai',
    categoryId: 'tea',
    name: 'Ginger Lemon Honey Tea',
    description: 'Soothing blend of fresh ginger and pure honey',
    price: 70,
    available: true,
    image: 'assets/menu-lemon-tea.jpg'
  },
  {
    id: 'item-uc-3',
    cafeId: 'urban-chai',
    categoryId: 'snacks',
    name: 'Bun Maska',
    description: 'Toasted pav bun filled with generous butter dollops',
    price: 60,
    available: true,
    image: 'assets/menu-bun-maska.jpg'
  },
  {
    id: 'item-uc-4',
    cafeId: 'urban-chai',
    categoryId: 'snacks',
    name: 'Crispy Samosa Platter',
    description: 'Golden spiced potato turnovers with mint chutney',
    price: 80,
    available: true,
    image: 'assets/menu-samosa.jpg'
  },

  // The Coffee Club Menu Items
  {
    id: 'item-cc-1',
    cafeId: 'coffee-club',
    categoryId: 'coffee',
    name: 'Caramel Macchiato',
    description: 'Espresso marked with velvety milk and caramel drizzle',
    price: 180,
    available: true,
    image: 'assets/menu-macchiato.jpg'
  },
  {
    id: 'item-cc-2',
    cafeId: 'coffee-club',
    categoryId: 'desserts',
    name: 'Belgian Waffle',
    description: 'Crisp waffle loaded with chocolate sauce and cream',
    price: 210,
    available: true,
    image: 'assets/menu-waffle.jpg'
  },
  {
    id: 'item-cc-3',
    cafeId: 'coffee-club',
    categoryId: 'cold-beverages',
    name: 'Iced Hazelnut Frappe',
    description: 'Blended chilled espresso with nutty hazelnut cream',
    price: 195,
    available: true,
    image: 'assets/menu-frappe.jpg'
  },

  // Cafe 24 Menu Items
  {
    id: 'item-c24-1',
    cafeId: 'cafe-24',
    categoryId: 'snacks',
    name: 'Farmhouse Pizza',
    description: 'Loaded with bell peppers, olives, corn, and mozzarella',
    price: 280,
    available: true,
    image: 'assets/menu-pizza.jpg'
  },
  {
    id: 'item-c24-2',
    cafeId: 'cafe-24',
    categoryId: 'snacks',
    name: 'Crispy Paneer Burger',
    description: 'Golden spiced patty with crunchy lettuce and house mayo',
    price: 140,
    available: true,
    image: 'assets/menu-burger.jpg'
  },
  {
    id: 'item-c24-3',
    cafeId: 'cafe-24',
    categoryId: 'cold-beverages',
    name: 'KitKat Thickshake',
    description: 'Crushed chocolate wafers whipped into rich ice cream',
    price: 170,
    available: true,
    image: 'assets/menu-kitkat-shake.jpg'
  }
];

/**
 * Seating Layout Tables Definition for The Brew House (matching seating arrangement.png)
 * Status: 'available' (green), 'booked' (orange/brownish-grey), 'selected' (blue)
 */
const SEATING_TABLES = [
  // Indoor Section
  // Row 1 (top): T1 (available, 4), T2 (available, 4), T3 (booked, 4), T4 (available, 4)
  { id: 'T1', number: 1, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'available', top: 22, left: 17, chairs: 4 },
  { id: 'T2', number: 2, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'available', top: 22, left: 32, chairs: 4 },
  { id: 'T3', number: 3, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 22, left: 47, chairs: 4 },
  { id: 'T4', number: 4, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'available', top: 22, left: 63, chairs: 4 },

  // Row 2 (middle): T5 (booked, 4), T6 (available, 2), T7 (available, 4), T8 (available, 2), T9 (booked, 4)
  { id: 'T5', number: 5, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 45, left: 14, chairs: 4 },
  { id: 'T6', number: 6, section: 'indoor', capacity: 2, type: 'Round', defaultStatus: 'available', top: 45, left: 26, chairs: 2 },
  { id: 'T7', number: 7, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'available', top: 45, left: 40, chairs: 4 },
  { id: 'T8', number: 8, section: 'indoor', capacity: 2, type: 'Round', defaultStatus: 'available', top: 45, left: 53, chairs: 2 },
  { id: 'T9', number: 9, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 45, left: 68, chairs: 4 },

  // Row 3 (bottom): T10 (booked, 4), T11 (booked, 4), T12 (available, 4), T13 (booked, 4), T14 (available, 4)
  { id: 'T10', number: 10, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 70, left: 18, chairs: 4 },
  { id: 'T11', number: 11, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 70, left: 33, chairs: 4 },
  { id: 'T12', number: 12, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'available', top: 68, left: 50, chairs: 4 },
  { id: 'T13', number: 13, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 70, left: 62, chairs: 4 },
  { id: 'T14', number: 14, section: 'indoor', capacity: 4, type: 'Round', defaultStatus: 'available', top: 70, left: 74, chairs: 4 },

  // Outdoor Section
  // T15 (booked, 4, with umbrella), T16 (umbrella canopy), T17 (available, 2), T18 (booked, 4), T19 (umbrella canopy), T20 (umbrella canopy)
  { id: 'T15', number: 15, section: 'outdoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 23, left: 85, chairs: 4 },
  { id: 'T16', number: 16, section: 'outdoor', capacity: 4, type: 'Canopy', defaultStatus: 'booked',   top: 23, left: 95, chairs: 4, hasUmbrella: true },
  { id: 'T17', number: 17, section: 'outdoor', capacity: 2, type: 'Round', defaultStatus: 'available', top: 46, left: 91, chairs: 2 },
  { id: 'T18', number: 18, section: 'outdoor', capacity: 4, type: 'Round', defaultStatus: 'booked',    top: 65, left: 86, chairs: 4 },
  { id: 'T19', number: 19, section: 'outdoor', capacity: 4, type: 'Canopy', defaultStatus: 'booked',   top: 65, left: 95, chairs: 4, hasUmbrella: true },
  { id: 'T20', number: 20, section: 'outdoor', capacity: 4, type: 'Canopy', defaultStatus: 'booked',   top: 84, left: 91, chairs: 4, hasUmbrella: true }
];

/**
 * Master Users Data (Demo-only)
 * Relational-ready customer records for profile and booking associations.
 * Demo record matching profile.png.
 * Note: Replace with generic customer data before final project submission if desired.
 */
const USERS_DATA = [
  {
    id: 'user-001',
    name: 'CafeNest User',
    phone: '+91 98765 43210',
    email: 'tejaswini@email.com',
    address: 'Amravati, Maharashtra',
    avatar: null
  }
];

// Alias for relational reuse across modules
const users = USERS_DATA;
