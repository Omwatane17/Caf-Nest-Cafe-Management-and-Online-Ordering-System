# backend/modules/staff/routes.py
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from backend.config.database import execute_query

staff_bp = Blueprint("staff_mgmt", __name__, url_prefix="/api/staff")

def admin_required():
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    if session.get("staff_role") not in ("admin", "manager"):
        return jsonify({"success": False, "message": "Admin/Manager access required"}), 403
    return None

def any_staff():
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    return None

@staff_bp.route("/", methods=["GET"])
def list_staff():
    err = any_staff()
    if err: return err
    rows = execute_query("SELECT staff_id, name, email, role, phone, is_active, created_at FROM staff ORDER BY name", fetch=True)
    return jsonify({"success": True, "data": [{**dict(r), "created_at": str(r["created_at"]), "is_active": bool(r["is_active"])} for r in rows]})

@staff_bp.route("/<int:sid>", methods=["GET"])
def get_staff(sid):
    err = any_staff()
    if err: return err
    rows = execute_query("SELECT staff_id, name, email, role, phone, is_active, created_at FROM staff WHERE staff_id=%s", (sid,), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Staff not found"}), 404
    r = dict(rows[0])
    r["created_at"] = str(r["created_at"])
    r["is_active"] = bool(r["is_active"])
    return jsonify({"success": True, "data": r})

@staff_bp.route("/", methods=["POST"])
def create_staff():
    err = admin_required()
    if err: return err
    data = request.get_json()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role", "staff").lower()
    phone = (data.get("phone") or "").strip()

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, password required"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 chars"}), 400
    if role not in ("admin", "manager", "staff"):
        return jsonify({"success": False, "message": "Invalid role"}), 400
    if "@" not in email:
        return jsonify({"success": False, "message": "Invalid email"}), 400

    existing = execute_query("SELECT staff_id FROM staff WHERE email=%s", (email,), fetch=True)
    if existing:
        return jsonify({"success": False, "message": "Email already exists"}), 409

    pw_hash = generate_password_hash(password)
    sid = execute_query(
        "INSERT INTO staff (name, email, password_hash, role, phone) VALUES (%s,%s,%s,%s,%s)",
        (name, email, pw_hash, role, phone or None)
    )
    return jsonify({"success": True, "message": "Staff created", "staff_id": sid}), 201

@staff_bp.route("/<int:sid>", methods=["PUT"])
def update_staff(sid):
    err = admin_required()
    if err: return err
    data = request.get_json()
    rows = execute_query("SELECT * FROM staff WHERE staff_id=%s", (sid,), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Staff not found"}), 404
    old = rows[0]

    name = (data.get("name") or old["name"]).strip()
    role = data.get("role", old["role"]).lower()
    phone = (data.get("phone") or old.get("phone") or "").strip()
    is_active = int(bool(data.get("is_active", old["is_active"])))

    if role not in ("admin", "manager", "staff"):
        return jsonify({"success": False, "message": "Invalid role"}), 400

    # Prevent admin from deactivating themselves
    if sid == session["staff_id"] and not is_active:
        return jsonify({"success": False, "message": "Cannot deactivate yourself"}), 400

    execute_query("UPDATE staff SET name=%s, role=%s, phone=%s, is_active=%s WHERE staff_id=%s",
                  (name, role, phone or None, is_active, sid))

    new_pw = data.get("new_password")
    if new_pw:
        if len(new_pw) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 chars"}), 400
        execute_query("UPDATE staff SET password_hash=%s WHERE staff_id=%s", (generate_password_hash(new_pw), sid))

    return jsonify({"success": True, "message": "Staff updated"})

@staff_bp.route("/<int:sid>", methods=["DELETE"])
def delete_staff(sid):
    err = admin_required()
    if err: return err
    if sid == session["staff_id"]:
        return jsonify({"success": False, "message": "Cannot delete yourself"}), 400
    execute_query("DELETE FROM staff WHERE staff_id=%s", (sid,))
    return jsonify({"success": True, "message": "Staff deleted"})
