import sys, os
sys.path.insert(0, ".")
print("=== CafeNest Final Pre-Launch Check ===")
print()

# 1. Check all files
required = [
    "app.py", "init_db.py", "setup_mysql.py",
    "requirements.txt", ".env",
    "database/schema.sql", "database/seed.sql",
    "backend/config/settings.py", "backend/config/database.py",
    "backend/modules/auth/routes.py",
    "backend/modules/menu/routes.py",
    "backend/modules/cart/routes.py",
    "backend/modules/orders/routes.py",
    "backend/modules/orders/table_routes.py",
    "backend/modules/staff/routes.py",
    "backend/modules/inventory/routes.py",
    "backend/modules/reports/routes.py",
    "frontend/static/css/styles.css",
    "frontend/static/js/utils.js",
    "frontend/templates/base.html",
    "frontend/templates/index.html",
    "frontend/templates/menu.html",
    "frontend/templates/login.html",
    "frontend/templates/register.html",
    "frontend/templates/checkout.html",
    "frontend/templates/orders.html",
    "frontend/templates/order_confirmation.html",
    "frontend/templates/profile.html",
    "frontend/templates/404.html",
    "frontend/templates/admin/base_admin.html",
    "frontend/templates/admin/login.html",
    "frontend/templates/admin/dashboard.html",
    "frontend/templates/admin/orders.html",
    "frontend/templates/admin/menu.html",
    "frontend/templates/admin/tables.html",
    "frontend/templates/admin/staff.html",
    "frontend/templates/admin/inventory.html",
    "frontend/templates/admin/suppliers.html",
    "frontend/templates/admin/reports.html",
]
all_ok = True
for f in required:
    size = os.path.getsize(f) if os.path.exists(f) else 0
    status = "OK" if size > 50 else ("EMPTY" if size > 0 else "MISSING")
    if status != "OK":
        print(f"  [{status}] {f} ({size}B)")
        all_ok = False

if all_ok:
    print("  All required files present!")

# 2. Import app
print()
try:
    import app as application
    api = [r for r in application.app.url_map.iter_rules() if r.rule.startswith('/api/')]
    pages = [r for r in application.app.url_map.iter_rules() if not r.rule.startswith('/api/') and not r.rule.startswith('/static')]
    print(f"  Flask app imported OK!")
    print(f"  API routes: {len(api)}")
    print(f"  Page routes: {len(pages)}")
except Exception as e:
    print(f"  App import: {e}")

# 3. Check DB settings
print()
from backend.config.settings import Config
has_pw = bool(Config.DB_PASSWORD)
print(f"  DB Host: {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}")
print(f"  DB User: {Config.DB_USER}")
print(f"  DB Password set: {'YES' if has_pw else 'NO - needs setup'}")
print()
print("=== SUMMARY ===")
if all_ok:
    print("  Code: READY")
else:
    print("  Code: ISSUES FOUND (see above)")
if has_pw:
    print("  Database: CONFIGURED - run python setup_mysql.py to init DB")
else:
    print("  Database: NOT CONFIGURED - set DB_PASSWORD in .env")
print()
print("  START APP: python app.py")
print("  SETUP DB:  python setup_mysql.py")
