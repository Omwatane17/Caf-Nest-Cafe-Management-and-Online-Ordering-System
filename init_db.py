#!/usr/bin/env python3
"""
init_db.py - Initialize CaféNest database and create admin user
Run: python init_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

import mysql.connector
from werkzeug.security import generate_password_hash
from backend.config.settings import Config

def create_database():
    print("Connecting to MySQL...")
    conn = mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.execute(f"USE `{Config.DB_NAME}`")
    print(f"Database '{Config.DB_NAME}' ready.")

    with open("database/schema.sql", "r", encoding="utf-8") as f:
        schema = f.read()

    # Execute statements one by one
    statements = [s.strip() for s in schema.split(";") if s.strip() and not s.strip().startswith("--")]
    for stmt in statements:
        if stmt.upper().startswith("CREATE DATABASE") or stmt.upper().startswith("USE"):
            continue
        try:
            cursor.execute(stmt)
        except mysql.connector.Error as e:
            if e.errno == 1050:  # Table exists
                pass
            else:
                print(f"Warning: {e} for: {stmt[:60]}...")

    conn.commit()
    print("Schema applied.")

    # Seed data
    with open("database/seed.sql", "r", encoding="utf-8") as f:
        seed = f.read()

    seed_statements = [s.strip() for s in seed.split(";") if s.strip() and not s.strip().startswith("--")]
    for stmt in seed_statements:
        if stmt.upper().startswith("USE"):
            continue
        try:
            cursor.execute(stmt)
        except mysql.connector.Error as e:
            if e.errno in (1062, 1169):  # Duplicate entry
                pass
            else:
                print(f"Seed warning: {e}")

    conn.commit()
    print("Seed data applied.")

    # Create default admin account
    print("\nCreating default admin account...")
    admin_email = "admin@cafenest.com"
    admin_pw = "Admin@123"
    admin_hash = generate_password_hash(admin_pw)

    cursor.execute("SELECT staff_id FROM staff WHERE email=%s", (admin_email,))
    existing = cursor.fetchone()
    if existing:
        cursor.execute("UPDATE staff SET password_hash=%s WHERE email=%s", (admin_hash, admin_email))
        print(f"  Admin account updated: {admin_email}")
    else:
        cursor.execute(
            "INSERT INTO staff (name, email, password_hash, role, phone) VALUES (%s,%s,%s,%s,%s)",
            ("Admin", admin_email, admin_hash, "admin", "9999999999")
        )
        print(f"  Admin account created: {admin_email}")
    conn.commit()
    cursor.close()
    conn.close()
    print(f"\nAdmin login: {admin_email} / {admin_pw}")
    print("\nDatabase initialization complete!")
    print("Run: python app.py")
    print("Open: http://localhost:5000")

if __name__ == "__main__":
    try:
        create_database()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
