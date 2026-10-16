<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CaféNest — Discover & Reserve Your Perfect Cafe</title>
  <meta name="description" content="CaféNest — Browse menus, check seating, place orders, and manage your cafe experience in Amravati.">
  <style>
    /* ── Design Tokens (mirrors frontend/user/css/tokens.css) ── */
    :root {
      --bg:      #FAF6EE;
      --primary: #5A2E14;
      --primary-h:#43210D;
      --accent:  #C98A2B;
      --text:    #2B1A10;
      --muted:   #6B5A4C;
      --border:  #E8DEC8;
      --white:   #FFFFFF;
      --card:    #FDFAF4;
      --radius:  14px;
      --shadow:  0 4px 24px rgba(43,26,16,.13);
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    /* ── Hero Header ──────────────────────────────────────────── */
    .hero {
      background: linear-gradient(135deg, #3b1d0b 0%, var(--primary) 50%, #7a3e1c 100%);
      color: var(--white);
      text-align: center;
      padding: 72px 24px 64px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(201,138,43,.18) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(255,255,255,.07) 0%, transparent 50%);
      pointer-events: none;
    }
    .hero-logo {
      display: inline-flex; align-items: center; gap: 14px;
      margin-bottom: 24px;
    }
    .hero-logo svg { width: 52px; height: 52px; stroke: #C98A2B; fill: none; stroke-width: 1.5; }
    .hero-brand { text-align: left; }
    .hero-brand h1 { font-size: 2.4rem; font-weight: 800; letter-spacing: -.5px; line-height: 1; }
    .hero-brand span { font-size: .9rem; color: rgba(255,255,255,.7); }
    .hero-tagline {
      font-size: 1.25rem; color: rgba(255,255,255,.85);
      margin-bottom: 12px; font-weight: 400;
    }
    .hero-sub { font-size: .95rem; color: rgba(255,255,255,.6); margin-bottom: 40px; }

    /* ── Session Notice ───────────────────────────────────────── */
    .session-notice {
      background: rgba(255,255,255,.1);
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 8px;
      padding: 10px 20px;
      font-size: .8rem;
      color: rgba(255,255,255,.75);
      display: inline-block;
      margin-bottom: 40px;
      backdrop-filter: blur(4px);
    }

    /* ── Cards Container ──────────────────────────────────────── */
    .cards-section {
      max-width: 900px;
      margin: -40px auto 0;
      padding: 0 24px 64px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      position: relative;
      z-index: 10;
    }
    @media (max-width: 600px) { .cards-section { grid-template-columns: 1fr; } }

    .portal-card {
      background: var(--white);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
      transition: transform .22s ease, box-shadow .22s ease;
      display: flex; flex-direction: column;
      text-decoration: none; color: inherit;
    }
    .portal-card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(43,26,16,.2); }

    .card-header {
      padding: 32px 28px 24px;
      display: flex; flex-direction: column; align-items: flex-start; gap: 14px;
    }
    .card-icon-wrap {
      width: 60px; height: 60px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .card-icon-wrap.customer { background: #EFE3D3; }
    .card-icon-wrap.admin    { background: #E3EBF6; }
    .card-icon-wrap svg { width: 28px; height: 28px; stroke-width: 1.8; fill: none; }
    .card-icon-wrap.customer svg { stroke: var(--primary); }
    .card-icon-wrap.admin    svg { stroke: #1e3a6e; }

    .card-title { font-size: 1.35rem; font-weight: 700; color: var(--text); }
    .card-desc  { font-size: .875rem; color: var(--muted); line-height: 1.55; }

    .card-features {
      padding: 0 28px 24px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .feature-item {
      display: flex; align-items: center; gap: 10px;
      font-size: .82rem; color: var(--muted);
    }
    .feature-item::before {
      content: '✓';
      width: 18px; height: 18px;
      background: #EFE3D3; color: var(--primary);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: .65rem; font-weight: 700; flex-shrink: 0;
    }
    .card-icon-wrap.admin ~ .card-features .feature-item::before {
      background: #E3EBF6; color: #1e3a6e;
    }

    .card-cta {
      margin: 0 28px 28px;
      padding: 13px 24px;
      border-radius: 10px;
      border: none;
      font-size: .95rem; font-weight: 700;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      display: block;
      transition: background .18s, transform .12s;
    }
    .card-cta.customer {
      background: var(--primary); color: var(--white);
    }
    .card-cta.customer:hover { background: var(--primary-h); }
    .card-cta.admin {
      background: #1e3a6e; color: var(--white);
    }
    .card-cta.admin:hover { background: #142c56; }
    .card-cta:active { transform: scale(.97); }

    /* ── Demo Credentials Box ─────────────────────────────────── */
    .demo-box {
      max-width: 900px; margin: 0 auto; padding: 0 24px 32px;
    }
    .demo-inner {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
      display: flex; flex-wrap: wrap; gap: 24px; align-items: center;
    }
    .demo-inner h3 { font-size: .85rem; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
    .demo-credential { display: flex; flex-direction: column; gap: 2px; }
    .demo-credential code {
      font-family: 'Courier New', monospace;
      font-size: .88rem;
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 3px 8px;
      border-radius: 5px;
      color: var(--primary);
      font-weight: 600;
    }
    .demo-label { font-size: .75rem; color: var(--muted); }

    /* ── API Test Link ────────────────────────────────────────── */
    .links-row {
      max-width: 900px; margin: 0 auto; padding: 0 24px 48px;
      display: flex; flex-wrap: wrap; gap: 12px;
    }
    .pill-link {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px;
      border-radius: 99px;
      border: 1px solid var(--border);
      font-size: .82rem; color: var(--muted);
      background: var(--white);
      text-decoration: none;
      transition: border-color .18s, color .18s;
    }
    .pill-link:hover { border-color: var(--primary); color: var(--primary); }
    .pill-link svg { width: 14px; height: 14px; stroke-width: 2; fill: none; stroke: currentColor; }

    /* ── Footer ───────────────────────────────────────────────── */
    footer {
      text-align: center;
      padding: 24px;
      border-top: 1px solid var(--border);
      font-size: .8rem; color: var(--muted);
    }
    footer strong { color: var(--primary); }
  </style>
</head>
<body>

<!-- ── Hero ─────────────────────────────────────────────── -->
<section class="hero">
  <div class="hero-logo">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="2" x2="6" y2="5"/><line x1="10" y1="2" x2="10" y2="5"/>
      <line x1="14" y1="2" x2="14" y2="5"/>
    </svg>
    <div class="hero-brand">
      <h1>CaféNest</h1>
      <span>Discover · Reserve · Enjoy</span>
    </div>
  </div>
  <p class="hero-tagline">Your neighbourhood café companion in Amravati</p>
  <p class="hero-sub">Browse menus, view seating, place orders, and manage your café — all in one place.</p>
  <div class="session-notice">
    ⚠️ Demo Mode — Data is stored in PHP sessions and resets when the server restarts. No database is used.
  </div>
</section>

<!-- ── Portal Cards ──────────────────────────────────────── -->
<div class="cards-section">

  <!-- Customer Portal -->
  <a href="/frontend/user/index.html" class="portal-card">
    <div class="card-header">
      <div class="card-icon-wrap customer">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div>
        <div class="card-title">Customer Website</div>
        <div class="card-desc">Discover cafes, browse menus, view seating, book tables, and track your orders.</div>
      </div>
    </div>
    <div class="card-features">
      <div class="feature-item">Explore 4 cafes in Amravati</div>
      <div class="feature-item">Browse menu with live categories</div>
      <div class="feature-item">Book a table & checkout</div>
      <div class="feature-item">Apply coupon codes (WELCOME10, CAFE20)</div>
      <div class="feature-item">Track &amp; cancel your orders</div>
      <div class="feature-item">Leave reviews for completed orders</div>
    </div>
    <span class="card-cta customer">Open Customer Site →</span>
  </a>

  <!-- Admin Portal -->
  <a href="/frontend/administrator/index.html" class="portal-card">
    <div class="card-header">
      <div class="card-icon-wrap admin">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/></svg>
      </div>
      <div>
        <div class="card-title">Admin Panel</div>
        <div class="card-desc">Manage reservations, update order statuses, view live dashboard stats, and oversee reviews.</div>
      </div>
    </div>
    <div class="card-features">
      <div class="feature-item">Live dashboard statistics</div>
      <div class="feature-item">Manage all reservations</div>
      <div class="feature-item">Update order status flow</div>
      <div class="feature-item">Menu &amp; table management view</div>
      <div class="feature-item">Customer reviews oversight</div>
      <div class="feature-item">Session-scoped data overview</div>
    </div>
    <span class="card-cta admin">Open Admin Panel →</span>
  </a>

</div>

<!-- ── Demo Credentials ───────────────────────────────────── -->
<div class="demo-box">
  <div class="demo-inner">
    <div style="flex:1;min-width:200px">
      <h3>🔐 Demo Login Credentials</h3>
    </div>
    <div class="demo-credential">
      <span class="demo-label">Admin Email</span>
      <code>owner@cafenest.com</code>
    </div>
    <div class="demo-credential">
      <span class="demo-label">Admin Password</span>
      <code>admin@123</code>
    </div>
    <div class="demo-credential">
      <span class="demo-label">Customer</span>
      <code>Register a new account on the login page</code>
    </div>
    <div class="demo-credential">
      <span class="demo-label">Coupons</span>
      <code>WELCOME10 · CAFE20 · FLAT50 · BREWLOVE</code>
    </div>
  </div>
</div>

<!-- ── Quick Links ────────────────────────────────────────── -->
<div class="links-row">
  <a href="/frontend/user/login.html" class="pill-link">
    <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    Login / Sign Up
  </a>
  <a href="/frontend/user/explore.html" class="pill-link">
    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    Explore Cafes
  </a>
  <a href="/frontend/user/bookings.html" class="pill-link">
    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/></svg>
    My Bookings
  </a>
  <a href="/test-api.html" class="pill-link">
    <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/></svg>
    API Test Panel
  </a>
  <a href="/backend/README-backend.md" class="pill-link">
    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/></svg>
    Backend Docs
  </a>
</div>

<!-- ── Footer ────────────────────────────────────────────── -->
<footer>
  <strong>CaféNest</strong> — College DBMS Lab Project &nbsp;|&nbsp;
  Core PHP + PHP Sessions (No Database) &nbsp;|&nbsp;
  PHP <?php echo PHP_VERSION; ?> &nbsp;|&nbsp;
  Session: <code><?php
    if (session_status() === PHP_SESSION_NONE) session_start();
    echo 'Active (' . session_id() . ')';
  ?></code>
</footer>

</body>
</html>
