/**
 * CafeNest - Login / Sign-Up Page Logic
 * Auth submission is handled by api-bridge.js (capture:true listeners).
 * This file handles only tab switching, toast display, and cross-tab links.
 */

(function () {
  /* ---- tab switching ---- */
  const tabs   = document.querySelectorAll('.auth-tab');
  const forms  = document.querySelectorAll('.auth-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('visible'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('visible');
    });
  });

  /* ---- toast helper (used by api-bridge too) ---- */
  window._loginToast = function(msg, isError) {
    const toast = document.getElementById('login-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = isError ? '#b91c1c' : '';
    toast.classList.add('show');
    clearTimeout(window._loginToastTimer);
    window._loginToastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
  };

  /* ---- cross-tab switch links ---- */
  document.querySelectorAll('[data-switch]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const switchTo = el.dataset.switch;
      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.target === switchTo);
      });
      forms.forEach(f => {
        f.classList.toggle('visible', f.id === switchTo);
      });
    });
  });
})();
