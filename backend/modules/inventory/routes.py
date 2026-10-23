# backend/modules/inventory/routes.py
from flask import Blueprint, request, jsonify, session
from backend.config.database import execute_query, execute_transaction

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")

def staff_check():
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    return None

def _fmt(r):
    r = dict(r)
    for k in ("quantity", "reorder_level", "unit_cost"):
        if k in r and r[k] is not None:
            r[k] = float(r[k])
    for k in ("created_at", "updated_at"):
        if k in r and r[k]:
            r[k] = str(r[k])
    return r

# ── Suppliers ────────────────────────────────────────────────────
@inventory_bp.route("/suppliers", methods=["GET"])
def list_suppliers():
    err = staff_check()
    if err: return err
    rows = execute_query("SELECT * FROM suppliers ORDER BY supplier_name", fetch=True)
    return jsonify({"success": True, "data": [_fmt(r) for r in rows]})

@inventory_bp.route("/suppliers", methods=["POST"])
def create_supplier():
    err = staff_check()
    if err: return err
    data = request.get_json()
    name = (data.get("supplier_name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Supplier name required"}), 400
    sid = execute_query(
        "INSERT INTO suppliers (supplier_name, contact_name, phone, email, address) VALUES (%s,%s,%s,%s,%s)",
        (name, data.get("contact_name") or None, data.get("phone") or None, data.get("email") or None, data.get("address") or None)
    )
    return jsonify({"success": True, "message": "Supplier created", "supplier_id": sid}), 201

@inventory_bp.route("/suppliers/<int:sid>", methods=["PUT"])
def update_supplier(sid):
    err = staff_check()
    if err: return err
    data = request.get_json()
    name = (data.get("supplier_name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Supplier name required"}), 400
    execute_query(
        "UPDATE suppliers SET supplier_name=%s, contact_name=%s, phone=%s, email=%s, address=%s WHERE supplier_id=%s",
        (name, data.get("contact_name") or None, data.get("phone") or None, data.get("email") or None, data.get("address") or None, sid)
    )
    return jsonify({"success": True, "message": "Supplier updated"})

@inventory_bp.route("/suppliers/<int:sid>", methods=["DELETE"])
def delete_supplier(sid):
    err = staff_check()
    if err: return err
    execute_query("UPDATE inventory SET supplier_id=NULL WHERE supplier_id=%s", (sid,))
    execute_query("DELETE FROM suppliers WHERE supplier_id=%s", (sid,))
    return jsonify({"success": True, "message": "Supplier deleted"})

# ── Inventory Items ──────────────────────────────────────────────
@inventory_bp.route("/items", methods=["GET"])
def list_items():
    err = staff_check()
    if err: return err
    low_stock = request.args.get("low_stock")
    sql = "SELECT i.*, s.supplier_name FROM inventory i LEFT JOIN suppliers s ON i.supplier_id=s.supplier_id"
    if low_stock == "1":
        sql += " WHERE i.quantity <= i.reorder_level"
    sql += " ORDER BY i.item_name"
    rows = execute_query(sql, fetch=True)
    return jsonify({"success": True, "data": [_fmt(r) for r in rows]})

@inventory_bp.route("/items", methods=["POST"])
def create_item():
    err = staff_check()
    if err: return err
    data = request.get_json()
    name = (data.get("item_name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Item name required"}), 400
    try:
        qty = float(data.get("quantity", 0))
        reorder = float(data.get("reorder_level", 10))
        unit_cost = float(data["unit_cost"]) if data.get("unit_cost") is not None else None
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid numeric values"}), 400
    if qty < 0:
        return jsonify({"success": False, "message": "Quantity cannot be negative"}), 400

    iid = execute_query(
        "INSERT INTO inventory (supplier_id, item_name, unit, quantity, reorder_level, unit_cost) VALUES (%s,%s,%s,%s,%s,%s)",
        (data.get("supplier_id") or None, name, data.get("unit") or "unit", qty, reorder, unit_cost)
    )
    return jsonify({"success": True, "message": "Item created", "inventory_id": iid}), 201

@inventory_bp.route("/items/<int:iid>", methods=["PUT"])
def update_item(iid):
    err = staff_check()
    if err: return err
    data = request.get_json()
    name = (data.get("item_name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Item name required"}), 400
    try:
        reorder = float(data.get("reorder_level", 10))
        unit_cost = float(data["unit_cost"]) if data.get("unit_cost") is not None else None
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid numeric values"}), 400
    execute_query(
        "UPDATE inventory SET supplier_id=%s, item_name=%s, unit=%s, reorder_level=%s, unit_cost=%s WHERE inventory_id=%s",
        (data.get("supplier_id") or None, name, data.get("unit") or "unit", reorder, unit_cost, iid)
    )
    return jsonify({"success": True, "message": "Item updated"})

@inventory_bp.route("/items/<int:iid>", methods=["DELETE"])
def delete_item(iid):
    err = staff_check()
    if err: return err
    execute_query("DELETE FROM inventory WHERE inventory_id=%s", (iid,))
    return jsonify({"success": True, "message": "Item deleted"})

# ── Stock Movements ──────────────────────────────────────────────
@inventory_bp.route("/movements", methods=["GET"])
def list_movements():
    err = staff_check()
    if err: return err
    iid = request.args.get("inventory_id")
    sql = """SELECT sm.*, i.item_name, s.name as staff_name
             FROM stock_movements sm
             JOIN inventory i ON sm.inventory_id=i.inventory_id
             LEFT JOIN staff s ON sm.staff_id=s.staff_id"""
    params = []
    if iid:
        sql += " WHERE sm.inventory_id=%s"
        params.append(int(iid))
    sql += " ORDER BY sm.created_at DESC LIMIT 200"
    rows = execute_query(sql, params or None, fetch=True)
    result = []
    for r in rows:
        r = dict(r)
        r["quantity_change"] = float(r["quantity_change"])
        r["created_at"] = str(r["created_at"])
        result.append(r)
    return jsonify({"success": True, "data": result})

@inventory_bp.route("/movements", methods=["POST"])
def add_movement():
    err = staff_check()
    if err: return err
    data = request.get_json()
    iid = data.get("inventory_id")
    try:
        qty_change = float(data.get("quantity_change", 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid quantity"}), 400
    movement_type = data.get("movement_type", "in")
    reason = (data.get("reason") or "").strip()

    if not iid:
        return jsonify({"success": False, "message": "inventory_id required"}), 400
    if movement_type not in ("in", "out", "adjustment"):
        return jsonify({"success": False, "message": "Invalid movement type"}), 400

    # Check item exists and calculate new qty
    rows = execute_query("SELECT quantity FROM inventory WHERE inventory_id=%s", (iid,), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Inventory item not found"}), 404

    current_qty = float(rows[0]["quantity"])
    if movement_type == "out":
        new_qty = current_qty - qty_change
    elif movement_type == "in":
        new_qty = current_qty + qty_change
    else:  # adjustment
        new_qty = qty_change

    if new_qty < 0:
        return jsonify({"success": False, "message": "Insufficient stock"}), 400

    ops = [
        ("INSERT INTO stock_movements (inventory_id, quantity_change, movement_type, reason, staff_id) VALUES (%s,%s,%s,%s,%s)",
         (iid, qty_change, movement_type, reason or None, session.get("staff_id"))),
        ("UPDATE inventory SET quantity=%s WHERE inventory_id=%s", (new_qty, iid))
    ]
    execute_transaction(ops)
    return jsonify({"success": True, "message": "Stock movement recorded", "new_quantity": new_qty}), 201
