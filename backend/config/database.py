# backend/config/database.py
import mysql.connector
from mysql.connector import pooling
from backend.config.settings import Config

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="cafenest_pool",
            pool_size=10,
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            autocommit=False,
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci"
        )
    return _pool

def get_connection():
    """Get a connection from the pool."""
    return get_pool().get_connection()

def execute_query(sql, params=None, fetch=False, many=False):
    """Execute a parameterized SQL query.
    Returns lastrowid for INSERT, rowcount for UPDATE/DELETE, or rows for SELECT.
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        if many:
            cursor.executemany(sql, params or [])
        else:
            cursor.execute(sql, params or ())
        if fetch:
            result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.lastrowid if cursor.lastrowid else cursor.rowcount
        return result
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def execute_transaction(operations):
    """Execute multiple (sql, params) tuples as a single transaction.
    operations: list of (sql, params) tuples
    Returns list of lastrowids/rowcounts.
    """
    conn = None
    try:
        conn = get_connection()
        conn.autocommit = False
        cursor = conn.cursor(dictionary=True)
        results = []
        for sql, params in operations:
            cursor.execute(sql, params or ())
            results.append(cursor.lastrowid if cursor.lastrowid else cursor.rowcount)
        conn.commit()
        return results
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()
