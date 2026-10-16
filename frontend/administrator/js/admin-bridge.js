/**
 * CaféNest – Admin Backend Bridge
 * ─────────────────────────────────────────────────────────────────────────
 * Connects the existing administrator panel pages to the PHP session backend.
 * Load AFTER the existing admin JS files.
 *
 * Add to any admin HTML page:
 *   <script src="js/admin-bridge.js"></script>
 *
 * API_BASE is relative to frontend/administrator/ pages.
 */

'use strict';

const ADMIN_API_BASE = '/backend/api';

/* ── Fetch wrapper ───────────────────────────────────────────────── */
async function adminApi(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== null) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(`${ADMIN_API_BASE}/${endpoint}`, opts);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('[admin-bridge] fetch error:', err);
    return { success: false, message: 'Network error. Is XAMPP running?', data: null };
  }
}

/* ── Auth ─────────────────────────────────────────────────────── */
async function adminLogin(email, password) {
  return adminApi('auth.php?action=login', 'POST', { email, password });
}
async function adminLogout() {
  return adminApi('auth.php?action=logout', 'POST');
}

/* ── Orders ─────────────────────────────────────────────────── */
async function getAllOrdersApi()           { return adminApi('get-order.php'); }
async function updateOrderStatusApi(orderId, status) {
  return adminApi('update-order-status.php', 'POST', { order_id: orderId, status });
}
async function cancelOrderApi(orderId) {
  return adminApi('cancel-order.php', 'POST', { order_id: orderId });
}

/* ── Stats ─────────────────────────────────────────────────── */
async function getDashboardStats()        { return adminApi('admin-stats.php'); }

/* ── Menu ──────────────────────────────────────────────────── */
async function getMenuApi(cafeId = '')    {
  return adminApi(`menu.php${cafeId ? '?cafe_id=' + cafeId + '&include_unavailable=1' : '?include_unavailable=1'}`);
}

/* ── Reviews ─────────────────────────────────────────────── */
async function getAllReviewsApi()         { return adminApi('reviews.php?all=1'); }

/* ═══════════════════════════════════════════════════════════════
   Auto-wire: Admin dashboard stats (index.html)
   Updates existing stat card numbers from live PHP session data.
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* ── Dashboard stats ─────────────────────────────────────── */
  const statCards = document.querySelectorAll('[data-stat]');
  if (statCards.length > 0 || document.querySelector('.dashboard-stats, .stat-card')) {
    const res = await getDashboardStats();
    if (res.success && res.data) {
      const d = res.data;

      const setStatById = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      // Try common IDs used in admin/js/dashboard.js
      setStatById('stat-total-orders',   d.total_orders);
      setStatById('stat-pending',         d.status_counts?.Pending ?? 0);
      setStatById('stat-confirmed',       d.status_counts?.Confirmed ?? 0);
      setStatById('stat-preparing',       d.status_counts?.Preparing ?? 0);
      setStatById('stat-completed',       d.status_counts?.Completed ?? 0);
      setStatById('stat-cancelled',       d.status_counts?.Cancelled ?? 0);
      setStatById('stat-revenue',         '₹' + (d.total_revenue ?? 0));
      setStatById('stat-reviews',         d.total_reviews ?? 0);
      setStatById('stat-avg-rating',      d.average_rating ?? '—');

      // Patch any <span> or <strong> inside .stat-value elements
      document.querySelectorAll('[data-stat]').forEach(el => {
        const key = el.dataset.stat;
        if (key && d[key] !== undefined) el.textContent = d[key];
      });
    }
  }

  /* ── Admin login form (if present on the page) ─────────── */
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = adminLoginForm.querySelector('[name="email"], #admin-email')?.value.trim();
      const password = adminLoginForm.querySelector('[name="password"], #admin-password')?.value;
      if (!email || !password) return;

      const res = await adminLogin(email, password);
      if (res.success) {
        localStorage.setItem('cafenest_admin', JSON.stringify(res.data));
        window.location.href = 'index.html';
      } else {
        const errEl = adminLoginForm.querySelector('.error-msg, #admin-error');
        if (errEl) errEl.textContent = res.message || 'Login failed.';
      }
    }, { capture: true });
  }

  /* ── Logout button ──────────────────────────────────────── */
  const logoutBtn = document.getElementById('admin-logout-btn') ||
                    document.querySelector('[data-action="logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await adminLogout();
      localStorage.removeItem('cafenest_admin');
      window.location.href = '../user/login.html';
    });
  }

});

/* Expose globally */
window.AdminAPI = {
  getAllOrdersApi, updateOrderStatusApi, cancelOrderApi,
  getDashboardStats, getMenuApi, getAllReviewsApi,
  adminLogin, adminLogout,
};
