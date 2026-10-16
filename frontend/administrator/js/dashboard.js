/**
 * CaféNest Administrator — Dashboard Page Script
 * Renders: welcome banner, stat cards, reservations table, recent activity list.
 */

/* ── Icon SVGs keyed by iconKey ─────────────────────────────────────────── */
const STAT_ICONS = {
  reservations: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`,
  tables: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
  </svg>`,
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>`,
  revenue: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>`
};

/* Activity icons keyed by type */
const ACTIVITY_ICONS = {
  reservation: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`,
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>`,
  table: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
  </svg>`,
  review: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`
};

/* ── Trend arrow rendering ───────────────────────────────────────────────── */
function renderTrend(trend) {
  if (trend.direction === 'up') {
    return `<span class="stat-trend positive" aria-label="Trending up: ${trend.text}">
              <span class="trend-arrow" aria-hidden="true">↑</span>
              <span>${_escHtml(trend.text)}</span>
            </span>`;
  } else if (trend.direction === 'down') {
    return `<span class="stat-trend negative" aria-label="Trending down: ${trend.text}">
              <span class="trend-arrow" aria-hidden="true">↓</span>
              <span>${_escHtml(trend.text)}</span>
            </span>`;
  } else {
    return `<span class="stat-trend neutral" aria-label="${trend.text}">
              <span>${_escHtml(trend.text)}</span>
            </span>`;
  }
}

/* ── Render Welcome Banner ───────────────────────────────────────────────── */
function renderWelcomeBanner(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  /* Use banner.jpg if it exists; CSS gradient placeholder is shown automatically
     via onerror. We cannot detect file existence with vanilla JS, so use onerror. */
  mount.innerHTML = `
    <section class="welcome-banner" aria-label="Welcome">
      <div class="banner-text">
        <h1 class="banner-heading">Welcome Back, Cafe Owner!</h1>
        <p class="banner-sub">Here's what's happening at your cafe today.</p>
      </div>
      <div class="banner-img-wrap" aria-hidden="true">
        <img
          src="assets/banner.jpg"
          alt=""
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >
        <div class="banner-img-placeholder" style="display:none;"></div>
      </div>
    </section>`;
}

/* ── Render Stat Cards ───────────────────────────────────────────────────── */
function renderStatCards(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount || typeof ADMIN_DASHBOARD_STATS === 'undefined') return;

  mount.innerHTML = `
    <div class="stat-cards-row" role="list" aria-label="Dashboard statistics">
      ${ADMIN_DASHBOARD_STATS.map(stat => `
        <article class="stat-card" role="listitem" aria-label="${_escHtml(stat.label)}: ${_escHtml(stat.value)}">
          <div class="stat-card-top">
            <div class="stat-icon-circle ${stat.iconColor}" aria-hidden="true">
              ${STAT_ICONS[stat.iconKey] || ''}
            </div>
            <span class="stat-label">${_escHtml(stat.label)}</span>
          </div>
          <div class="stat-value">${_escHtml(stat.value)}</div>
          ${renderTrend(stat.trend)}
        </article>
      `).join('')}
    </div>`;
}

/* ── Render Upcoming Reservations Table ─────────────────────────────────── */
function renderReservationsCard(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const reservations = typeof ADMIN_RESERVATIONS !== 'undefined' ? ADMIN_RESERVATIONS : [];

  /* "View All ›" navigates to reservations page (or toast if not built) */
  const viewAllHref = ADMIN_ROUTES.reservations || '#';
  const viewAllOnClick = ADMIN_ROUTES.reservations
    ? ''
    : `onclick="event.preventDefault(); showAdminToast('This section isn\\'t built yet (demo)');"`;

  const tableBody = reservations.length === 0
    ? `<tr><td colspan="5" class="table-empty-state">No upcoming reservations</td></tr>`
    : reservations.map(r => `
        <tr>
          <td>${_escHtml(r.time)}</td>
          <td>${_escHtml(r.customerName)}</td>
          <td>${_escHtml(r.tableId)}</td>
          <td>${_escHtml(String(r.guests))}</td>
          <td><span class="status-badge ${r.status.toLowerCase()}">${_escHtml(r.status)}</span></td>
        </tr>`).join('');

  mount.innerHTML = `
    <section class="lower-card" aria-labelledby="reservations-heading">
      <div class="lower-card-header">
        <h2 class="lower-card-title" id="reservations-heading">Upcoming Reservations</h2>
        <a href="${viewAllHref}" class="view-all-link" ${viewAllOnClick} aria-label="View all reservations">View All ›</a>
      </div>
      <div class="reservations-table-wrap">
        <table class="reservations-table" aria-label="Upcoming reservations">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Customer</th>
              <th scope="col">Table</th>
              <th scope="col">Guests</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>${tableBody}</tbody>
        </table>
      </div>
    </section>`;
}

/* ── Render Recent Activity ─────────────────────────────────────────────── */
function renderActivityCard(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const activities = typeof ADMIN_ACTIVITIES !== 'undefined' ? ADMIN_ACTIVITIES : [];

  const listItems = activities.length === 0
    ? `<li class="table-empty-state">No recent activity</li>`
    : activities.map(act => `
        <li class="activity-item">
          <div class="activity-icon ${act.iconStyle}" aria-hidden="true">
            ${ACTIVITY_ICONS[act.type] || ''}
          </div>
          <div class="activity-body">
            <div class="activity-title">${_escHtml(act.title)}</div>
            ${act.detail ? `<div class="activity-detail">(${_escHtml(act.detail)})</div>` : ''}
          </div>
          <time class="activity-time" datetime="">${_escHtml(act.time)}</time>
        </li>`).join('');

  mount.innerHTML = `
    <section class="lower-card" aria-labelledby="activity-heading">
      <div class="lower-card-header">
        <h2 class="lower-card-title" id="activity-heading">Recent Activity</h2>
      </div>
      <ul class="activity-list" aria-label="Recent activity">
        ${listItems}
      </ul>
    </section>`;
}

/* ── Utility ─────────────────────────────────────────────────────────────── */
function _escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Render shell with 'dashboard' as the active key */
  if (typeof renderShell === 'function') renderShell('dashboard');

  /* Render page sections */
  renderWelcomeBanner('mount-banner');
  renderStatCards('mount-stats');

  /* Lower section — two side-by-side cards */
  renderReservationsCard('mount-reservations');
  renderActivityCard('mount-activity');
});
