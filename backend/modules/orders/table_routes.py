# backend/modules/orders/table_routes.py
from flask import Blueprint, request, jsonify, session
from backend.config.database import execute_query

tables_bp = Blueprint("tables", __name__, url_prefix="/api/tables")

def staff_check():
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    return None

def _fmt(r):
    r = dict(r)
    for k in ("created_at", "updated_at"):
        if k in r and r[k]:
            r[k] = str(r[k])
    return r

@tables_bp.route("/", methods=["GET"])
def list_tables():
    rows = execute_query("SELECT * FROM cafe_tables ORDER BY table_number", fetch=True)
    return jsonify({"success": True, "data": [_fmt(r) for r in rows]})

@tables_bp.route("/<int:tid>", methods=["GET"])
def get_table(tid):
    rows = execute_query("SELECT * FROM cafe_tables WHERE table_id=%s", (tid,), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Table not found"}), 404
    return jsonify({"success": True, "data": _fmt(rows[0])})

@tables_bp.route("/", methods=["POST"])
def create_table():
    err = staff_check()
    if err: return err
    data = request.get_json()
    number = (data.get("table_number") or "").strip()
    capacity = int(data.get("capacity", 4))
    location = (data.get("location") or "").strip()
    if not number:
        return jsonify({"success": False, "message": "Table number required"}), 400
    if capacity < 1:
        return jsonify({"success": False, "message": "Capacity must be at least 1"}), 400
    existing = execute_query("SELECT table_id FROM cafe_tables WHERE table_number=%s", (number,), fetch=True)
    if existing:
        return jsonify({"success": False, "message": "Table number already exists"}), 409
    tid = execute_query("INSERT INTO cafe_tables (table_number, capacity, location) VALUES (%s,%s,%s)",
                        (number, capacity, location or None))
    return jsonify({"success": True, "message": "Table created", "table_id": tid}), 201

@tables_bp.route("/<int:tid>", methods=["PUT"])
def update_table(tid):
    err = staff_check()
    if err: return err
    data = request.get_json()
    rows = execute_query("SELECT * FROM cafe_tables WHERE table_id=%s", (tid,), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Table not found"}), 404
    old = rows[0]
    number = (data.get("table_number") or old["table_number"]).strip()
    capacity = int(data.get("capacity", old["capacity"]))
    status = data.get("status", old["status"])
    location = (data.get("location") or old.get("location") or "").strip()

    if status not in ("available", "occupied", "reserved", "maintenance"):
        return jsonify({"success": False, "message": "Invalid status"}), 400
    if capacity < 1:
        return jsonify({"success": False, "message": "Capacity must be at least 1"}), 400

    # Check uniqueness if number changed
    if number != old["table_number"]:
        existing = execute_query("SELECT table_id FROM cafe_tables WHERE table_number=%s AND table_id!=%s", (number, tid), fetch=True)
        if existing:
            return jsonify({"success": False, "message": "Table number already exists"}), 409

    execute_query("UPDATE cafe_tables SET table_number=%s, capacity=%s, status=%s, location=%s WHERE table_id=%s",
                  (number, capacity, status, location or None, tid))
    return jsonify({"success": True, "message": "Table updated"})

@tables_bp.route("/<int:tid>", methods=["DELETE"])
def delete_table(tid):
    err = staff_check()
    if err: return err
    execute_query("UPDATE orders SET table_id=NULL WHERE table_id=%s", (tid,))
    execute_query("DELETE FROM cafe_tables WHERE table_id=%s", (tid,))
    return jsonify({"success": True, "message": "Table deleted"})
