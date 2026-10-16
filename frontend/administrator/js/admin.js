/**
 * CaféNest Administrator — Shell Script
 * Provides: ADMIN_ROUTES, renderShell(), showAdminToast(), sidebar toggle, bell, logout.
 * Call renderShell(activePageKey) before page-specific code runs.
 */

/* ── Routes ─────────────────────────────────────────────────────────────── */
const ADMIN_ROUTES = {
  dashboard:    'index.html',
  menu:         'menu.html',       /* Menu & Prices page */
  seating:      'seating.html',
  reservations: 'reservations.html',
  tableStatus:  'table-status.html',
  reviews:      'reviews.html'
};

/* ── Sidebar Nav Definition ─────────────────────────────────────────────── */
const ADMIN_NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
             <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
             <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
           </svg>`
  },
  {
    key: 'menu',
    label: 'Menu & Prices',
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
             <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
             <rect x="9" y="3" width="6" height="4" rx="1"/>
             <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
           </svg>`
  },
  {
    key: 'seating',
    label: 'Seating Arrangement',
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
             <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/>
             <path d="M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z"/>
             <line x1="8" y1="15" x2="8" y2="20"/><line x1="16" y1="15" x2="16" y2="20"/>
           </svg>`
  },
  {
    key: 'reservations',
    label: 'Reservations',
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
             <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
             <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
             <line x1="3" y1="10" x2="21" y2="10"/>
           </svg>`
  },
  {
    key: 'tableStatus',
    label: 'Table Status',
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
             <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
           </svg>`
  },
  {
    key: 'reviews',
    label: 'Reviews',
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true">
             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
           </svg>`
  }
];

/* ── Sidebar state (desktop expand/collapse) ────────────────────────────── */
const SIDEBAR_STORAGE_KEY = 'cafenest_admin_sidebar';
let _sidebarEl = null;
let _backdropEl = null;
let _isMobile = () => window.innerWidth < 768;

function _loadSidebarState() {
  /* On desktop only; mobile always uses drawer */
  if (_isMobile()) return;
  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved === 'collapsed') {
      _sidebarEl.classList.add('collapsed');
    }
  } catch (_) {}
}

function _saveSidebarState(collapsed) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? 'collapsed' : 'expanded');
  } catch (_) {}
}

function toggleSidebar() {
  if (_isMobile()) {
    /* Drawer mode */
    const isOpen = _sidebarEl.classList.contains('drawer-open');
    if (isOpen) {
      _closeDrawer();
    } else {
      _openDrawer();
    }
  } else {
    /* Desktop collapse / expand */
    const isCollapsed = _sidebarEl.classList.contains('collapsed');
    _sidebarEl.classList.toggle('collapsed', !isCollapsed);
    _saveSidebarState(!isCollapsed);
  }
}

function _openDrawer() {
  _sidebarEl.classList.add('drawer-open');
  _backdropEl.classList.add('visible');
  _backdropEl.removeAttribute('hidden');
  /* Move focus to first nav item */
  const firstNav = _sidebarEl.querySelector('.nav-item');
  if (firstNav) firstNav.focus();
}

function _closeDrawer() {
  _sidebarEl.classList.remove('drawer-open');
  _backdropEl.classList.remove('visible');
  /* Return focus to hamburger */
  const ham = document.getElementById('btn-hamburger');
  if (ham) ham.focus();
}

/* ── Toast ──────────────────────────────────────────────────────────────── */
function showAdminToast(message) {
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.className = 'admin-toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  container.innerHTML = '';
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ── Reset demo data ────────────────────────────────────────────────────── */
function resetAdminDemoData() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('cafenest_admin_'))
      .forEach(k => localStorage.removeItem(k));
  } catch (_) {}
  showAdminToast('Demo data reset.');
}

/* ── Sidebar HTML builder ────────────────────────────────────────────────── */
function _buildSidebarHTML(activeKey) {
  const navItems = ADMIN_NAV_ITEMS.map(item => {
    const isActive = item.key === activeKey;
    return `
      <button
        type="button"
        class="nav-item${isActive ? ' active' : ''}"
        data-route="${item.key}"
        ${isActive ? 'aria-current="page"' : ''}
        aria-label="${item.label}"
        tabindex="0">
        ${item.icon}
        <span class="nav-label">${item.label}</span>
      </button>`;
  }).join('');

  return `
    <!-- Brand -->
    <div class="sidebar-brand" aria-label="CafeNest Admin">
      <div class="brand-icon-wrap">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="2" x2="6" y2="5"/>
          <line x1="10" y1="2" x2="10" y2="5"/>
          <line x1="14" y1="2" x2="14" y2="5"/>
        </svg>
      </div>
      <div class="brand-text-wrap">
        <div class="brand-name">CafeNest</div>
        <div class="brand-sub">The Brew House</div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav" aria-label="Admin navigation">
      ${navItems}
    </nav>

    <!-- Footer: owner + logout -->
    <div class="sidebar-footer">
      <div class="sidebar-owner-row">
        <div class="owner-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="sidebar-footer-info">
          <div class="owner-name">Cafe Owner</div>
          <div class="owner-email">owner@cafenest.com</div>
        </div>
      </div>

      <button type="button" class="nav-item logout-item" id="btn-logout" aria-label="Logout">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span class="nav-label">Logout</span>
      </button>

      <button type="button" class="sidebar-footer-reset" id="btn-reset-demo" aria-label="Reset demo data">
        Reset demo data
      </button>
    </div>`;
}

/* ── Top-bar HTML builder ────────────────────────────────────────────────── */
function _buildTopbarHTML() {
  /* Format today's date like "Tue, 13 Oct 2026" using en-IN locale */
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  /* en-IN produces "Tue, 13 Oct 2026" style */

  return `
    <div class="topbar-left">
      <button type="button" class="btn-hamburger" id="btn-hamburger" aria-label="Toggle sidebar" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="topbar-right">
      <span class="topbar-date" aria-label="Today's date">${dateStr}</span>

      <div style="position:relative;">
        <button type="button" class="btn-bell" id="btn-bell" aria-label="Notifications" aria-expanded="false" aria-haspopup="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="bell-dot" id="bell-dot" aria-hidden="true"></span>
        </button>

        <div class="bell-dropdown" id="bell-dropdown" hidden role="menu" aria-label="Notifications">
          <div class="bell-dropdown-header">Notifications</div>
          <ul class="bell-dropdown-list" id="bell-notif-list"></ul>
        </div>
      </div>

      <span class="demo-badge" aria-label="Demo prototype">Demo prototype</span>
    </div>`;
}

/* ── Main renderShell() ─────────────────────────────────────────────────── */
/**
 * Renders the sidebar and top-bar into the page.
 * Call from each admin page before page-specific code.
 * @param {string} activeKey  – key from ADMIN_NAV_ITEMS (e.g. 'dashboard')
 */
function renderShell(activeKey) {
  const sidebar = document.getElementById('admin-sidebar');
  const topbar  = document.getElementById('admin-topbar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (!sidebar || !topbar) {
    console.error('renderShell: #admin-sidebar or #admin-topbar not found in DOM.');
    return;
  }

  _sidebarEl  = sidebar;
  _backdropEl = backdrop;

  sidebar.innerHTML = _buildSidebarHTML(activeKey);
  topbar.innerHTML  = _buildTopbarHTML();

  /* Load persisted sidebar state */
  _loadSidebarState();

  /* ── Event listeners ── */

  /* Hamburger */
  document.getElementById('btn-hamburger')?.addEventListener('click', () => {
    toggleSidebar();
    /* Update aria-expanded on hamburger */
    const ham = document.getElementById('btn-hamburger');
    const isOpen = _sidebarEl.classList.contains('drawer-open') || !_sidebarEl.classList.contains('collapsed');
    ham?.setAttribute('aria-expanded', String(!_sidebarEl.classList.contains('collapsed') || _sidebarEl.classList.contains('drawer-open')));
  });

  /* Backdrop click closes drawer */
  backdrop?.addEventListener('click', _closeDrawer);

  /* Escape key: close drawer or bell dropdown */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (_isMobile() && _sidebarEl.classList.contains('drawer-open')) {
        _closeDrawer();
      }
      const bellDrop = document.getElementById('bell-dropdown');
      if (bellDrop && !bellDrop.hidden) {
        _closeBell();
      }
    }
  });

  /* Sidebar nav clicks */
  sidebar.querySelectorAll('.nav-item[data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-route');
      const target = ADMIN_ROUTES[key];
      if (target) {
        window.location.href = target;
      } else {
        showAdminToast("This section isn't built yet (demo)");
      }
    });
  });

  /* Logout */
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    showAdminToast('Logging out… (demo)');
    setTimeout(() => { window.location.href = '../user/index.html'; }, 1500);
  });

  /* Reset demo data */
  document.getElementById('btn-reset-demo')?.addEventListener('click', resetAdminDemoData);

  /* Bell */
  document.getElementById('btn-bell')?.addEventListener('click', _toggleBell);

  /* Close bell on outside click */
  document.addEventListener('click', (e) => {
    const bellBtn  = document.getElementById('btn-bell');
    const bellDrop = document.getElementById('bell-dropdown');
    if (bellDrop && !bellDrop.hidden && !bellBtn?.contains(e.target) && !bellDrop.contains(e.target)) {
      _closeBell();
    }
  });

  /* Populate bell dropdown from ADMIN_ACTIVITIES */
  _populateBell();
}

/* ── Bell helpers ────────────────────────────────────────────────────────── */
function _populateBell() {
  const list = document.getElementById('bell-notif-list');
  if (!list || typeof ADMIN_ACTIVITIES === 'undefined') return;
  list.innerHTML = ADMIN_ACTIVITIES.map(act => `
    <li>
      <div class="bell-notif-item" role="menuitem">
        <span class="bell-notif-title">${_escHtml(act.title)}</span>
        <span class="bell-notif-time">${_escHtml(act.time)}</span>
      </div>
    </li>
  `).join('');
}

function _toggleBell() {
  const drop = document.getElementById('bell-dropdown');
  const btn  = document.getElementById('btn-bell');
  if (!drop) return;
  const willOpen = drop.hidden;
  drop.hidden = !willOpen;
  btn?.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) {
    /* Remove red dot when notifications are viewed */
    const dot = document.getElementById('bell-dot');
    if (dot) dot.classList.add('hidden');
  }
}

function _closeBell() {
  const drop = document.getElementById('bell-dropdown');
  const btn  = document.getElementById('btn-bell');
  if (drop) drop.hidden = true;
  btn?.setAttribute('aria-expanded', 'false');
  btn?.focus();
}

/* ── Utility ─────────────────────────────────────────────────────────────── */
function _escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
