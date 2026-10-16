# CaféNest – Cafe Management System

> **DBMS Lab College Project**  
> Frontend: HTML / CSS / Vanilla JS · Backend: Core PHP + PHP Sessions · Storage: **Session-only (no database)**

---

## ⚠️ Storage Notice

All backend data (cart, orders, users, reviews) is stored in **PHP sessions**.  
It is **not permanently saved** and will reset when the session expires or Apache restarts.  
This is intentional for the college DBMS Lab demonstration.

---

## Quick Start (XAMPP)

```
1. Copy DBMS_Project/ → C:\xampp\htdocs\DBMS_Project\
2. Open XAMPP Control Panel → Start Apache  (MySQL is NOT needed)
3. Open: http://localhost/DBMS_Project/frontend/user/index.html
4. Admin: http://localhost/DBMS_Project/frontend/administrator/index.html
   Credentials: owner@cafenest.com / admin@123
```

---

## Project Structure

```
DBMS_Project/
│
├── frontend/                          ← Teammate's frontend (UNCHANGED except 2 script tags)
│   ├── user/                          ← Customer pages
│   │   ├── index.html, explore.html, cafe-details.html
│   │   ├── seating.html, booking-form.html, bookings.html
│   │   ├── login.html, profile.html
│   │   ├── css/   js/   assets/
│   │   └── js/api-bridge.js           ← NEW: backend integration bridge
│   └── administrator/                 ← Admin pages (unchanged)
│
├── backend/                           ← All PHP backend (separate from frontend)
│   ├── api/
│   │   ├── auth.php                   ← Register / Login / Logout / Profile
│   │   ├── menu.php                   ← Menu items (PHP array)
│   │   ├── cart.php                   ← Cart CRUD
│   │   ├── create-order.php           ← Place order
│   │   ├── get-order.php              ← View orders
│   │   ├── cancel-order.php           ← Cancel order
│   │   ├── update-order-status.php    ← Admin: update status
│   │   ├── apply-coupon.php           ← Coupon validation
│   │   ├── payment.php                ← Demo payment
│   │   ├── reviews.php                ← Reviews
│   │   └── admin-stats.php            ← Dashboard stats
│   ├── includes/
│   │   ├── response.php, session.php, validation.php
│   │   ├── auth-helper.php, menu-data.php
│   │   ├── order-service.php, coupon-service.php
│   │   ├── payment-service.php, review-service.php
│   │   └── notification-service.php
│   └── README-backend.md              ← Full API docs & setup guide
│
└── README.md                          ← This file
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, Vanilla JS |
| Backend | Core PHP 7.4+ (no framework) |
| Storage | PHP `$_SESSION` (temporary) |
| Local Dev | XAMPP (Apache only) |

---

## Design System (original frontend preserved)

| Token | Value |
|-------|-------|
| Primary | `#5A2E14` (deep coffee brown) |
| Background | `#FAF6EE` (warm cream) |
| Text | `#2B1A10` |
| Border | `#E8DEC8` |
| Card radius | `14px` |

---

## See Also

- [`backend/README-backend.md`](backend/README-backend.md) — Full API reference, curl examples, troubleshooting
