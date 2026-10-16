/**
 * CaféNest – Cart UI Integration
 * ─────────────────────────────────────────────────────────────────────────
 * Patches the "Add +" buttons on cafe-details.html to call the real
 * PHP session cart backend. Also provides a cart badge in the header.
 *
 * Load AFTER data.js, cafe-details.js, and api-bridge.js.
 */

'use strict';

/* ── Cart Badge ──────────────────────────────────────────────────────────
   Injects a small item-count badge into the header's booking nav link.   */

function updateCartBadge(count) {
  let badge = document.getElementById('cart-badge');
  if (!badge) {
    // Try to find the booking button or nav to attach badge to
    const target = document.getElementById('btn-book-table')
                || document.querySelector('.nav-book, [href*="booking-form"]')
                || document.querySelector('.details-book-btn, #details-book-btn');
    if (!target) return;
    badge = document.createElement('span');
    badge.id = 'cart-badge';
    badge.style.cssText = [
      'position:absolute','top:-6px','right:-8px',
      'min-width:18px','height:18px','padding:0 5px',
      'background:#C98A2B','color:#fff','border-radius:99px',
      'font-size:.68rem','font-weight:700','display:flex',
      'align-items:center','justify-content:center','pointer-events:none'
    ].join(';');
    target.style.position = 'relative';
    target.appendChild(badge);
  }
  badge.textContent = count > 0 ? count : '';
  badge.style.display = count > 0 ? 'flex' : 'none';
}

async function refreshCartBadge() {
  if (typeof CafeAPI === 'undefined') return;
  try {
    const res = await CafeAPI.getCart();
    if (res.success && res.data) {
      updateCartBadge(res.data.total_qty || 0);
    }
  } catch (_) {}
}

/* ── Patch Add buttons ───────────────────────────────────────────────── */

function patchAddButtons() {
  if (typeof CafeAPI === 'undefined') return; // bridge not loaded

  document.querySelectorAll('.btn-add-item').forEach(btn => {
    // Replace the old demo handler by cloning the button
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);

    fresh.addEventListener('click', async () => {
      const itemId   = fresh.getAttribute('data-item-id');
      const itemName = fresh.getAttribute('data-item-name');
      if (!itemId) return;

      // Visual feedback
      fresh.disabled = true;
      fresh.textContent = '…';

      const res = await CafeAPI.addToCart(itemId, 1);

      fresh.disabled = false;
      fresh.textContent = 'Add +';

      if (res.success) {
        if (typeof showToast === 'function') {
          showToast(`"${itemName}" added to cart ✓`);
        }
        updateCartBadge(res.data?.total_qty || 0);
      } else {
        if (typeof showToast === 'function') {
          showToast(res.message || 'Could not add item. Is the server running?');
        }
      }
    });
  });
}

/* ── Init ────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Wait a tick so cafe-details.js renders the menu items first
  setTimeout(() => {
    patchAddButtons();
    refreshCartBadge();
  }, 50);

  // Re-patch after category tab switches (which re-render the list)
  document.addEventListener('click', e => {
    if (e.target.closest('[role="tab"]') && !e.target.closest('#tab-seating')) {
      setTimeout(patchAddButtons, 80);
    }
  });
});
