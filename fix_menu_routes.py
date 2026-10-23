import os, sys
BASE = r"c:\Users\HP\Desktop\DBMS_Project"

content = r"""# backend/modules/menu/routes.py
from flask import Blueprint, request, jsonify, session
from backend.config.database import execute_query, execute_transaction

menu_bp = Blueprint("menu", __name__, url_prefix="/api/menu")

def _fmt_item(row):
    row = dict(row)
    row["price"] = float(row["price"]) if row.get("price") is not None else 0
    row["is_available"] = bool(row.get("is_available"))
    row["is_veg"] = bool(row.get("is_veg"))
    for k in ("created_at", "updated_at"):
        if k in row and row[k]:
            row[k] = str(row[k])
    return row

def _fmt_cat(row):
    row = dict(row)
    row["name"] = row.get("category_name", "")
    icons = {"hot beverages":"coffeeicon","cold beverages":"drinkicon","snacks":"snackicon","main course":"plateicon","desserts":"cakeicon","breakfast":"breakfasticon"}
    row["icon"] = icons.get((row["name"] or "").lower(), "dishicon")
    return row

def _staff_check():
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    return None

@menu_bp.route("/", methods=["GET"])
def list_menu():
    category_id = request.args.get("cat") or request.args.get("category_id")
    search = request.args.get("q", "").strip()
    veg_only = request.args.get("veg_only") or request.args.get("veg")
    available_only = request.args.get("available", request.args.get("available_only", "1"))
    sort_by = request.args.get("sort", request.args.get("sort_by", "name"))
    limit = int(request.args.get("limit", 200))
    sql = "SELECT m.*, c.category_name FROM menu m JOIN categories c ON m.category_id=c.category_id WHERE 1=1"
    params = []
    if available_only == "1":
        sql += " AND m.is_available=1"
    if category_id:
        sql += " AND m.category_id=%s"
        params.append(int(category_id))
    if search:
        sql += " AND (m.name LIKE %s OR m.description LIKE %s)"
        params += [f"%{search}%", f"%{search}%"]
    if veg_only == "1":
        sql += " AND m.is_veg=1"
    elif veg_only == "0":
        sql += " AND m.is_veg=0"
    if sort_by == "price_asc":
        sql += " ORDER BY m.price ASC"
    elif sort_by == "price_desc":
        sql += " ORDER BY m.price DESC"
    else:
        sql += " ORDER BY m.name ASC"
    sql += f" LIMIT {limit}"
    rows = execute_query(sql, params or None, fetch=True)
    return jsonify({"success": True, "data": [_fmt_item(r) for r in rows]})

@menu_bp.route("/categories", methods=["GET"])
def list_categories():
    rows = execute_query(
        "SELECT c.*, COUNT(m.menu_id) as item_count FROM categories c "
        "LEFT JOIN menu m ON c.category_id=m.category_id "
        "GROUP BY c.category_id ORDER BY c.category_name", fetch=True)
    return jsonify({"success": True, "data": [_fmt_cat(r) for r in rows]})

@menu_bp.route("/admin/", methods=["POST"])
@menu_bp.route("/admin", methods=["POST"])
def admin_create_item():
    err = _staff_check()
    if err: return err
    data = request.get_json()
    name = (data.get("name") or "").strip()
    category_id = data.get("category_id")
    price = data.get("price")
    description = (data.get("description") or "").strip()
    image_url = (data.get("image_url") or "").strip() or None
    is_available = int(bool(data.get("is_available", True)))
    is_veg = int(bool(data.get("is_veg", True)))
    if not name or not category_id or price is None:
        return jsonify({"success": False, "message": "Name, category, and price are required"}), 400
    try:
        price = float(price)
        if price < 0: raise ValueError
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid price"}), 400
    mid = execute_query(
        "INSERT INTO menu (category_id, name, description, price, image_url, is_available, is_veg) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (int(category_id), name, description or None, price, image_url, is_available, is_veg))
    return jsonify({"success": True, "message": "Menu item created", "menu_id": mid}), 201

@menu_bp.route("/admin/all", methods=["GET"])
def admin_list_all():
    err = _staff_check()
    if err: return err
    rows = execute_query(
        "SELECT m.*, c.category_name FROM menu m JOIN categories c ON m.category_id=c.category_id ORDER BY m.category_id, m.name",
        fetch=True)
    return jsonify({"success": True, "data": [_fmt_item(r) for r in rows]})

@menu_bp.route("/admin/<int:menu_id>", methods=["PUT"])
def admin_update_item(menu_id):
    err = _staff_check()
    if err: return err
    data = request.get_json()
    existing = execute_query("SELECT * FROM menu WHERE menu_id=%s", (menu_id,), fetch=True)
    if not existing:
        return jsonify({"success": False, "message": "Item not found"}), 404
    old = existing[0]
    name = (data.get("name") or old["name"]).strip()
    category_id = data.get("category_id", old["category_id"])
    price = data.get("price", old["price"])
    description = data.get("description", old.get("description") or "")
    image_url = data.get("image_url", old.get("image_url"))
    is_available = int(bool(data.get("is_available", old["is_available"])))
    is_veg = int(bool(data.get("is_veg", old["is_veg"])))
    try:
        price = float(price)
        if price < 0: raise ValueError
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid price"}), 400
    ops = [("UPDATE menu SET category_id=%s, name=%s, description=%s, price=%s, image_url=%s, is_available=%s, is_veg=%s WHERE menu_id=%s",
             (int(category_id), name, description or None, price, image_url, is_available, is_veg, menu_id))]
    old_price = float(old["price"])
    if abs(old_price - price) > 0.001:
        ops.append(("INSERT INTO menu_price_audit (menu_id, old_price, new_price, changed_by) VALUES (%s,%s,%s,%s)",
                     (menu_id, old_price, price, session.get("staff_id"))))
    execute_transaction(ops)
    return jsonify({"success": True, "message": "Menu item updated"})

@menu_bp.route("/admin/<int:menu_id>", methods=["DELETE"])
def admin_delete_item(menu_id):
    err = _staff_check()
    if err: return err
    rows = execute_query("SELECT menu_id FROM menu WHERE menu_id=%s", (menu_id,), fetch=True)
    if not rows:
        return jsonify({"success": False, "message": "Item not found"}), 404
    execute_query("DELETE FROM menu WHERE menu_id=%s", (menu_id,))
    return jsonify({"success": True, "message": "Menu item deleted"})

@menu_bp.route("/admin/categories", methods=["POST"])
def admin_create_category():
    err = _staff_check()
    if err: return err
    data = request.get_json()
    name = (data.get("name") or data.get("category_name") or "").strip()
    desc = (data.get("description") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Category name required"}), 400
    cid = execute_query("INSERT INTO categories (category_name, description) VALUES (%s,%s)", (name, desc or None))
    return jsonify({"success": True, "message": "Category created", "category_id": cid}), 201

@menu_bp.route("/admin/categories/<int:cid>", methods=["PUT"])
def admin_update_category(cid):
    err = _staff_check()
    if err: return err
    data = request.get_json()
    name = (data.get("name") or data.get("category_name") or "").strip()
    desc = (data.get("description") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Category name required"}), 400
    execute_query("UPDATE categories SET category_name=%s, description=%s WHERE category_id=%s", (name, desc or None, cid))
    return jsonify({"success": True, "message": "Category updated"})

@menu_bp.route("/admin/categories/<int:cid>", methods=["DELETE"])
def admin_delete_category(cid):
    err = _staff_check()
    if err: return err
    used = execute_query("SELECT COUNT(*) as cnt FROM menu WHERE category_id=%s", (cid,), fetch=True)
    if used and used[0]["cnt"] > 0:
        return jsonify({"success": False, "message": "Category has menu items. Remove them first."}), 409
    execute_query("DELETE FROM categories WHERE category_id=%s", (cid,))
    return jsonify({"success": True, "message": "Category deleted"})

@menu_bp.route("/admin/price-history/<int:menu_id>", methods=["GET"])
def price_history(menu_id):
    err = _staff_check()
    if err: return err
    rows = execute_query(
        "SELECT a.*, s.name as changed_by_name FROM menu_price_audit a "
        "LEFT JOIN staff s ON a.changed_by=s.staff_id WHERE a.menu_id=%s ORDER BY a.changed_at DESC",
        (menu_id,), fetch=True)
    result = []
    for r in rows:
        r = dict(r)
        r["old_price"] = float(r["old_price"])
        r["new_price"] = float(r["new_price"])
        r["changed_at"] = str(r["changed_at"])
        result.append(r)
    return jsonify({"success": True, "data": result})
"""

path = os.path.join(BASE, "backend", "modules", "menu", "routes.py")
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("menu routes written:", os.path.getsize(path), "bytes")
