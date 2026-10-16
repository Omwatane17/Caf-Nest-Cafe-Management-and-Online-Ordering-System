/**
 * CaféNest Administrator — Demo Data
 * Relational-style arrays ready to map to database tables.
 * Static demo values are marked; future pages should compute live values from live records.
 */

/* ── Café Record ── */
const ADMIN_CAFE = {
  id:    'cafe-001',
  name:  'The Brew House',
  owner: 'Cafe Owner',
  email: 'owner@cafenest.com'   /* NOTE: image shows "calenest" — corrected to "cafenest" */
};

/* ── Dashboard Stat Cards ──
   DEMO: These numbers are static. In a real build:
   - "Available Tables" should count tables with status === 'available' from table records.
   - "Total Menu Items"  should count rows in the menu collection.
   - "Total Reservations" should count today's reservations from the reservations array.
   - "Today's Revenue" should sum completed booking totals for today.
*/
const ADMIN_DASHBOARD_STATS = [
  {
    id:      'total-reservations',
    label:   'Total Reservations',
    value:   '12',
    iconKey: 'reservations',
    iconColor: 'peach',
    trend:   { direction: 'down', text: '20% from yesterday', tone: 'negative' }
  },
  {
    id:      'available-tables',
    label:   'Available Tables',
    value:   '8 / 16',
    iconKey: 'tables',
    iconColor: 'green',
    trend:   { direction: 'up', text: '2 more than yesterday', tone: 'positive' }
  },
  {
    id:      'total-menu-items',
    label:   'Total Menu Items',
    value:   '24',
    iconKey: 'menu',
    iconColor: 'lavender',
    trend:   { direction: 'none', text: 'No change', tone: 'neutral' }
  },
  {
    id:      'todays-revenue',
    label:   "Today's Revenue",
    value:   '₹ 8,450',
    iconKey: 'revenue',
    iconColor: 'amber',
    trend:   { direction: 'up', text: '15% from yesterday', tone: 'positive' }
  }
];

/* ── Reservations ──
   DEMO: Six initial reservations matching reservation.png.
   Fields: id, cafeId, customerName, date (YYYY-MM-DD), time, tableId, guests, status ('Confirmed'|'Pending'|'Cancelled')
*/
const ADMIN_RESERVATIONS = [
  { id: 'R001', cafeId: 'cafe-001', customerName: 'Sneha Patil',    date: '2026-10-12', time: '11:00 AM', tableId: 'T3',  guests: 2, status: 'Confirmed' },
  { id: 'R002', cafeId: 'cafe-001', customerName: 'Rohit Sharma',   date: '2026-10-12', time: '12:30 PM', tableId: 'T6',  guests: 4, status: 'Confirmed' },
  { id: 'R003', cafeId: 'cafe-001', customerName: 'Aditi Deshmukh', date: '2026-10-12', time: '2:00 PM',  tableId: 'T8',  guests: 3, status: 'Pending'   },
  { id: 'R004', cafeId: 'cafe-001', customerName: 'Pratik More',    date: '2026-10-12', time: '4:30 PM',  tableId: 'T11', guests: 5, status: 'Confirmed' },
  { id: 'R005', cafeId: 'cafe-001', customerName: 'Neha Joshi',     date: '2026-10-12', time: '7:00 PM',  tableId: 'T5',  guests: 2, status: 'Cancelled' },
  { id: 'R006', cafeId: 'cafe-001', customerName: 'Sameer Khan',    date: '2026-10-13', time: '10:00 AM', tableId: 'T9',  guests: 4, status: 'Confirmed' }
];

/* ── Recent Activity ── */
const ADMIN_ACTIVITIES = [
  { id: 'act-001', type: 'reservation', title: 'New reservation from Sneha Patil', detail: 'T3 - 2 guests',       time: '10:15 AM', iconStyle: 'pink'   },
  { id: 'act-002', type: 'menu',        title: 'Menu item updated',                 detail: 'Cold Coffee - ₹140',   time: '09:42 AM', iconStyle: 'tan'    },
  { id: 'act-003', type: 'table',       title: 'Table T5 marked as Occupied',       detail: '',                    time: '09:20 AM', iconStyle: 'slate'  },
  { id: 'act-004', type: 'review',      title: 'Review received',                   detail: '4 stars',             time: '08:50 AM', iconStyle: 'orange' }
];

/* ── Menu Items ──
   DEMO: Six seed items matching menu & prices.png.
   menu.js holds these in a live `menuItems` array so Add/Edit/Delete
   work in-memory for the current session.
   Fields: id, cafeId, name, category, description, price (number, ₹), available (bool), image (filename in assets/).
*/
const ADMIN_MENU_SEED = [
  { id: 'menu-001', cafeId: 'cafe-001', name: 'Cappuccino',       category: 'Coffee',      description: 'Rich and smooth coffee',       price: 120, available: true,  image: 'cappuccino.jpg'  },
  { id: 'menu-002', cafeId: 'cafe-001', name: 'Cold Coffee',      category: 'Beverages',   description: 'Chilled coffee with ice cream', price: 150, available: true,  image: 'cold-coffee.jpg' },
  { id: 'menu-003', cafeId: 'cafe-001', name: 'Veg Sandwich',     category: 'Snacks',      description: 'Fresh veggies with bread',     price: 120, available: true,  image: 'sandwich.jpg'    },
  { id: 'menu-004', cafeId: 'cafe-001', name: 'Margherita Pizza', category: 'Main Course', description: 'Classic italian pizza',         price: 220, available: true,  image: 'pizza.jpg'       },
  { id: 'menu-005', cafeId: 'cafe-001', name: 'Chocolate Shake',  category: 'Beverages',   description: 'Smooth and creamy',            price: 160, available: true,  image: 'choc-shake.jpg'  },
  { id: 'menu-006', cafeId: 'cafe-001', name: 'French Fries',     category: 'Snacks',      description: 'Crispy and golden',            price: 100, available: true,  image: 'fries.jpg'       }
];

/* ── Seating Tables ──
   DEMO: Seating tables matching seating arrangement2.png.
   seating.js holds a live copy in `seatingTables` so status updates and add table work in-memory.
   Fields: id, cafeId, label, capacity, type ('Round'|'Square'), zone ('Indoor'|'Outdoor'|'Private'), status ('Available'|'Occupied'|'Reserved'|'Unavailable'), posX (%), posY (%).
*/
const ADMIN_SEATING_TABLES = [
  { id: 't-001', cafeId: 'cafe-001', label: 'T5',  capacity: 4, type: 'Round',  zone: 'Indoor', status: 'Available',   posX: 18, posY: 25 },
  { id: 't-002', cafeId: 'cafe-001', label: 'T2',  capacity: 2, type: 'Round',  zone: 'Indoor', status: 'Occupied',    posX: 36, posY: 25 },
  { id: 't-003', cafeId: 'cafe-001', label: 'T3',  capacity: 4, type: 'Round',  zone: 'Indoor', status: 'Available',   posX: 55, posY: 25 },
  { id: 't-004', cafeId: 'cafe-001', label: 'TS',  capacity: 4, type: 'Square', zone: 'Indoor', status: 'Available',   posX: 74, posY: 25 },
  { id: 't-005', cafeId: 'cafe-001', label: 'T8',  capacity: 2, type: 'Round',  zone: 'Indoor', status: 'Available',   posX: 34, posY: 54 },
  { id: 't-006', cafeId: 'cafe-001', label: 'T6',  capacity: 4, type: 'Square', zone: 'Indoor', status: 'Available',   posX: 52, posY: 46 },
  { id: 't-007', cafeId: 'cafe-001', label: 'T6',  capacity: 4, type: 'Round',  zone: 'Indoor', status: 'Occupied',    posX: 69, posY: 48 },
  { id: 't-008', cafeId: 'cafe-001', label: 'T11', capacity: 4, type: 'Square', zone: 'Indoor', status: 'Available',   posX: 20, posY: 73 },
  { id: 't-009', cafeId: 'cafe-001', label: 'T12', capacity: 4, type: 'Round',  zone: 'Indoor', status: 'Unavailable', posX: 40, posY: 73 },
  { id: 't-010', cafeId: 'cafe-001', label: 'T10', capacity: 4, type: 'Square', zone: 'Indoor', status: 'Unavailable', posX: 58, posY: 62 },
  { id: 't-011', cafeId: 'cafe-001', label: 'T12', capacity: 4, type: 'Square', zone: 'Indoor', status: 'Unavailable', posX: 78, posY: 62 }
];

/* ── Table Status Records ──
   DEMO: 12 tables matching table status.png in exact order.
   Fields: id, cafeId, label, capacity, status ('Available'|'Occupied'|'Reserved'|'Unavailable'), zone ('Indoor'|'Outdoor'|'Private'), type ('Round'|'Square')
*/
const ADMIN_TABLES = [
  { id: 'tab-001', cafeId: 'cafe-001', label: 'T1',  capacity: 2, status: 'Available',   zone: 'Indoor', type: 'Square' },
  { id: 'tab-002', cafeId: 'cafe-001', label: 'T2',  capacity: 4, status: 'Available',   zone: 'Indoor', type: 'Round'  },
  { id: 'tab-003', cafeId: 'cafe-001', label: 'T3',  capacity: 2, status: 'Occupied',    zone: 'Indoor', type: 'Round'  },
  { id: 'tab-004', cafeId: 'cafe-001', label: 'T4',  capacity: 4, status: 'Available',   zone: 'Indoor', type: 'Square' },
  { id: 'tab-005', cafeId: 'cafe-001', label: 'T5',  capacity: 4, status: 'Reserved',    zone: 'Indoor', type: 'Round'  },
  { id: 'tab-006', cafeId: 'cafe-001', label: 'T6',  capacity: 4, status: 'Occupied',    zone: 'Indoor', type: 'Square' },
  { id: 'tab-007', cafeId: 'cafe-001', label: 'T7',  capacity: 6, status: 'Available',   zone: 'Indoor', type: 'Square' },
  { id: 'tab-008', cafeId: 'cafe-001', label: 'T8',  capacity: 3, status: 'Available',   zone: 'Indoor', type: 'Round'  },
  { id: 'tab-009', cafeId: 'cafe-001', label: 'T9',  capacity: 2, status: 'Available',   zone: 'Indoor', type: 'Square' },
  { id: 'tab-010', cafeId: 'cafe-001', label: 'T10', capacity: 4, status: 'Occupied',    zone: 'Indoor', type: 'Square' },
  { id: 'tab-011', cafeId: 'cafe-001', label: 'T11', capacity: 5, status: 'Unavailable', zone: 'Indoor', type: 'Square' },
  { id: 'tab-012', cafeId: 'cafe-001', label: 'T12', capacity: 4, status: 'Available',   zone: 'Indoor', type: 'Square' }
];

/* ── Customer Reviews ──
   DEMO: Summary metrics and 3 initial reviews matching reviews.png.
*/
const ADMIN_REVIEWS_SUMMARY = {
  averageRating: 4.5,
  totalReviews: 68,
  distribution: [
    { stars: 5, count: 42 },
    { stars: 4, count: 18 },
    { stars: 3, count: 6 },
    { stars: 2, count: 2 },
    { stars: 1, count: 0 }
  ]
};

const ADMIN_REVIEWS = [
  {
    id: 'rev-001',
    cafeId: 'cafe-001',
    customerName: 'Sneha Patil',
    initials: 'SP',
    avatarBg: '#9BB2C4',
    avatarColor: '#2C3E50',
    date: '12 Oct 2026',
    rating: 5,
    comment: 'Great ambiance and delicious food! The seating arrangement was perfect for our group. Will visit again.',
    reply: null
  },
  {
    id: 'rev-002',
    cafeId: 'cafe-001',
    customerName: 'Rohit Kale',
    initials: 'RK',
    avatarBg: '#A8A6D9',
    avatarColor: '#3D3A68',
    date: '10 Oct 2026',
    rating: 4,
    comment: 'Good food and service. A little crowded during peak hours.',
    reply: null
  },
  {
    id: 'rev-003',
    cafeId: 'cafe-001',
    customerName: 'Aditi Deshmukh',
    initials: 'AD',
    avatarBg: '#B0BCC7',
    avatarColor: '#2B3844',
    date: '8 Oct 2026',
    rating: 5,
    comment: 'Loved the cafe! The staff was very polite and the cafe is beautifully designed.',
    reply: null
  }
];
