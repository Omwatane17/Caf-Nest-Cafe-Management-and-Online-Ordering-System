/**
 * CaféNest - Cafe Details Page Logic
 */

const STORAGE_FAV_PREFIX = 'cafenest_fav_';

// State container
let currentCafe = null;
let currentCategory = 'all';

/**
 * Resolves which cafe to show based on URL query param ?id=<cafeId>
 */
function resolveCurrentCafe() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (id) {
    const found = CAFES_DATA.find(c => c.id === id);
    if (found) return found;
  }

  // Default to The Brew House as shown in cafe details.png
  return CAFES_DATA[0];
}

/**
 * Checks if a cafe is favorited
 */
function isCafeFavorited(id) {
  try {
    return localStorage.getItem(STORAGE_FAV_PREFIX + id) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Toggles a cafe's favorite status
 */
function toggleFavorite(id) {
  const key = STORAGE_FAV_PREFIX + id;
  const currentlyFav = isCafeFavorited(id);
  const nextState = !currentlyFav;
  try {
    if (nextState) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  return nextState;
}

/**
 * Populates hero banner with current cafe details
 */
function renderHero(cafe) {
  const titleEl = document.getElementById('details-cafe-name');
  const ratingEl = document.getElementById('details-rating');
  const reviewsEl = document.getElementById('details-reviews');
  const cityEl = document.getElementById('details-city');
  const distEl = document.getElementById('details-dist');
  const tagsContainer = document.getElementById('details-tags-container');
  const heartBtn = document.getElementById('details-hero-heart');
  const bookBtn = document.getElementById('details-book-btn');

  if (titleEl) titleEl.textContent = cafe.name;
  if (ratingEl) ratingEl.textContent = cafe.rating;
  if (reviewsEl) reviewsEl.textContent = `(${cafe.reviewCountDisplay})`;
  if (cityEl) cityEl.textContent = cafe.city;
  if (distEl) distEl.textContent = `${cafe.distanceKm} km`;

  if (tagsContainer) {
    tagsContainer.innerHTML = cafe.tags
      .map(t => `<span class="hero-tag-pill">${t}</span>`)
      .join('');
  }

  if (heartBtn) {
    const isFav = isCafeFavorited(cafe.id);
    heartBtn.setAttribute('aria-pressed', String(isFav));
    heartBtn.setAttribute('data-id', cafe.id);
  }

  if (bookBtn) {
    bookBtn.setAttribute('data-cafe-id', cafe.id);
  }
}

/**
 * SVG Icon helper for Menu Categories
 */
function getCategoryIconSvg(iconType) {
  switch (iconType) {
    case 'grid':
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
    case 'coffee':
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>`;
    case 'cup':
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"></path></svg>`;
    case 'snack':
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 3a9 9 0 0 0 9 9"></path></svg>`;
    case 'breakfast':
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a4 4 0 0 0 0-8z"></path></svg>`;
    case 'cake':
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><line x1="2" y1="21" x2="22" y2="21"></line></svg>`;
    case 'glass':
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><path d="M8 2h8l-2 16a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2L8 2z"></path><line x1="6" y1="6" x2="18" y2="6"></line></svg>`;
    default:
      return `<svg class="menu-cat-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }
}

/**
 * Renders category sidebar buttons and marks disabled if cafe has no items in that category
 */
function renderMenuCategories(cafe) {
  const container = document.getElementById('menu-categories-list');
  if (!container) return;

  const cafeItems = MENU_ITEMS.filter(item => item.cafeId === cafe.id);

  container.innerHTML = MENU_CATEGORIES.map(cat => {
    let count = 0;
    if (cat.id === 'all') {
      count = cafeItems.length;
    } else {
      count = cafeItems.filter(item => item.categoryId === cat.id).length;
    }

    const hasItems = count > 0;
    const isCurrent = currentCategory === cat.id;

    return `
      <button type="button" 
              class="menu-cat-btn ${!hasItems ? 'disabled' : ''}" 
              data-category-id="${cat.id}"
              aria-current="${isCurrent ? 'true' : 'false'}"
              ${!hasItems ? 'disabled' : ''}>
        ${getCategoryIconSvg(cat.icon)}
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.menu-cat-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-category-id');
      container.querySelectorAll('.menu-cat-btn').forEach(b => b.setAttribute('aria-current', 'false'));
      btn.setAttribute('aria-current', 'true');
      renderMenuItems(currentCafe, currentCategory);
    });
  });
}

/**
 * Renders menu item rows in the scrollable right pane
 */
function renderMenuItems(cafe, categoryId) {
  const listEl = document.getElementById('menu-items-list');
  if (!listEl) return;

  let items = MENU_ITEMS.filter(item => item.cafeId === cafe.id);
  if (categoryId !== 'all') {
    items = items.filter(item => item.categoryId === categoryId);
  }

  if (items.length === 0) {
    listEl.innerHTML = `
      <li style="padding: 32px 0; text-align: center; color: var(--color-muted);">
        No items listed under this category for this cafe.
      </li>
    `;
    return;
  }

  listEl.innerHTML = items.map(item => `
    <li class="menu-item-row" data-id="${item.id}">
      <div class="menu-item-left">
        <div class="menu-item-thumb">
          <img src="${item.image}" 
               alt="${item.name}" 
               class="menu-item-img"
               onerror="this.style.display='none';">
        </div>
        <div class="menu-item-info">
          <h3 class="menu-item-name">${item.name}</h3>
          <p class="menu-item-desc">${item.description}</p>
          <span class="menu-item-price">&#8377;${item.price}</span>
        </div>
      </div>
      <button type="button" class="btn-add-item" data-item-id="${item.id}" data-item-name="${item.name}">
        Add +
      </button>
    </li>
  `).join('');

  listEl.querySelectorAll('.btn-add-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-item-name');
      showToast(`Added "${name}" to your order (demo)`);
    });
  });
}

/**
 * Sets up accessible tab switching with arrow key navigation
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('[role="tab"]');
  const tabPanels = document.querySelectorAll('[role="tabpanel"]');

  tabButtons.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('aria-controls');
      const isSeating = tab.id === 'tab-seating';

      if (isSeating) {
        navigateOrToast('seating', null, `?id=${currentCafe.id}`);
        return;
      }

      // Deactivate all
      tabButtons.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      // Activate clicked
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      document.getElementById(targetId)?.classList.add('active');
    });

    // Arrow keys navigation
    tab.addEventListener('keydown', (e) => {
      let nextIndex = null;
      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        tabButtons[nextIndex].focus();
        tabButtons[nextIndex].click();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  currentCafe = resolveCurrentCafe();

  // Render hero and menu sections
  renderHero(currentCafe);
  renderMenuCategories(currentCafe);
  renderMenuItems(currentCafe, 'all');
  initTabs();

  // Hero Heart button listener
  const heroHeartBtn = document.getElementById('details-hero-heart');
  if (heroHeartBtn) {
    heroHeartBtn.addEventListener('click', () => {
      const newState = toggleFavorite(currentCafe.id);
      heroHeartBtn.setAttribute('aria-pressed', String(newState));
      showToast(newState ? 'Saved to favorites' : 'Removed from favorites');
    });
  }

  // Book a Table CTA listener
  const bookBtn = document.getElementById('details-book-btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      navigateOrToast('seating', e, `?id=${currentCafe.id}`);
    });
  }
});
