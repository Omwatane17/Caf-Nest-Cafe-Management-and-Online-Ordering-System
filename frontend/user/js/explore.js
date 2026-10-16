/**
 * CaféNest - Explore Page Logic
 * 
 * Filter Rules & Criteria:
 * 1. Search Query: Matches case-insensitive substring in cafe name, city, or tags.
 * 2. Location: Exact match on cafe city. Non-Amravati selections show the empty state.
 * 3. Cuisine: OR logic across selected categories using CUISINE_MAPPING (if Coffee or Tea is checked, cafe matching either passes).
 * 4. Price: Overlap logic between selected price band and [priceMin, priceMax].
 * 5. Facilities: AND logic (cafe must possess ALL checked facilities).
 * 6. Sorting: Applied after filtering (Popularity, Rating, Distance, Price).
 */

const STORAGE_FAV_PREFIX = 'cafenest_fav_';

// State container
const state = {
  searchQuery: '',
  location: 'Amravati',
  selectedCuisines: [],
  selectedPriceRange: null,
  selectedFacilities: [],
  sortBy: 'popularity'
};

/**
 * Initializes favorite seed states in localStorage
 */
function initFavoritesSeed() {
  CAFES_DATA.forEach(cafe => {
    const key = STORAGE_FAV_PREFIX + cafe.id;
    if (localStorage.getItem(key) === null && cafe.defaultFavorited) {
      try {
        localStorage.setItem(key, 'true');
      } catch (e) {
        console.warn('LocalStorage error setting seed favorite:', e);
      }
    }
  });
}

/**
 * Checks if a cafe is favorited
 * @param {string} id 
 * @returns {boolean}
 */
function isCafeFavorited(id) {
  try {
    return localStorage.getItem(STORAGE_FAV_PREFIX + id) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Toggles a cafe's favorite status in localStorage
 * @param {string} id 
 * @returns {boolean} New favorite state
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
 * Determines whether a cafe satisfies the selected price range radio
 */
function matchesPrice(cafe, priceRange) {
  if (!priceRange) return true;
  switch (priceRange) {
    case 'under-300':
      return cafe.priceMin < 300;
    case '300-600':
      return cafe.priceMin <= 600 && cafe.priceMax >= 300;
    case '600-900':
      return cafe.priceMin <= 900 && cafe.priceMax >= 600;
    case 'above-900':
      return cafe.priceMax > 900;
    default:
      return true;
  }
}

/**
 * Checks if a cafe satisfies selected cuisine filters using OR logic & mapping
 */
function matchesCuisines(cafe, selectedCuisines) {
  if (!selectedCuisines || selectedCuisines.length === 0) return true;

  return selectedCuisines.some(cuisineKey => {
    const mappedTerms = CUISINE_MAPPING[cuisineKey] || [cuisineKey];
    return mappedTerms.some(term => 
      cafe.cuisines.includes(term) || cafe.tags.some(t => t.toLowerCase() === term.toLowerCase())
    );
  });
}

/**
 * Checks if a cafe satisfies all selected facilities using AND logic
 */
function matchesFacilities(cafe, selectedFacilities) {
  if (!selectedFacilities || selectedFacilities.length === 0) return true;
  return selectedFacilities.every(facility => cafe.facilities.includes(facility));
}

/**
 * Applies all filters and sorting algorithms
 * @returns {Array} Filtered and sorted cafe objects
 */
function getFilteredAndSortedCafes() {
  const filtered = CAFES_DATA.filter(cafe => {
    // 1. Location match
    if (state.location && cafe.city.toLowerCase() !== state.location.toLowerCase()) {
      return false;
    }

    // 2. Search query match (name, city, tags)
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const inName = cafe.name.toLowerCase().includes(q);
      const inCity = cafe.city.toLowerCase().includes(q);
      const inTags = cafe.tags.some(tag => tag.toLowerCase().includes(q));
      if (!inName && !inCity && !inTags) return false;
    }

    // 3. Cuisine filter (OR)
    if (!matchesCuisines(cafe, state.selectedCuisines)) {
      return false;
    }

    // 4. Price range filter (overlap)
    if (!matchesPrice(cafe, state.selectedPriceRange)) {
      return false;
    }

    // 5. Facilities filter (AND)
    if (!matchesFacilities(cafe, state.selectedFacilities)) {
      return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'popularity':
        return b.reviewCount - a.reviewCount;
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return a.distanceKm - b.distanceKm;
      case 'price':
        return a.priceMin - b.priceMin;
      default:
        return 0;
    }
  });

  return filtered;
}

/**
 * Renders a single horizontal card template
 */
function renderHorizontalCard(cafe) {
  const isFav = isCafeFavorited(cafe.id);
  const tagPills = cafe.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');

  return `
    <li class="cafe-card-horizontal" data-id="${cafe.id}">
      <div class="card-thumb-wrap">
        <img src="${cafe.image}" 
             alt="${cafe.name} in ${cafe.city}" 
             class="card-thumb-img"
             onerror="this.style.display='none';">
      </div>
      <div class="card-details">
        <h2 class="card-title">
          <a href="cafe-details.html?id=${cafe.id}" style="color: inherit; text-decoration: none;">${cafe.name}</a>
        </h2>
        <div class="card-meta-rating">
          <svg class="star-icon" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>${cafe.rating}</span>
          <span class="card-reviews-count">(${cafe.reviewCountDisplay})</span>
        </div>
        <div class="card-meta-location">
          <svg class="pin-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${cafe.city} &bull; ${cafe.distanceKm} km</span>
        </div>
        <div class="card-tags">
          ${tagPills}
        </div>
      </div>
      <div class="card-actions-col">
        <button type="button" 
                class="btn-heart" 
                data-id="${cafe.id}" 
                aria-label="Save ${cafe.name} to favorites" 
                aria-pressed="${isFav}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <div class="card-price-text">&#8377;${cafe.priceMin} &ndash; &#8377;${cafe.priceMax}</div>
        <a href="cafe-details.html?id=${cafe.id}" class="btn-view-details">View Details</a>
      </div>
    </li>
  `;
}

/**
 * Updates the UI list and aria-live announcements
 */
function updateCardsList() {
  const container = document.getElementById('explore-cafe-list');
  const countLive = document.getElementById('results-count-live');
  if (!container) return;

  const results = getFilteredAndSortedCafes();

  // Screen reader notification
  if (countLive) {
    countLive.textContent = `${results.length} cafe${results.length === 1 ? '' : 's'} found`;
  }

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state" role="status">
        <h3 class="empty-state-title">No cafes match your filters</h3>
        <p class="empty-state-text">Try adjusting your search keywords, location or selected facilities.</p>
        <button type="button" class="btn-empty-clear" id="btn-empty-clear">Clear all filters</button>
      </div>
    `;

    document.getElementById('btn-empty-clear')?.addEventListener('click', clearAllFilters);
    return;
  }

  container.innerHTML = results.map(renderHorizontalCard).join('');

  // Re-attach favorite event listeners
  container.querySelectorAll('.btn-heart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const newState = toggleFavorite(id);
      btn.setAttribute('aria-pressed', String(newState));
      showToast(newState ? 'Saved to favorites' : 'Removed from favorites');
    });
  });
}

/**
 * Resets all filters back to default
 */
function clearAllFilters() {
  state.searchQuery = '';
  state.location = 'Amravati';
  state.selectedCuisines = [];
  state.selectedPriceRange = null;
  state.selectedFacilities = [];
  state.sortBy = 'popularity';

  const searchInput = document.getElementById('explore-search-input');
  if (searchInput) searchInput.value = '';

  const locationSelect = document.getElementById('sidebar-location-select');
  if (locationSelect) locationSelect.value = 'Amravati';

  const sortSelect = document.getElementById('explore-sort-select');
  if (sortSelect) sortSelect.value = 'popularity';

  document.querySelectorAll('input[name="cuisine"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="price"]').forEach(rb => rb.checked = false);
  document.querySelectorAll('input[name="facility"]').forEach(cb => cb.checked = false);

  updateCardsList();
  showToast('Filters cleared');
}

/**
 * Parses query parameters from URL on initial page load
 */
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const city = params.get('city');

  if (q) {
    state.searchQuery = q;
    const searchInput = document.getElementById('explore-search-input');
    if (searchInput) searchInput.value = q;
  }

  if (city) {
    state.location = city;
    const locationSelect = document.getElementById('sidebar-location-select');
    if (locationSelect) locationSelect.value = city;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initFavoritesSeed();
  parseUrlParams();

  // Magnifier button in header focuses the page search input
  const headerSearchBtn = document.getElementById('header-search-btn');
  const searchInput = document.getElementById('explore-search-input');
  if (headerSearchBtn && searchInput) {
    headerSearchBtn.addEventListener('click', () => {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput.focus();
    });
  }

  // Avatar button routes to profile page
  document.getElementById('header-avatar-btn')?.addEventListener('click', () => {
    window.location.href = ROUTES.profile || 'profile.html';
  });

  // Search input live filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      updateCardsList();
    });
  }

  // Location select
  const locationSelect = document.getElementById('sidebar-location-select');
  if (locationSelect) {
    locationSelect.addEventListener('change', (e) => {
      state.location = e.target.value;
      updateCardsList();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('explore-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      updateCardsList();
    });
  }

  // Cuisine checkboxes
  document.querySelectorAll('input[name="cuisine"]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.selectedCuisines = Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(el => el.value);
      updateCardsList();
    });
  });

  // Price range radio buttons
  document.querySelectorAll('input[name="price"]').forEach(rb => {
    rb.addEventListener('change', (e) => {
      state.selectedPriceRange = e.target.checked ? e.target.value : null;
      updateCardsList();
    });
  });

  // Facility checkboxes
  document.querySelectorAll('input[name="facility"]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.selectedFacilities = Array.from(document.querySelectorAll('input[name="facility"]:checked')).map(el => el.value);
      updateCardsList();
    });
  });

  // Clear filters link
  document.getElementById('btn-clear-filters')?.addEventListener('click', clearAllFilters);

  // Initial render
  updateCardsList();
});
