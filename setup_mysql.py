#!/usr/bin/env python3
"""
setup_mysql.py — CafeNest MySQL Database Setup
Run: python setup_mysql.py
This auto-detects or prompts for the MySQL root password, creates the
cafenest database, applies the schema and seed data, and creates an
admin account.
"""
import sys, os, subprocess, getpass
from pathlib import Path

MYSQL_PATHS = [
    r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    r"C:\Program Files\MySQL\MySQL Server 8.3\bin\mysql.exe",
]


def find_mysql():
    for p in MYSQL_PATHS:
        if Path(p).exists():
            return p
    try:
        r = subprocess.run(["where", "mysql"], capture_output=True, text=True, timeout=5)
        if r.returncode == 0:
            return r.stdout.strip().split("\n")[0].strip()
    except Exception:
        pass
    return None


def try_connect(mysql_exe, password):
    try:
        args = [mysql_exe, "-u", "root", f"-p{password}", "-e", "SELECT 1"]
        r = subprocess.run(args, capture_output=True, text=True, timeout=6)
        return r.returncode == 0
    except Exception:
        return False


def run_sql(mysql_exe, password, sql, db=None):
    args = [mysql_exe, "-u", "root", f"-p{password}"]
    if db:
        args += [db]
    r = subprocess.run(args, input=sql, capture_output=True, text=True, timeout=30)
    return r.returncode == 0, r.stderr


def main():
    print("=" * 50)
    print("  CafeNest — MySQL Database Setup")
    print("=" * 50)

    mysql_exe = find_mysql()
    if not mysql_exe:
        print("\n[ERROR] mysql.exe not found!")
        print("Make sure MySQL is installed and try again.")
        input("\nPress Enter to exit...")
        return

    print(f"\nMySQL found at:\n  {mysql_exe}\n")

    # Auto-detect password
    common_passwords = ["", "root", "mysql", "password", "1234", "12345", "admin", "CafeNest@2024"]
    found_password = None
    print("Trying common passwords...")
    for pw in common_passwords:
        display = f"'{pw}'" if pw else "'(empty)'"
        print(f"  Trying {display}...", end="", flush=True)
        if try_connect(mysql_exe, pw):
            found_password = pw
            print(" ✓ Works!")
            break
        else:
            print(" ✗")

    if found_password is None:
        print("\nAutomatic detection failed.")
        print("Please enter your MySQL root password:")
        found_password = getpass.getpass("  MySQL root password: ")
        if not try_connect(mysql_exe, found_password):
            print("\n[ERROR] Incorrect password.")
            print("\n--- How to reset MySQL root password on Windows ---")
            print("1. Open Command Prompt as Administrator")
            print("2. Run: net stop MySQL80")
            print("3. Run: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqld.exe\" --skip-grant-tables --skip-networking")
            print("4. Open another CMD and run: mysql -u root")
            print("5. In MySQL prompt, run:")
            print("   FLUSH PRIVILEGES;")
            print("   ALTER USER 'root'@'localhost' IDENTIFIED BY 'CafeNest@2024';")
            print("   EXIT;")
            print("6. Kill mysqld in first window (Ctrl+C), then: net start MySQL80")
            print("7. Re-run this script with password: CafeNest@2024")
            input("\nPress Enter to exit...")
            return

    password = found_password
    print(f"\n[OK] Connected as root with password: '{password}'")

    # Update .env
    env_path = Path(".env")
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines()
        new_lines = []
        db_pw_updated = False
        for line in lines:
            if line.startswith("DB_PASSWORD="):
                new_lines.append(f"DB_PASSWORD={password}")
                db_pw_updated = True
            else:
                new_lines.append(line)
        if not db_pw_updated:
            new_lines.append(f"DB_PASSWORD={password}")
        env_path.write_text("\n".join(new_lines), encoding="utf-8")
        print("[OK] Updated .env with MySQL password")
    else:
        env_path.write_text(
            f"SECRET_KEY=cafenest_super_secret_change_in_prod\n"
            f"DB_HOST=localhost\nDB_PORT=3306\nDB_NAME=cafenest\n"
            f"DB_USER=root\nDB_PASSWORD={password}\n"
            f"FLASK_ENV=development\nFLASK_DEBUG=1\n",
            encoding="utf-8"
        )
        print("[OK] Created .env file")

    # Create database
    print("\nCreating cafenest database...")
    ok, err = run_sql(mysql_exe, password,
        "CREATE DATABASE IF NOT EXISTS cafenest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    if ok:
        print("[OK] Database cafenest ready")
    else:
        print(f"[ERROR] {err[:200]}")
        input("\nPress Enter to exit...")
        return

    # Apply schema
    schema_file = Path("database/schema.sql")
    if schema_file.exists():
        print("Applying schema...")
        ok, err = run_sql(mysql_exe, password, schema_file.read_text(encoding="utf-8"), db="cafenest")
        if ok:
            print("[OK] Schema applied successfully")
        else:
            # Schema errors due to IF NOT EXISTS are often warnings, not fatal
            if "error" in err.lower() and "already exists" not in err.lower():
                print(f"[WARN] Schema messages: {err[:300]}")
            else:
                print("[OK] Schema applied (some tables may already exist)")
    else:
        print("[WARN] database/schema.sql not found, skipping schema")

    # Apply seed data
    seed_file = Path("database/seed.sql")
    if seed_file.exists():
        print("Inserting seed data...")
        ok, err = run_sql(mysql_exe, password, seed_file.read_text(encoding="utf-8"), db="cafenest")
        if ok:
            print("[OK] Seed data inserted")
        else:
            print(f"[WARN] Seed data (duplicates OK): {err[:200]}")
    else:
        print("[WARN] database/seed.sql not found, skipping seed")

    # Create admin account via Python
    print("\nCreating admin account (admin@cafenest.com / Admin@123)...")
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        os.environ["DB_PASSWORD"] = password

        # Reload dotenv with override
        from dotenv import load_dotenv
        load_dotenv(override=True)

        # Re-import settings after env update
        if "backend.config.settings" in sys.modules:
            del sys.modules["backend.config.settings"]
        if "backend.config.database" in sys.modules:
            del sys.modules["backend.config.database"]

        from werkzeug.security import generate_password_hash
        import mysql.connector
        from backend.config.settings import Config

        conn = mysql.connector.connect(
            host=Config.DB_HOST, port=Config.DB_PORT,
            database=Config.DB_NAME, user=Config.DB_USER, password=password
        )
        cur = conn.cursor()
        ph = generate_password_hash("Admin@123")
        cur.execute(
            "INSERT IGNORE INTO staff (name, email, password_hash, role, is_active) VALUES (%s,%s,%s,%s,%s)",
            ("Admin", "admin@cafenest.com", ph, "admin", 1)
        )
        conn.commit()
        cur.close()
        conn.close()
        print("[OK] Admin account created")
    except Exception as e:
        print(f"[WARN] Python insert failed: {e}")
        print("      Trying SQL fallback...")
        try:
            from werkzeug.security import generate_password_hash
            ph = generate_password_hash("Admin@123")
            sql_insert = (
                f"INSERT IGNORE INTO staff (name,email,password_hash,role,is_active) "
                f"VALUES ('Admin','admin@cafenest.com','{ph}','admin',1);"
            )
            run_sql(mysql_exe, password, sql_insert, db="cafenest")
            print("[OK] Admin insert attempted via SQL")
        except Exception as e2:
            print(f"[ERROR] {e2}")

    print()
    print("=" * 50)
    print("  SETUP COMPLETE!")
    print("=" * 50)
    print()
    print("  Start the app:")
    print("    python app.py")
    print()
    print("  Customer site: http://localhost:5000")
    print("  Admin panel:   http://localhost:5000/admin")
    print("  Admin login:   http://localhost:5000/admin/login")
    print("  Admin email:   admin@cafenest.com")
    print("  Admin pass:    Admin@123")
    print()
    input("Press Enter to exit...")


if __name__ == "__main__":
    main()
