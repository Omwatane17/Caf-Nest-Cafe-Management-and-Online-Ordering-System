/**
 * CaféNest - Shared Script & Routes Map
 */

const ROUTES = {
  home: 'index.html',
  explore: 'explore.html',
  cafeDetails: 'cafe-details.html',
  seating: 'seating.html',
  bookingForm: 'booking-form.html',
  bookings: 'bookings.html',
  myBookings: 'bookings.html',
  profile: 'profile.html',
  login: 'login.html',
  viewAll: 'explore.html'
};

/**
 * Shared Toast notification handler
 * @param {string} message
 */
function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  toastContainer.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.textContent = message;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

/**
 * Shared Safe navigation handler
 */
function navigateOrToast(routeKey, e, queryParams = '') {
  if (e) e.preventDefault();

  const target = ROUTES[routeKey];
  if (target) {
    window.location.href = target + (queryParams ? queryParams : '');
    return;
  }

  showToast("This screen isn't built yet (demo)");
}

/**
 * Injects shared footer markup into any element with id="site-footer-mount"
 */
function renderSharedFooter() {
  const mount = document.getElementById('site-footer-mount');
  if (!mount) return;

  // Determine active page for footer aria-current
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function footerLink(href, label) {
    const isCurrent = (currentPage === href);
    return `<a href="${href}" class="footer-link${isCurrent ? ' active' : ''}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a>`;
  }

  mount.innerHTML = `
    <footer class="site-footer" role="contentinfo">
      <div class="container footer-container">
        <div class="footer-brand-col">
          <a href="index.html" class="brand" aria-label="CaféNest Home">
            <svg class="brand-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="5" />
              <line x1="10" y1="2" x2="10" y2="5" />
              <line x1="14" y1="2" x2="14" y2="5" />
            </svg>
            <div class="brand-text">
              <span class="brand-title">CaféNest</span>
            </div>
          </a>
          <p class="footer-desc">Your cozy digital companion to discover, reserve, and enjoy the finest coffee spots across the city.</p>
        </div>
        <div class="footer-links-col">
          <h4 class="footer-heading">Quick Links</h4>
          <nav class="footer-nav" aria-label="Footer Navigation">
            ${footerLink('index.html', 'Home')}
            ${footerLink('explore.html', 'Explore Cafes')}
            ${footerLink('bookings.html', 'My Bookings')}
            ${footerLink('profile.html', 'My Profile')}
            ${footerLink('login.html', 'Login / Sign Up')}
          </nav>
        </div>
        <div class="footer-links-col">
          <h4 class="footer-heading">For Cafe Owners</h4>
          <nav class="footer-nav" aria-label="Admin Navigation">
            <a href="../administrator/index.html" class="footer-link">Cafe Owner Login</a>
          </nav>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container footer-bottom-container">
          <p class="footer-copy">&copy; 2026 CaféNest. All rights reserved.</p>
          <span class="demo-badge">Demo prototype, frontend only</span>
        </div>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  // Mount shared footer if present
  renderSharedFooter();

  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('open');
      if (!isExpanded) {
        mainNav.querySelector('a')?.focus();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.focus();
      }
    });
  }

  // Bind demo navigation handlers
  document.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', (e) => {
      const routeKey = el.getAttribute('data-route');
      const cafeId = el.getAttribute('data-cafe-id');
      const queryParams = cafeId ? `?id=${cafeId}` : '';
      navigateOrToast(routeKey, e, queryParams);
    });
  });

  // Home search form submit redirects to explore.html?q=...&city=...
  const heroSearchForm = document.getElementById('hero-search-form');
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('hero-search-input');
      const locationSelect = document.getElementById('hero-location-select');
      const query = searchInput ? searchInput.value.trim() : '';
      const city = locationSelect ? locationSelect.value : 'Amravati';

      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (city) params.set('city', city);

      window.location.href = `explore.html?${params.toString()}`;
    });
  }
});
