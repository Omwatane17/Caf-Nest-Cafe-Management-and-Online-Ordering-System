-- CaféNest Database Schema
-- Version: 1.0
-- Engine: MySQL 8.x

CREATE DATABASE IF NOT EXISTS cafenest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cafenest;

-- 1. customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id   INT          NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(180) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20)  DEFAULT NULL,
    address       TEXT         DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id),
    UNIQUE KEY uq_customers_email (email)
) ENGINE=InnoDB;

-- 2. categories
CREATE TABLE IF NOT EXISTS categories (
    category_id   INT          NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description   TEXT         DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (category_id),
    UNIQUE KEY uq_categories_name (category_name)
) ENGINE=InnoDB;

-- 3. cafe_tables
CREATE TABLE IF NOT EXISTS cafe_tables (
    table_id      INT         NOT NULL AUTO_INCREMENT,
    table_number  VARCHAR(20) NOT NULL,
    capacity      INT         NOT NULL DEFAULT 4,
    status        ENUM('available','occupied','reserved','maintenance') NOT NULL DEFAULT 'available',
    location      VARCHAR(100) DEFAULT NULL,
    created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (table_id),
    UNIQUE KEY uq_cafe_tables_number (table_number)
) ENGINE=InnoDB;

-- 4. menu
CREATE TABLE IF NOT EXISTS menu (
    menu_id      INT            NOT NULL AUTO_INCREMENT,
    category_id  INT            NOT NULL,
    name         VARCHAR(150)   NOT NULL,
    description  TEXT           DEFAULT NULL,
    price        DECIMAL(10,2)  NOT NULL,
    image_url    VARCHAR(300)   DEFAULT NULL,
    is_available TINYINT(1)     NOT NULL DEFAULT 1,
    is_veg       TINYINT(1)     NOT NULL DEFAULT 1,
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (menu_id),
    KEY idx_menu_category (category_id),
    KEY idx_menu_available (is_available),
    CONSTRAINT fk_menu_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. menu_price_audit
CREATE TABLE IF NOT EXISTS menu_price_audit (
    audit_id   INT           NOT NULL AUTO_INCREMENT,
    menu_id    INT           NOT NULL,
    old_price  DECIMAL(10,2) NOT NULL,
    new_price  DECIMAL(10,2) NOT NULL,
    changed_by INT           DEFAULT NULL,
    changed_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (audit_id),
    KEY idx_audit_menu (menu_id),
    CONSTRAINT fk_audit_menu FOREIGN KEY (menu_id) REFERENCES menu (menu_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. staff
CREATE TABLE IF NOT EXISTS staff (
    staff_id      INT          NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(180) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','manager','staff') NOT NULL DEFAULT 'staff',
    phone         VARCHAR(20)  DEFAULT NULL,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (staff_id),
    UNIQUE KEY uq_staff_email (email)
) ENGINE=InnoDB;

-- 7. orders
CREATE TABLE IF NOT EXISTS orders (
    order_id    INT            NOT NULL AUTO_INCREMENT,
    customer_id INT            NOT NULL,
    table_id    INT            DEFAULT NULL,
    status      ENUM('pending','confirmed','preparing','ready','delivered','cancelled') NOT NULL DEFAULT 'pending',
    total       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    notes       TEXT           DEFAULT NULL,
    order_type  ENUM('dine_in','takeaway','delivery') NOT NULL DEFAULT 'takeaway',
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id),
    KEY idx_orders_customer (customer_id),
    KEY idx_orders_status (status),
    KEY idx_orders_created (created_at),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_table FOREIGN KEY (table_id) REFERENCES cafe_tables (table_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. order_details
CREATE TABLE IF NOT EXISTS order_details (
    order_detail_id INT           NOT NULL AUTO_INCREMENT,
    order_id        INT           NOT NULL,
    menu_id         INT           NOT NULL,
    quantity        INT           NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    PRIMARY KEY (order_detail_id),
    KEY idx_od_order (order_id),
    KEY idx_od_menu (menu_id),
    CONSTRAINT fk_od_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_od_menu FOREIGN KEY (menu_id) REFERENCES menu (menu_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_od_qty CHECK (quantity >= 1)
) ENGINE=InnoDB;

-- 9. payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id     INT           NOT NULL AUTO_INCREMENT,
    order_id       INT           NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    method         ENUM('cash','upi') NOT NULL,
    status         ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(100) DEFAULT NULL,
    paid_at        DATETIME      DEFAULT NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (payment_id),
    UNIQUE KEY uq_payments_order (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id   INT          NOT NULL AUTO_INCREMENT,
    supplier_name VARCHAR(150) NOT NULL,
    contact_name  VARCHAR(120) DEFAULT NULL,
    phone         VARCHAR(20)  DEFAULT NULL,
    email         VARCHAR(180) DEFAULT NULL,
    address       TEXT         DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (supplier_id)
) ENGINE=InnoDB;

-- 11. inventory
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id  INT           NOT NULL AUTO_INCREMENT,
    supplier_id   INT           DEFAULT NULL,
    item_name     VARCHAR(150)  NOT NULL,
    unit          VARCHAR(50)   DEFAULT 'unit',
    quantity      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reorder_level DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    unit_cost     DECIMAL(10,2) DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (inventory_id),
    KEY idx_inventory_supplier (supplier_id),
    CONSTRAINT fk_inventory_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_inventory_qty CHECK (quantity >= 0)
) ENGINE=InnoDB;

-- 12. stock_movements
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id     INT           NOT NULL AUTO_INCREMENT,
    inventory_id    INT           NOT NULL,
    quantity_change DECIMAL(10,2) NOT NULL,
    movement_type   ENUM('in','out','adjustment') NOT NULL DEFAULT 'in',
    reason          VARCHAR(255)  DEFAULT NULL,
    staff_id        INT           DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (movement_id),
    KEY idx_sm_inventory (inventory_id),
    CONSTRAINT fk_sm_inventory FOREIGN KEY (inventory_id) REFERENCES inventory (inventory_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sm_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
