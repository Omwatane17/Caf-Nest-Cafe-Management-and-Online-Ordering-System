/**
 * CaféNest Administrator — Menu & Prices Page Script
 * Handles: category filter, card rendering, add/edit modal, delete confirmation.
 * Depends on: data.js (ADMIN_MENU_SEED), admin.js (showAdminToast, _escHtml)
 */

/* ── Live in-memory menu items (seeded from data.js) ── */
let menuItems = (typeof ADMIN_MENU_SEED !== 'undefined')
  ? ADMIN_MENU_SEED.map(item => ({ ...item }))
  : [];

/* Next id counter for newly added items */
let _nextId = menuItems.length + 1;

/* Currently selected category filter */
let activeCategory = 'All';

/* id of the item being edited (null = adding new) */
let _editingId = null;

/* id of the item pending delete confirmation */
let _deletingId = null;

/* All category labels (excluding 'All' for item categories) */
const ITEM_CATEGORIES = ['Coffee', 'Tea', 'Snacks', 'Main Course', 'Desserts', 'Beverages'];
const ALL_FILTERS = ['All', ...ITEM_CATEGORIES];

/* ── Utility ── */
function esc(str) {
  /* Reuse admin.js _escHtml if available, else inline */
  if (typeof _escHtml === 'function') return _escHtml(str);
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function genId() {
  return `menu-${String(_nextId++).padStart(3, '0')}`;
}

/* ── Image helper: try assets/<filename>, fallback to placeholder SVG ── */
function buildImageHTML(item) {
  if (item.image) {
    return `<img
      class="menu-card-img"
      src="assets/${esc(item.image)}"
      alt="${esc(item.name)}"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      loading="lazy">
    <div class="menu-img-placeholder" style="display:none;" aria-hidden="true">
      ${_foodPlaceholderSVG()}
    </div>`;
  }
  return `<div class="menu-img-placeholder" aria-hidden="true">${_foodPlaceholderSVG()}</div>`;
}

function _foodPlaceholderSVG() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>`;
}

/* ── Render Category Filter Pills ── */
function renderFilters() {
  const container = document.getElementById('menu-filters');
  if (!container) return;

  container.innerHTML = ALL_FILTERS.map(cat => `
    <button
      type="button"
      class="filter-pill${cat === activeCategory ? ' active' : ''}"
      data-cat="${esc(cat)}"
      aria-pressed="${cat === activeCategory ? 'true' : 'false'}"
      aria-label="Filter by ${esc(cat)}">
      ${esc(cat)}
    </button>`).join('');

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      activeCategory = pill.getAttribute('data-cat');
      renderFilters();
      renderMenuGrid();
    });
  });
}

/* ── Render Menu Card Grid ── */
function renderMenuGrid() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  const filtered = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="menu-empty-state">No menu items in this category.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => buildCardHTML(item)).join('');

  /* Attach toggle switch events */
  grid.querySelectorAll('.avail-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.getAttribute('data-id');
      const entry = menuItems.find(m => m.id === id);
      if (entry) {
        entry.available = checkbox.checked;
        /* Update the visible label without full re-render */
        const label = checkbox.closest('.menu-avail-row')?.querySelector('.avail-label');
        if (label) {
          label.textContent = entry.available ? 'Available' : 'Unavailable';
          label.className = `avail-label${entry.available ? '' : ' unavailable'}`;
        }
      }
    });
  });

  /* Attach Edit and Delete events */
  grid.querySelectorAll('.btn-card-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
  });
  grid.querySelectorAll('.btn-card-delete').forEach(btn => {
    btn.addEventListener('click', () => openDeleteConfirm(btn.getAttribute('data-id')));
  });
}

function buildCardHTML(item) {
  const availChecked = item.available ? 'checked' : '';
  const availLabelText = item.available ? 'Available' : 'Unavailable';
  const availLabelClass = `avail-label${item.available ? '' : ' unavailable'}`;

  return `
    <article class="menu-card" aria-label="${esc(item.name)} menu card">
      <div class="menu-card-body">
        ${buildImageHTML(item)}
        <div class="menu-card-details">
          <div class="menu-card-name">${esc(item.name)}</div>
          <div class="menu-card-desc">${esc(item.description)}</div>
          <div class="menu-card-price">₹${esc(String(item.price))}</div>
          <div class="menu-avail-row">
            <label class="avail-switch" aria-label="Toggle availability for ${esc(item.name)}">
              <input type="checkbox" class="avail-checkbox" ${availChecked} data-id="${esc(item.id)}">
              <span class="avail-track"></span>
            </label>
            <span class="${availLabelClass}">${availLabelText}</span>
          </div>
        </div>
      </div>
      <div class="menu-card-actions">
        <button type="button" class="btn-card-action btn-card-edit" data-id="${esc(item.id)}" aria-label="Edit ${esc(item.name)}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Edit
        </button>
        <button type="button" class="btn-card-action btn-card-delete" data-id="${esc(item.id)}" aria-label="Delete ${esc(item.name)}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          Delete
        </button>
      </div>
    </article>`;
}

/* ── Add / Edit Modal ── */
function openAddModal() {
  _editingId = null;
  _setModalValues({ name: '', category: ITEM_CATEGORIES[0], description: '', price: '', available: true });
  document.getElementById('modal-title').textContent = 'Add Menu Item';
  document.getElementById('btn-modal-save').textContent = 'Save Item';
  _clearModalErrors();
  _showModal('modal-item');
}

function openEditModal(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  _editingId = id;
  _setModalValues(item);
  document.getElementById('modal-title').textContent = 'Edit Menu Item';
  document.getElementById('btn-modal-save').textContent = 'Save Changes';
  _clearModalErrors();
  _showModal('modal-item');
}

function _setModalValues(item) {
  document.getElementById('field-name').value        = item.name || '';
  document.getElementById('field-category').value    = item.category || ITEM_CATEGORIES[0];
  document.getElementById('field-description').value = item.description || '';
  document.getElementById('field-price').value       = item.price !== undefined ? item.price : '';
  document.getElementById('field-available').checked = item.available !== false;
}

function _clearModalErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.form-input.error, .form-select.error, .form-textarea.error')
    .forEach(el => el.classList.remove('error'));
}

function _showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.removeAttribute('hidden');
    /* Focus first focusable element */
    const first = modal.querySelector('input, select, textarea, button');
    if (first) first.focus();
  }
}

function _hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.setAttribute('hidden', '');
}

function _saveModalItem(e) {
  e.preventDefault();
  _clearModalErrors();

  const nameEl  = document.getElementById('field-name');
  const priceEl = document.getElementById('field-price');
  const catEl   = document.getElementById('field-category');
  const descEl  = document.getElementById('field-description');
  const availEl = document.getElementById('field-available');

  let valid = true;

  /* Validate name */
  if (!nameEl.value.trim()) {
    nameEl.classList.add('error');
    const err = document.getElementById('err-name');
    if (err) { err.textContent = 'Item name is required.'; err.classList.add('visible'); }
    valid = false;
  }

  /* Validate price */
  const priceNum = parseFloat(priceEl.value);
  if (!priceEl.value.trim() || isNaN(priceNum) || priceNum < 0) {
    priceEl.classList.add('error');
    const err = document.getElementById('err-price');
    if (err) { err.textContent = 'Enter a valid price (₹0 or more).'; err.classList.add('visible'); }
    valid = false;
  }

  if (!valid) return;

  if (_editingId) {
    /* Edit existing */
    const idx = menuItems.findIndex(m => m.id === _editingId);
    if (idx !== -1) {
      menuItems[idx] = {
        ...menuItems[idx],
        name:        nameEl.value.trim(),
        category:    catEl.value,
        description: descEl.value.trim(),
        price:       Math.round(priceNum),
        available:   availEl.checked
      };
    }
    showAdminToast('Menu item updated.');
  } else {
    /* Add new */
    menuItems.push({
      id:          genId(),
      cafeId:      'cafe-001',
      name:        nameEl.value.trim(),
      category:    catEl.value,
      description: descEl.value.trim(),
      price:       Math.round(priceNum),
      available:   availEl.checked,
      image:       ''
    });
    showAdminToast('Menu item added.');
  }

  _hideModal('modal-item');
  renderMenuGrid();
}

/* ── Delete Confirmation ── */
function openDeleteConfirm(id) {
  _deletingId = id;
  const item = menuItems.find(m => m.id === id);
  const msg = document.getElementById('confirm-msg');
  if (msg && item) {
    msg.textContent = `Are you sure you want to delete "${item.name}"?`;
  }
  _showModal('modal-confirm');
}

function _confirmDelete() {
  if (!_deletingId) return;
  menuItems = menuItems.filter(m => m.id !== _deletingId);
  _deletingId = null;
  _hideModal('modal-confirm');
  renderMenuGrid();
  showAdminToast('Menu item deleted.');
}

/* ── DOM Setup ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Render shared shell with 'menu' active */
  if (typeof renderShell === 'function') renderShell('menu');

  /* Initial renders */
  renderFilters();
  renderMenuGrid();

  /* Add Menu Item button */
  document.getElementById('btn-add-menu')?.addEventListener('click', openAddModal);

  /* Modal form submit */
  document.getElementById('form-menu-item')?.addEventListener('submit', _saveModalItem);

  /* Modal close buttons */
  document.getElementById('btn-modal-close')?.addEventListener('click', () => _hideModal('modal-item'));
  document.getElementById('btn-modal-cancel')?.addEventListener('click', () => _hideModal('modal-item'));

  /* Delete confirm buttons */
  document.getElementById('btn-confirm-cancel')?.addEventListener('click', () => {
    _deletingId = null;
    _hideModal('modal-confirm');
  });
  document.getElementById('btn-confirm-delete')?.addEventListener('click', _confirmDelete);

  /* Close modals on backdrop click */
  document.getElementById('modal-item')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) _hideModal('modal-item');
  });
  document.getElementById('modal-confirm')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) _hideModal('modal-confirm');
  });

  /* Escape key closes any open modal */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      _hideModal('modal-item');
      _hideModal('modal-confirm');
      _deletingId = null;
    }
  });
});
