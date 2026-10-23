# app.py - CaféNest Main Flask Application
import os
import sys

# Make sure the project root is in the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, send_from_directory, session, jsonify
from flask_session import Session
from backend.config.settings import Config

# Create flask_sessions dir
os.makedirs(Config.SESSION_FILE_DIR, exist_ok=True)

app = Flask(
    __name__,
    template_folder=os.path.join("frontend", "templates"),
    static_folder=os.path.join("frontend", "static"),
    static_url_path="/static"
)
app.config.from_object(Config)

# Initialize server-side session
Session(app)

# ── Register blueprints ──────────────────────────────────────────
from backend.modules.auth.routes import auth_bp
from backend.modules.menu.routes import menu_bp
from backend.modules.cart.routes import cart_bp
from backend.modules.orders.routes import orders_bp
from backend.modules.orders.table_routes import tables_bp
from backend.modules.staff.routes import staff_bp
from backend.modules.inventory.routes import inventory_bp
from backend.modules.reports.routes import reports_bp

app.register_blueprint(auth_bp)
app.register_blueprint(menu_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(tables_bp)
app.register_blueprint(staff_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(reports_bp)

# ── Page routes (serve HTML templates) ─────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/menu")
def menu_page():
    return render_template("menu.html")

@app.route("/checkout")
def checkout_page():
    return render_template("checkout.html")

@app.route("/orders")
def orders_page():
    return render_template("orders.html")

@app.route("/order-confirmation")
def order_confirmation_page():
    return render_template("order_confirmation.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/profile")
def profile_page():
    return render_template("profile.html")

# ── Admin pages ──────────────────────────────────────────────────
@app.route("/admin")
def admin_index():
    return render_template("admin/dashboard.html")

@app.route("/admin/login")
def admin_login_page():
    return render_template("admin/login.html")

@app.route("/admin/menu")
def admin_menu_page():
    return render_template("admin/menu.html")

@app.route("/admin/orders")
def admin_orders_page():
    return render_template("admin/orders.html")

@app.route("/admin/tables")
def admin_tables_page():
    return render_template("admin/tables.html")

@app.route("/admin/staff")
def admin_staff_page():
    return render_template("admin/staff.html")

@app.route("/admin/inventory")
def admin_inventory_page():
    return render_template("admin/inventory.html")

@app.route("/admin/suppliers")
def admin_suppliers_page():
    return render_template("admin/suppliers.html")

@app.route("/admin/reports")
def admin_reports_page():
    return render_template("admin/reports.html")

# ── Error handlers ───────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    from flask import request as req
    if req.path.startswith("/api/"):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404
    return render_template("404.html"), 404

@app.errorhandler(500)
def server_error(e):
    from flask import request as req
    import traceback
    traceback.print_exc()
    if req.path.startswith("/api/"):
        return jsonify({"success": False, "message": "Internal server error"}), 500
    return render_template("404.html"), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
