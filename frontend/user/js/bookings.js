/**
 * CaféNest - My Bookings Page Logic
 */

const STORAGE_BOOKINGS_KEY = 'cafenest_bookings';

// Seed demo bookings exactly matching my bookings.png
const SEED_BOOKINGS = [
  {
    referenceId: 'CN-20261012-001',
    cafeId: 'brew-house',
    cafeName: 'The Brew House',
    city: 'Amravati',
    distanceKm: 1.2,
    image: 'assets/cafe-brew-house.jpg',
    table: 7,
    tableName: 'Table 7',
    guests: 4,
    date: '12 Oct 2026',
    time: '06:00 PM',
    status: 'Confirmed',
    category: 'upcoming'
  },
  {
    referenceId: 'CN-20261015-002',
    cafeId: 'urban-chai',
    cafeName: 'Urban Chai Cafe',
    city: 'Amravati',
    distanceKm: 2.5,
    image: 'assets/cafe-urban-chai.jpg',
    table: 3,
    tableName: 'Table 3',
    guests: 2,
    date: '15 Oct 2026',
    time: '07:30 PM',
    status: 'Confirmed',
    category: 'upcoming'
  },
  {
    referenceId: 'CN-20261018-003',
    cafeId: 'coffee-club',
    cafeName: 'The Coffee Club',
    city: 'Amravati',
    distanceKm: 3.1,
    image: 'assets/cafe-coffee-club.jpg',
    table: 12,
    tableName: 'Table 12',
    guests: 6,
    date: '18 Oct 2026',
    time: '08:00 PM',
    status: 'Pending',
    category: 'upcoming'
  }
];

let currentTab = 'upcoming';
let pendingCancelId = null;

/**
 * Loads all bookings from localStorage or seeds defaults
 */
function getBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS));
      return SEED_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS));
    return SEED_BOOKINGS;
  } catch (e) {
    console.warn('LocalStorage read error:', e);
    return SEED_BOOKINGS;
  }
}

/**
 * Saves bookings array to localStorage
 */
function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('LocalStorage write error:', e);
  }
}

/**
 * Renders the bookings card list for the current active tab
 */
function renderBookingsList() {
  const container = document.getElementById('bookings-list');
  if (!container) return;

  const allBookings = getBookings();
  const filtered = allBookings.filter(b => {
    const cat = b.category || 'upcoming';
    return cat === currentTab;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bookings-empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <h3 class="empty-state-title">No ${currentTab} bookings</h3>
        <p class="empty-state-desc">You don't have any ${currentTab} reservations at the moment. Discover our curated cafes and book your table easily!</p>
        <a href="explore.html" class="btn-explore-cta">Explore Cafes</a>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(b => {
    const statusClass = b.status === 'Confirmed' ? 'status-confirmed' 
                      : b.status === 'Pending' ? 'status-pending' 
                      : 'status-cancelled';

    return `
      <article class="booking-card" data-ref="${b.referenceId}">
        
        <!-- Left details group -->
        <div class="booking-card-left">
          <div class="booking-card-thumb">
            <img src="${b.image || 'assets/cafe-brew-house.jpg'}" 
                 alt="${b.cafeName}" 
                 class="booking-thumb-img"
                 onerror="this.style.display='none';">
          </div>
          <div class="booking-card-info">
            <h2 class="booking-cafe-name">${b.cafeName}</h2>
            
            <div class="booking-meta-line">
              <!-- Star icon matching screenshot -->
              <svg class="booking-badge-star" viewBox="0 0 24 24" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Table ${b.table || '7'} &bull; ${b.guests || '4'} People</span>
            </div>

            <div class="booking-datetime-line">
              <svg class="booking-pin-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${b.date}, ${b.time}</span>
            </div>
          </div>
        </div>

        <!-- Right actions group -->
        <div class="booking-card-right">
          <span class="status-pill ${statusClass}">${b.status}</span>

          <div class="booking-actions-row">
            <a href="cafe-details.html?id=${b.cafeId || 'brew-house'}" class="btn-card-action">View Details</a>
            ${b.category !== 'cancelled' ? `
              <button type="button" class="btn-card-action btn-cancel" data-cancel-ref="${b.referenceId}" data-cafe-name="${b.cafeName}">Cancel</button>
            ` : ''}
          </div>
        </div>

      </article>
    `;
  }).join('');

  // Attach Cancel listeners
  container.querySelectorAll('[data-cancel-ref]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ref = btn.getAttribute('data-cancel-ref');
      const name = btn.getAttribute('data-cafe-name');
      promptCancelBooking(ref, name);
    });
  });
}

/**
 * Prompts confirmation modal to cancel a booking
 */
function promptCancelBooking(refId, cafeName) {
  pendingCancelId = refId;
  const nameEl = document.getElementById('cancel-modal-cafe');
  if (nameEl) nameEl.textContent = cafeName;

  const modal = document.getElementById('cancel-booking-modal');
  if (modal) modal.classList.add('open');
}

/**
 * Confirms cancellation of selected booking
 */
function confirmCancelBooking() {
  if (!pendingCancelId) return;

  const allBookings = getBookings();
  const target = allBookings.find(b => b.referenceId === pendingCancelId);
  if (target) {
    target.status = 'Cancelled';
    target.category = 'cancelled';
    saveBookings(allBookings);
    showToast(`Reservation for ${target.cafeName} has been cancelled.`);
  }

  closeCancelModal();
  renderBookingsList();
}

/**
 * Closes cancellation modal
 */
function closeCancelModal() {
  pendingCancelId = null;
  const modal = document.getElementById('cancel-booking-modal');
  if (modal) modal.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  renderBookingsList();

  // Tab switching
  document.querySelectorAll('.tab-btn-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      renderBookingsList();
    });
  });

  // Cancel Modal Handlers
  document.getElementById('btn-cancel-modal-keep')?.addEventListener('click', closeCancelModal);
  document.getElementById('btn-cancel-modal-confirm')?.addEventListener('click', confirmCancelBooking);

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCancelModal();
  });

  // Avatar button routes to profile page
  document.getElementById('header-avatar-btn')?.addEventListener('click', () => {
    window.location.href = ROUTES.profile || 'profile.html';
  });

  // Magnifier button
  document.getElementById('header-search-btn')?.addEventListener('click', () => {
    window.location.href = 'explore.html';
  });
});
