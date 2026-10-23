# backend/modules/auth/routes.py
from flask import Blueprint, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from backend.config.database import execute_query

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if "customer_id" not in session:
            return jsonify({"success": False, "message": "Login required"}), 401
        return f(*args, **kwargs)
    return decorated

def staff_required(roles=None):
    def decorator(f):
        from functools import wraps
        @wraps(f)
        def decorated(*args, **kwargs):
            if "staff_id" not in session:
                return jsonify({"success": False, "message": "Staff login required"}), 401
            if roles and session.get("staff_role") not in roles:
                return jsonify({"success": False, "message": "Insufficient permissions"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400
    if "@" not in email:
        return jsonify({"success": False, "message": "Invalid email address"}), 400

    existing = execute_query("SELECT customer_id FROM customers WHERE email=%s", (email,), fetch=True)
    if existing:
        return jsonify({"success": False, "message": "Email already registered"}), 409

    pw_hash = generate_password_hash(password)
    cid = execute_query(
        "INSERT INTO customers (name, email, password_hash, phone) VALUES (%s, %s, %s, %s)",
        (name, email, pw_hash, phone or None)
    )
    session["customer_id"] = cid
    session["customer_name"] = name
    session["customer_email"] = email
    return jsonify({"success": True, "message": "Registration successful", "customer": {"id": cid, "name": name, "email": email}}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    rows = execute_query("SELECT * FROM customers WHERE email=%s", (email,), fetch=True)
    if not rows or not check_password_hash(rows[0]["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    c = rows[0]
    session["customer_id"] = c["customer_id"]
    session["customer_name"] = c["name"]
    session["customer_email"] = c["email"]
    return jsonify({"success": True, "message": "Login successful", "customer": {"id": c["customer_id"], "name": c["name"], "email": c["email"]}})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out"})

@auth_bp.route("/me", methods=["GET"])
def me():
    if "customer_id" in session:
        return jsonify({"success": True, "data": {"id": session["customer_id"], "name": session["customer_name"], "email": session["customer_email"]}})
    return jsonify({"success": False, "message": "Not logged in"}), 401

@auth_bp.route("/staff/me", methods=["GET"])
def staff_me():
    if "staff_id" in session:
        return jsonify({"success": True, "data": {"id": session["staff_id"], "name": session["staff_name"], "role": session["staff_role"], "email": session.get("staff_email", "")}})
    return jsonify({"success": False, "message": "Not logged in"}), 401

@auth_bp.route("/profile", methods=["GET"])
@login_required
def get_profile():
    rows = execute_query("SELECT customer_id, name, email, phone, address, created_at FROM customers WHERE customer_id=%s", (session["customer_id"],), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Not found"}), 404
    c = rows[0]
    c["created_at"] = str(c["created_at"])
    return jsonify({"success": True, "data": c})

@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    address = (data.get("address") or "").strip()
    new_password = (data.get("new_password") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Name is required"}), 400
    execute_query("UPDATE customers SET name=%s, phone=%s, address=%s WHERE customer_id=%s",
                  (name, phone or None, address or None, session["customer_id"]))
    session["customer_name"] = name
    if new_password:
        if len(new_password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400
        new_hash = generate_password_hash(new_password)
        execute_query("UPDATE customers SET password_hash=%s WHERE customer_id=%s", (new_hash, session["customer_id"]))
    return jsonify({"success": True, "message": "Profile updated"})

@auth_bp.route("/change-password", methods=["PUT"])
@login_required
def change_password():
    data = request.get_json()
    old_pw = data.get("old_password") or ""
    new_pw = data.get("new_password") or ""
    if not old_pw or not new_pw:
        return jsonify({"success": False, "message": "Both passwords required"}), 400
    if len(new_pw) < 6:
        return jsonify({"success": False, "message": "New password must be at least 6 characters"}), 400
    rows = execute_query("SELECT password_hash FROM customers WHERE customer_id=%s", (session["customer_id"],), fetch=True)
    if not rows or not check_password_hash(rows[0]["password_hash"], old_pw):
        return jsonify({"success": False, "message": "Current password is incorrect"}), 401
    new_hash = generate_password_hash(new_pw)
    execute_query("UPDATE customers SET password_hash=%s WHERE customer_id=%s", (new_hash, session["customer_id"]))
    return jsonify({"success": True, "message": "Password changed successfully"})

# ── Staff Auth ──────────────────────────────────────────────────
@auth_bp.route("/staff/login", methods=["POST"])
def staff_login():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    rows = execute_query("SELECT * FROM staff WHERE email=%s AND is_active=1", (email,), fetch=True)
    if not rows or not check_password_hash(rows[0]["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    s = rows[0]
    session["staff_id"] = s["staff_id"]
    session["staff_name"] = s["name"]
    session["staff_role"] = s["role"]
    session["staff_email"] = s["email"]
    return jsonify({"success": True, "staff": {"id": s["staff_id"], "name": s["name"], "role": s["role"]}})

@auth_bp.route("/staff/logout", methods=["POST"])
def staff_logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out"})
