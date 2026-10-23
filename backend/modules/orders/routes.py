# backend/modules/orders/routes.py
from flask import Blueprint, request, jsonify, session
from backend.config.database import execute_query, execute_transaction
import uuid

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

VALID_TRANSITIONS = {
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["preparing", "cancelled"],
    "preparing": ["ready"],
    "ready": ["delivered"],
    "delivered": [],
    "cancelled": []
}

def _fmt_order(o):
    o = dict(o)
    for k in ("created_at", "updated_at", "paid_at"):
        if k in o and o[k]:
            o[k] = str(o[k])
    for k in ("total", "amount"):
        if k in o and o[k] is not None:
            o[k] = float(o[k])
    return o

@orders_bp.route("/checkout", methods=["POST"])
def checkout():
    if "customer_id" not in session:
        return jsonify({"success": False, "message": "Login required"}), 401

    data = request.get_json()
    cart = session.get("cart", {})
    if not cart:
        return jsonify({"success": False, "message": "Cart is empty"}), 400

    payment_method = data.get("payment_method", "cash").lower()
    if payment_method not in ("cash", "upi"):
        return jsonify({"success": False, "message": "Invalid payment method"}), 400

    order_type = data.get("order_type", "takeaway")
    if order_type not in ("dine_in", "takeaway", "delivery"):
        order_type = "takeaway"

    table_id = data.get("table_id") if order_type == "dine_in" else None
    notes = (data.get("notes") or "").strip()[:500]

    # Validate all items from DB (never trust browser prices)
    ids = list(cart.keys())
    placeholders = ",".join(["%s"] * len(ids))
    rows = execute_query(
        f"SELECT menu_id, name, price, is_available FROM menu WHERE menu_id IN ({placeholders})",
        ids, fetch=True
    )
    menu_map = {str(r["menu_id"]): r for r in rows}

    order_items = []
    total = 0.0
    for mid, qty in cart.items():
        item = menu_map.get(str(mid))
        if not item:
            return jsonify({"success": False, "message": f"Item {mid} not found"}), 400
        if not item["is_available"]:
            return jsonify({"success": False, "message": f"'{item['name']}' is no longer available"}), 409
        if qty < 1:
            return jsonify({"success": False, "message": "Invalid quantity"}), 400
        price = float(item["price"])
        order_items.append({"menu_id": int(mid), "quantity": qty, "unit_price": price})
        total += price * qty

    total = round(total, 2)
    customer_id = session["customer_id"]
    transaction_ref = str(uuid.uuid4())[:20]

    # Build transaction operations
    ops = [
        ("INSERT INTO orders (customer_id, table_id, status, total, notes, order_type) VALUES (%s,%s,%s,%s,%s,%s)",
         (customer_id, table_id, "pending", total, notes or None, order_type))
    ]
    results = execute_transaction(ops)
    order_id = results[0]

    # Insert order details
    detail_ops = [
        ("INSERT INTO order_details (order_id, menu_id, quantity, unit_price) VALUES (%s,%s,%s,%s)",
         (order_id, item["menu_id"], item["quantity"], item["unit_price"]))
        for item in order_items
    ]
    # Insert payment
    detail_ops.append(
        ("INSERT INTO payments (order_id, amount, method, status, transaction_ref, paid_at) VALUES (%s,%s,%s,%s,%s,NOW())",
         (order_id, total, payment_method, "completed", transaction_ref))
    )
    execute_transaction(detail_ops)

    # Update order status to confirmed
    execute_query("UPDATE orders SET status='confirmed' WHERE order_id=%s", (order_id,))

    # Clear cart
    session["cart"] = {}
    session.modified = True

    return jsonify({
        "success": True,
        "message": "Order placed successfully",
        "order_id": order_id,
        "total": total,
        "payment_method": payment_method,
        "transaction_ref": transaction_ref
    }), 201

@orders_bp.route("/my", methods=["GET"])
def my_orders():
    if "customer_id" not in session:
        return jsonify({"success": False, "message": "Login required"}), 401
    rows = execute_query(
        """SELECT o.*, p.method as payment_method, p.status as payment_status, p.transaction_ref
           FROM orders o
           LEFT JOIN payments p ON o.order_id=p.order_id
           WHERE o.customer_id=%s
           ORDER BY o.created_at DESC""",
        (session["customer_id"],), fetch=True
    )
    return jsonify({"success": True, "data": [_fmt_order(r) for r in rows]})

@orders_bp.route("/my/<int:order_id>", methods=["GET"])
def my_order_detail(order_id):
    if "customer_id" not in session:
        return jsonify({"success": False, "message": "Login required"}), 401

    rows = execute_query(
        """SELECT o.*, p.method as payment_method, p.status as payment_status, p.transaction_ref, p.paid_at
           FROM orders o
           LEFT JOIN payments p ON o.order_id=p.order_id
           WHERE o.order_id=%s AND o.customer_id=%s""",
        (order_id, session["customer_id"]), fetch=True
    )
    if not rows:
        return jsonify({"success": False, "message": "Order not found"}), 404

    order = _fmt_order(rows[0])
    details = execute_query(
        """SELECT od.*, m.name, m.image_url FROM order_details od
           JOIN menu m ON od.menu_id=m.menu_id WHERE od.order_id=%s""",
        (order_id,), fetch=True
    )
    order["items"] = []
    for d in details:
        d = dict(d)
        d["unit_price"] = float(d["unit_price"])
        d["subtotal"] = float(d["subtotal"]) if d.get("subtotal") is not None else d["unit_price"] * d["quantity"]
        order["items"].append(d)
    return jsonify({"success": True, "data": order})

# ── Admin / Staff order management ──────────────────────────────
@orders_bp.route("/admin/all", methods=["GET"])
def admin_list_orders():
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    status_filter = request.args.get("status")
    sql = """SELECT o.*, c.name as customer_name, c.email as customer_email,
                    p.method as payment_method, p.status as payment_status
             FROM orders o
             JOIN customers c ON o.customer_id=c.customer_id
             LEFT JOIN payments p ON o.order_id=p.order_id
             WHERE 1=1"""
    params = []
    if status_filter:
        sql += " AND o.status=%s"
        params.append(status_filter)
    sql += " ORDER BY o.created_at DESC LIMIT 200"
    rows = execute_query(sql, params or None, fetch=True)
    return jsonify({"success": True, "data": [_fmt_order(r) for r in rows]})

@orders_bp.route("/admin/<int:order_id>", methods=["GET"])
def admin_order_detail(order_id):
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    rows = execute_query(
        """SELECT o.*, c.name as customer_name, c.email as customer_email,
                  p.method as payment_method, p.status as payment_status, p.transaction_ref
           FROM orders o
           JOIN customers c ON o.customer_id=c.customer_id
           LEFT JOIN payments p ON o.order_id=p.order_id
           WHERE o.order_id=%s""",
        (order_id,), fetch=True
    )
    if not rows:
        return jsonify({"success": False, "message": "Order not found"}), 404
    order = _fmt_order(rows[0])
    details = execute_query(
        "SELECT od.*, m.name FROM order_details od JOIN menu m ON od.menu_id=m.menu_id WHERE od.order_id=%s",
        (order_id,), fetch=True
    )
    order["items"] = [{**dict(d), "unit_price": float(d["unit_price"]), "subtotal": float(d["subtotal"]) if d.get("subtotal") else float(d["unit_price"])*d["quantity"]} for d in details]
    return jsonify({"success": True, "data": order})

@orders_bp.route("/admin/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    data = request.get_json()
    new_status = data.get("status", "").lower()

    rows = execute_query("SELECT status FROM orders WHERE order_id=%s", (order_id,), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Order not found"}), 404
    current = rows[0]["status"]
    allowed = VALID_TRANSITIONS.get(current, [])
    if new_status not in allowed:
        return jsonify({"success": False, "message": f"Cannot transition from '{current}' to '{new_status}'"}), 400

    execute_query("UPDATE orders SET status=%s WHERE order_id=%s", (new_status, order_id))
    return jsonify({"success": True, "message": f"Order status updated to {new_status}"})
