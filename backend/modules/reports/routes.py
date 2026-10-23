# backend/modules/reports/routes.py
from flask import Blueprint, request, jsonify, session
from backend.config.database import execute_query

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

def staff_check():
    if "staff_id" not in session:
        return jsonify({"success": False, "message": "Staff login required"}), 401
    return None

@reports_bp.route("/dashboard", methods=["GET"])
def dashboard():
    err = staff_check()
    if err: return err

    # Sales totals (today, this week, this month, all time)
    today_sales = execute_query(
        "SELECT COALESCE(SUM(total),0) as total, COUNT(*) as count FROM orders WHERE DATE(created_at)=CURDATE() AND status NOT IN ('cancelled')",
        fetch=True
    )
    week_sales = execute_query(
        "SELECT COALESCE(SUM(total),0) as total, COUNT(*) as count FROM orders WHERE YEARWEEK(created_at)=YEARWEEK(NOW()) AND status NOT IN ('cancelled')",
        fetch=True
    )
    month_sales = execute_query(
        "SELECT COALESCE(SUM(total),0) as total, COUNT(*) as count FROM orders WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW()) AND status NOT IN ('cancelled')",
        fetch=True
    )
    total_sales = execute_query(
        "SELECT COALESCE(SUM(total),0) as total, COUNT(*) as count FROM orders WHERE status NOT IN ('cancelled')",
        fetch=True
    )

    # Status breakdown
    status_rows = execute_query(
        "SELECT status, COUNT(*) as count FROM orders GROUP BY status",
        fetch=True
    )

    # Popular items
    popular = execute_query(
        """SELECT m.name, SUM(od.quantity) as total_sold, SUM(od.subtotal) as revenue
           FROM order_details od
           JOIN menu m ON od.menu_id=m.menu_id
           JOIN orders o ON od.order_id=o.order_id
           WHERE o.status NOT IN ('cancelled')
           GROUP BY od.menu_id, m.name
           ORDER BY total_sold DESC
           LIMIT 10""",
        fetch=True
    )

    # Low stock
    low_stock = execute_query(
        "SELECT item_name, quantity, reorder_level, unit FROM inventory WHERE quantity <= reorder_level ORDER BY quantity ASC",
        fetch=True
    )

    # Recent orders
    recent = execute_query(
        """SELECT o.order_id, c.name as customer_name, o.total, o.status, o.created_at
           FROM orders o JOIN customers c ON o.customer_id=c.customer_id
           ORDER BY o.created_at DESC LIMIT 10""",
        fetch=True
    )

    # Total customers
    total_customers = execute_query("SELECT COUNT(*) as cnt FROM customers", fetch=True)

    def _s(row):
        r = dict(row)
        for k in r:
            if hasattr(r[k], 'isoformat'):
                r[k] = str(r[k])
            elif isinstance(r[k], (int, float)) and not isinstance(r[k], bool):
                pass
        return r

    return jsonify({
        "success": True,
        "data": {
            "today": {"total": float(today_sales[0]["total"]), "count": today_sales[0]["count"]},
            "week": {"total": float(week_sales[0]["total"]), "count": week_sales[0]["count"]},
            "month": {"total": float(month_sales[0]["total"]), "count": month_sales[0]["count"]},
            "all_time": {"total": float(total_sales[0]["total"]), "count": total_sales[0]["count"]},
            "status_breakdown": [_s(r) for r in status_rows],
            "popular_items": [{**dict(r), "total_sold": int(r["total_sold"]), "revenue": float(r["revenue"])} for r in popular],
            "low_stock": [{**dict(r), "quantity": float(r["quantity"]), "reorder_level": float(r["reorder_level"])} for r in low_stock],
            "recent_orders": [{**dict(r), "total": float(r["total"]), "created_at": str(r["created_at"])} for r in recent],
            "total_customers": total_customers[0]["cnt"]
        }
    })

@reports_bp.route("/sales", methods=["GET"])
def sales_report():
    err = staff_check()
    if err: return err
    period = request.args.get("period", "month")  # today | week | month | year
    if period == "today":
        sql = "SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders FROM orders WHERE DATE(created_at)=CURDATE() AND status NOT IN ('cancelled') GROUP BY DATE(created_at)"
    elif period == "week":
        sql = "SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders FROM orders WHERE YEARWEEK(created_at)=YEARWEEK(NOW()) AND status NOT IN ('cancelled') GROUP BY DATE(created_at) ORDER BY date"
    elif period == "year":
        sql = "SELECT DATE_FORMAT(created_at,'%Y-%m') as date, SUM(total) as revenue, COUNT(*) as orders FROM orders WHERE YEAR(created_at)=YEAR(NOW()) AND status NOT IN ('cancelled') GROUP BY DATE_FORMAT(created_at,'%Y-%m') ORDER BY date"
    else:  # month
        sql = "SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders FROM orders WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW()) AND status NOT IN ('cancelled') GROUP BY DATE(created_at) ORDER BY date"
    rows = execute_query(sql, fetch=True)
    return jsonify({"success": True, "data": [{**dict(r), "revenue": float(r["revenue"]), "date": str(r["date"])} for r in rows]})
