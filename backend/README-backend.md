# CaféNest — PHP Session Backend

> **DBMS Lab College Project** — Backend implementation using Core PHP + PHP Sessions (no database)

---

## ⚠️ Important Notices

| Notice | Detail |
|--------|--------|
| **No database** | All data is stored in PHP `$_SESSION`. It is lost when the session expires or Apache restarts. |
| **Demo only** | This backend is for a college lab demonstration. Do not use in production. |
| **UPI is simulated** | No real payment gateway is used. No real money is transferred. |
| **Admin credentials** | `owner@cafenest.com` / `admin@123` — change before any public deployment. |

---

## 1. XAMPP Setup

### Step 1 — Place the project
Copy the entire `DBMS_Project/` folder into XAMPP's web root:
```
C:\xampp\htdocs\DBMS_Project\
```

### Step 2 — Start Apache
Open **XAMPP Control Panel** → click **Start** next to Apache.  
(MySQL is **not required** for this backend.)

### Step 3 — Open the site
| Page | URL |
|------|-----|
| Customer home | http://localhost/DBMS_Project/frontend/user/index.html |
| Login / Sign-up | http://localhost/DBMS_Project/frontend/user/login.html |
| Admin dashboard | http://localhost/DBMS_Project/frontend/administrator/index.html |

---

## 2. Backend Folder Structure

```
backend/
├── api/
│   ├── auth.php                 ← Register, Login, Logout, Profile
│   ├── menu.php                 ← Menu items (PHP array, no DB)
│   ├── cart.php                 ← Cart CRUD (session-based)
│   ├── create-order.php         ← Place an order
│   ├── get-order.php            ← View order(s)
│   ├── cancel-order.php         ← Cancel eligible orders
│   ├── update-order-status.php  ← Admin: change order status
│   ├── apply-coupon.php         ← Validate & apply coupon
│   ├── payment.php              ← Demo payment processing
│   ├── reviews.php              ← Submit & retrieve reviews
│   └── admin-stats.php          ← Admin dashboard statistics
│
└── includes/
    ├── response.php             ← sendSuccess(), sendError(), getJsonBody()
    ├── session.php              ← Secure session bootstrap + CSRF helpers
    ├── validation.php           ← Input sanitisation helpers
    ├── auth-helper.php          ← requireCustomer(), requireAdmin(), ownership
    ├── menu-data.php            ← PHP array of all menu items + prices
    ├── order-service.php        ← Order CRUD + status transitions
    ├── coupon-service.php       ← Coupon validation + discount calculation
    ├── payment-service.php      ← Demo payment processor
    ├── review-service.php       ← Review validation + submission
    └── notification-service.php ← JSON receipt builder
```

---

## 3. API Reference

All endpoints return:
```json
{ "success": true,  "message": "...", "data": { ... } }
{ "success": false, "message": "...", "data": null      }
```

### Auth — `/backend/api/auth.php`

| Method | Query | Body | Description |
|--------|-------|------|-------------|
| GET | `?action=me` | — | Get current user |
| POST | `?action=register` | `{name,email,password,phone}` | Register |
| POST | `?action=login` | `{email,password}` | Login |
| POST | `?action=logout` | — | Logout |

**Demo admin:** `owner@cafenest.com` / `admin@123`

---

### Menu — `/backend/api/menu.php`

| Method | Query | Description |
|--------|-------|-------------|
| GET | — | All available items |
| GET | `?cafe_id=brew-house` | Items for one cafe |
| GET | `?category=coffee` | Filter by category |
| GET | `?categories=1` | List all categories |

---

### Cart — `/backend/api/cart.php`

| Method | Query | Body | Description |
|--------|-------|------|-------------|
| GET | — | — | View cart + totals |
| POST | `?action=add` | `{item_id, qty}` | Add item |
| POST | `?action=update` | `{item_id, qty}` | Update qty (0 = remove) |
| POST | `?action=remove` | `{item_id}` | Remove item |
| POST | `?action=clear` | — | Empty cart |

Prices are **always read from the server**. Client-submitted prices are ignored.

---

### Orders — `/backend/api/create-order.php`

```
POST /backend/api/create-order.php
{
  "name": "Tejaswini Sonone",
  "phone": "9876543210",
  "email": "tejaswini@gmail.com",
  "special_requests": "",
  "payment_method": "cash",
  "coupon_code": "WELCOME10"
}
```

Response includes: `order_id`, `status`, `items`, `subtotal`, `discount`, `total`, `prep_time_mins`, `payment_status`.

---

### Order tracking — `/backend/api/get-order.php`

| Query | Auth | Returns |
|-------|------|---------|
| `?order_id=CAF-...` | Customer (own) or Admin | Full receipt |
| `?my=1` | Customer | Own order summaries |
| *(none)* | Admin only | All order summaries |

---

### Cancel order — `/backend/api/cancel-order.php`

```
POST /backend/api/cancel-order.php
{ "order_id": "CAF-20261015-ABCDE" }
```
Customers: only `Pending` or `Confirmed` orders.  
Admins: any non-terminal order.

---

### Admin status update — `/backend/api/update-order-status.php` *(admin only)*

```
POST /backend/api/update-order-status.php
{ "order_id": "CAF-20261015-ABCDE", "status": "Preparing" }
```

Valid statuses: `Pending → Confirmed → Preparing → Ready → Completed` or `→ Cancelled`.

---

### Coupon — `/backend/api/apply-coupon.php`

```
POST /backend/api/apply-coupon.php
{ "coupon_code": "WELCOME10" }
```

| Code | Type | Value | Min Order | Max Discount |
|------|------|-------|-----------|--------------|
| `WELCOME10` | % | 10% | ₹150 | ₹50 |
| `CAFE20` | % | 20% | ₹300 | ₹100 |
| `FLAT50` | flat | ₹50 | ₹200 | ₹50 |
| `BREWLOVE` | % | 15% | ₹250 | ₹75 |

---

### Payment — `/backend/api/payment.php`

```
POST /backend/api/payment.php
{ "order_id": "CAF-...", "payment_method": "upi_demo" }
```

| Method | Result |
|--------|--------|
| `cash` | Status → `Pending` (collected at venue) |
| `upi_demo` | ~80% `Successful (Demo)`, ~20% `Failed (Demo)` |

No real transaction occurs. No PINs or card details are accepted.

---

### Reviews — `/backend/api/reviews.php`

```
POST /backend/api/reviews.php
{ "order_id": "CAF-...", "rating": 5, "comment": "Great coffee!" }
```
Only for `Completed` orders. One review per order. Auth required.

| GET Query | Auth | Returns |
|-----------|------|---------|
| *(none)* | Customer | Own reviews |
| `?all=1` | Admin | All reviews |

---

### Admin stats — `/backend/api/admin-stats.php` *(admin only)*

```
GET /backend/api/admin-stats.php
```

Returns: order counts by status, revenue (total/completed/pending), top 5 items, payment split, review average.

---

## 4. Frontend Files Modified

| File | Change |
|------|--------|
| `frontend/user/login.html` | Added `<script src="js/api-bridge.js">` |
| `frontend/user/booking-form.html` | Added `<script src="js/api-bridge.js">` |
| `frontend/user/js/api-bridge.js` | **New file** — all original JS untouched |

All other frontend files are **100% unchanged**.

---

## 5. Testing with Browser / curl

### 5a. Test menu endpoint
```
GET http://localhost/DBMS_Project/backend/api/menu.php?cafe_id=brew-house
```

### 5b. Add to cart then place order
```bash
# Step 1: add item
curl -X POST http://localhost/DBMS_Project/backend/api/cart.php?action=add \
  -H "Content-Type: application/json" \
  -c cookies.txt -b cookies.txt \
  -d '{"item_id":"item-bh-1","qty":2}'

# Step 2: apply coupon
curl -X POST http://localhost/DBMS_Project/backend/api/apply-coupon.php \
  -H "Content-Type: application/json" \
  -c cookies.txt -b cookies.txt \
  -d '{"coupon_code":"WELCOME10"}'

# Step 3: place order
curl -X POST http://localhost/DBMS_Project/backend/api/create-order.php \
  -H "Content-Type: application/json" \
  -c cookies.txt -b cookies.txt \
  -d '{"name":"Test User","phone":"9876543210","email":"test@test.com","payment_method":"cash","coupon_code":"WELCOME10"}'
```

### 5c. Admin login + stats
```bash
curl -X POST http://localhost/DBMS_Project/backend/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -c admin.txt -b admin.txt \
  -d '{"email":"owner@cafenest.com","password":"admin@123"}'

curl http://localhost/DBMS_Project/backend/api/admin-stats.php \
  -c admin.txt -b admin.txt
```

---

## 6. Known Limitations

| Limitation | Reason |
|------------|--------|
| Data lost on session expiry | No database — intentional for this demo |
| Admin dashboard JS not auto-wired | Admin pages use `ADMIN_MENU_SEED` static arrays; wiring requires editing `admin/js/data.js` |
| No real UPI / payment | Simulated only — for demo purposes |
| No email/SMS confirmations | Not implemented — JSON receipt is returned instead |
| No persistent user accounts | Session-only; accounts reset when session clears |
| Single-server only | Sessions are not shared across multiple servers |

---

## 7. Troubleshooting

| Problem | Fix |
|---------|-----|
| `404 Not Found` on API calls | Check that the project is in `C:\xampp\htdocs\DBMS_Project\` |
| `500 Internal Server Error` | Enable PHP error reporting: add `error_reporting(E_ALL);` to api file temporarily |
| Session data disappears | Check PHP `session.gc_maxlifetime` in `php.ini`; default is 1440 seconds |
| CORS errors | Make sure you're accessing via `http://localhost/...`, not `file://` |
| Cart resets between pages | Session cookie must persist; use `credentials:'include'` in all fetch calls |
