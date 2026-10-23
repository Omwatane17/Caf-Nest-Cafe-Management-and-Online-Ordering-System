# backend/modules/cart/routes.py
# Cart is stored in server-side session (not DB) since it is transient pre-order state.
# On checkout it is cleared. No customer data is stored in localStorage.
from flask import Blueprint, request, jsonify, session
from backend.config.database import execute_query

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")

def _get_cart():
    return session.get("cart", {})  # {str(menu_id): quantity}

def _save_cart(cart):
    session["cart"] = cart
    session.modified = True

def _cart_details(cart):
    if not cart:
        return [], 0.0
    ids = list(cart.keys())
    placeholders = ",".join(["%s"] * len(ids))
    rows = execute_query(f"SELECT menu_id, name, price, image_url, is_available, is_veg FROM menu WHERE menu_id IN ({placeholders})", ids, fetch=True)
    items = []
    total = 0.0
    for r in rows:
        r = dict(r)
        mid = str(r["menu_id"])
        qty = cart.get(mid, 0)
        r["price"] = float(r["price"])
        r["quantity"] = qty
        r["subtotal"] = r["price"] * qty
        r["is_available"] = bool(r["is_available"])
        total += r["subtotal"]
        items.append(r)
    return items, round(total, 2)

@cart_bp.route("/", methods=["GET"])
def get_cart():
    if "customer_id" not in session:
        return jsonify({"success": True, "data": {"items": [], "total": 0.0, "count": 0}})
    cart = _get_cart()
    items, total = _cart_details(cart)
    return jsonify({"success": True, "data": {"items": items, "total": total, "count": sum(cart.values())}})

@cart_bp.route("/add", methods=["POST"])
def add_to_cart():
    if "customer_id" not in session:
        return jsonify({"success": False, "message": "Please login to add items to cart"}), 401
    data = request.get_json()
    menu_id = data.get("menu_id")
    quantity = int(data.get("quantity", 1))
    if not menu_id or quantity < 1:
        return jsonify({"success": False, "message": "Invalid item or quantity"}), 400
    
    rows = execute_query("SELECT menu_id, name, is_available FROM menu WHERE menu_id=%s", (int(menu_id),), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Item not found"}), 404
    if not rows[0]["is_available"]:
        return jsonify({"success": False, "message": "Item is not available"}), 409
    
    cart = _get_cart()
    key = str(menu_id)
    cart[key] = cart.get(key, 0) + quantity
    _save_cart(cart)
    return jsonify({"success": True, "message": f"Added to cart", "count": sum(cart.values())})

@cart_bp.route("/update", methods=["PUT"])
def update_cart():
    if "customer_id" not in session:
        return jsonify({"success": False, "message": "Login required"}), 401
    data = request.get_json()
    menu_id = str(data.get("menu_id", ""))
    quantity = int(data.get("quantity", 0))
    cart = _get_cart()
    if quantity <= 0:
        cart.pop(menu_id, None)
    else:
        cart[menu_id] = quantity
    _save_cart(cart)
    items, total = _cart_details(cart)
    return jsonify({"success": True, "data": {"items": items, "total": total, "count": sum(cart.values())}})

@cart_bp.route("/remove/<int:menu_id>", methods=["DELETE"])
def remove_from_cart(menu_id):
    if "customer_id" not in session:
        return jsonify({"success": False, "message": "Login required"}), 401
    cart = _get_cart()
    cart.pop(str(menu_id), None)
    _save_cart(cart)
    return jsonify({"success": True, "message": "Item removed"})

@cart_bp.route("/clear", methods=["DELETE"])
def clear_cart():
    if "customer_id" not in session:
        return jsonify({"success": False, "message": "Login required"}), 401
    _save_cart({})
    return jsonify({"success": True, "message": "Cart cleared"})
