/**
 * CaféNest – Backend API Bridge
 * ─────────────────────────────────────────────────────────────────────────
 * This is the ONLY new JavaScript file added to the user frontend.
 * It connects existing frontend UI elements to the PHP session backend.
 *
 * Load order in any page that needs backend connectivity:
 *   <script src="js/api-bridge.js"></script>
 *
 * The backend base path is relative to frontend/user/ pages.
 * Adjust API_BASE if you move files.
 */

'use strict';

const API_BASE = '/backend/api';

/* ═══════════════════════════════════════════════════════════════════════
   1.  Generic fetch wrapper
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Perform a fetch to a backend endpoint and return the parsed JSON.
 * Always sends credentials (session cookie).
 *
 * @param {string} endpoint  e.g. 'cart.php?action=add'
 * @param {string} method    'GET' | 'POST' (default 'GET')
 * @param {object|null} body JSON body for POST requests
 * @returns {Promise<object>}  Backend JSON response { success, message, data }
 */
async function apiCall(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== null) opts.body = JSON.stringify(body);

  try {
    const res  = await fetch(`${API_BASE}/${endpoint}`, opts);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('[api-bridge] fetch error:', err);
    return { success: false, message: 'Network error. Is XAMPP running?', data: null };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   2.  Auth helpers (login.html integration)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Register a new customer account.
 */
async function registerCustomer(name, email, password, phone) {
  return apiCall('auth.php?action=register', 'POST', { name, email, password, phone });
}

/**
 * Log in (customer or admin).
 */
async function loginUser(email, password) {
  return apiCall('auth.php?action=login', 'POST', { email, password });
}

/**
 * Log out.
 */
async function logoutUser() {
  return apiCall('auth.php?action=logout', 'POST');
}

/**
 * Get current logged-in user (returns null in data if not logged in).
 */
async function getCurrentUserApi() {
  return apiCall('auth.php?action=me');
}

/* ═══════════════════════════════════════════════════════════════════════
   3.  Cart helpers
   ═══════════════════════════════════════════════════════════════════════ */

async function getCart()              { return apiCall('cart.php'); }
async function addToCart(itemId, qty) { return apiCall('cart.php?action=add',    'POST', { item_id: itemId, qty }); }
async function updateCart(itemId, qty){ return apiCall('cart.php?action=update', 'POST', { item_id: itemId, qty }); }
async function removeFromCart(itemId) { return apiCall('cart.php?action=remove', 'POST', { item_id: itemId }); }
async function clearCart()            { return apiCall('cart.php?action=clear',  'POST'); }

/* ═══════════════════════════════════════════════════════════════════════
   4.  Menu helpers
   ═══════════════════════════════════════════════════════════════════════ */

async function fetchMenu(cafeId = '', category = '') {
  let qs = '';
  if (cafeId)   qs += `&cafe_id=${encodeURIComponent(cafeId)}`;
  if (category) qs += `&category=${encodeURIComponent(category)}`;
  return apiCall(`menu.php?${qs}`);
}

/* ═══════════════════════════════════════════════════════════════════════
   5.  Order helpers
   ═══════════════════════════════════════════════════════════════════════ */

async function placeOrder(customerDetails, paymentMethod = 'cash', couponCode = '') {
  return apiCall('create-order.php', 'POST', {
    ...customerDetails,
    payment_method: paymentMethod,
    coupon_code:    couponCode,
  });
}

async function getOrder(orderId)   { return apiCall(`get-order.php?order_id=${encodeURIComponent(orderId)}`); }
async function getMyOrders()       { return apiCall('get-order.php?my=1'); }
async function cancelOrder(orderId){ return apiCall('cancel-order.php', 'POST', { order_id: orderId }); }

/* ═══════════════════════════════════════════════════════════════════════
   6.  Coupon helpers
   ═══════════════════════════════════════════════════════════════════════ */

async function applyCouponCode(code) {
  return apiCall('apply-coupon.php', 'POST', { coupon_code: code });
}

/* ═══════════════════════════════════════════════════════════════════════
   7.  Review helpers
   ═══════════════════════════════════════════════════════════════════════ */

async function submitReview(orderId, rating, comment) {
  return apiCall('reviews.php', 'POST', { order_id: orderId, rating, comment });
}

async function getMyReviews() { return apiCall('reviews.php'); }

/* ═══════════════════════════════════════════════════════════════════════
   8.  Auto-connect: login.html form
       Patches the existing login.js submit handler to call the real API.
   ═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // Helper — uses the toast defined in login.js or falls back
  function showMsg(msg, isError) {
    if (typeof window._loginToast === 'function') {
      window._loginToast(msg, isError);
    } else {
      const toast = document.getElementById('login-toast');
      if (toast) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3400); }
    }
  }

  /* ── Login form (login.html) ──────────────────────────────── */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // prevent login.js duplicate
      const btn = loginForm.querySelector('button[type="submit"]');
      const email    = loginForm.querySelector('#login-email')?.value.trim();
      const password = loginForm.querySelector('#login-password')?.value;
      if (!email || !password) { showMsg('Please fill in all fields.', true); return; }

      if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
      const res = await loginUser(email, password);
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }

      if (res.success) {
        localStorage.setItem('cafenest_user', JSON.stringify(res.data));
        showMsg('Login successful! Redirecting…', false);
        setTimeout(() => {
          window.location.href = res.data?.role === 'admin'
            ? '/frontend/administrator/index.html'
            : '/frontend/user/index.html';
        }, 800);
      } else {
        showMsg(res.message || 'Invalid email or password.', true);
      }
    }, { capture: true });
  }

  /* ── Sign-up form (login.html) ────────────────────────────── */
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const btn      = signupForm.querySelector('button[type="submit"]');
      const name     = signupForm.querySelector('#signup-name')?.value.trim();
      const email    = signupForm.querySelector('#signup-email')?.value.trim();
      const password = signupForm.querySelector('#signup-password')?.value;
      const confirm  = signupForm.querySelector('#signup-confirm')?.value;
      // Phone is optional in the HTML form; default to a placeholder for backend validation
      const phone    = signupForm.querySelector('#signup-phone')?.value.trim() || '9000000000';

      if (!name || !email || !password || !confirm) { showMsg('Please fill in all fields.', true); return; }
      if (password !== confirm) { showMsg('Passwords do not match.', true); return; }
      if (password.length < 6) { showMsg('Password must be at least 6 characters.', true); return; }

      if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }
      const res = await registerCustomer(name, email, password, phone);
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }

      showMsg(res.message, !res.success);
      if (res.success) {
        setTimeout(() => {
          // Switch to login tab
          document.querySelector('[data-target="login-form"]')?.click();
        }, 1400);
      }
    }, { capture: true });
  }

  /* ── Booking form (booking-form.html) ─────────────────────── */
  const confirmBtn = document.getElementById('btn-confirm-submit');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async (e) => {
      if (typeof validateBookingForm === 'function' && !validateBookingForm()) return;

      const name     = document.getElementById('customer-name')?.value.trim() || '';
      const phone    = document.getElementById('customer-phone')?.value.trim() || '';
      const email    = document.getElementById('customer-email')?.value.trim() || '';
      const requests = document.getElementById('customer-requests')?.value.trim() || '';
      const payEl    = document.querySelector('input[name="payment_method"]:checked');
      const method   = payEl ? payEl.value : 'cash';
      const coupon   = document.getElementById('coupon-code-input')?.value.trim() || '';

      const res = await placeOrder({ name, phone, email, special_requests: requests }, method, coupon);

      if (res.success && res.data?.order_id) {
        const refEl = document.getElementById('modal-ref-id');
        if (refEl) refEl.textContent = res.data.order_id;
        try {
          const key      = 'cafenest_orders';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.unshift(res.data);
          localStorage.setItem(key, JSON.stringify(existing));
        } catch (_) {}
      }
    }, { capture: false });
  }

});

/* ═══════════════════════════════════════════════════════════════════════
   Expose helpers globally for inline use in existing scripts
   ═══════════════════════════════════════════════════════════════════════ */
window.CafeAPI = {
  getCart, addToCart, updateCart, removeFromCart, clearCart,
  fetchMenu,
  placeOrder, getOrder, getMyOrders, cancelOrder,
  applyCouponCode,
  submitReview, getMyReviews,
  loginUser, logoutUser, registerCustomer, getCurrentUserApi,
};
