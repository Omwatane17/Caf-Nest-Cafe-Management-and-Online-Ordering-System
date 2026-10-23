USE cafenest;

-- Seed categories
INSERT IGNORE INTO categories (category_name, description) VALUES
('Hot Beverages', 'Coffee, tea, and warm drinks'),
('Cold Beverages', 'Iced drinks, smoothies, and juices'),
('Snacks', 'Light bites and savory snacks'),
('Main Course', 'Hearty meals and entrees'),
('Desserts', 'Sweet treats and pastries'),
('Breakfast', 'Morning specials and combos');

-- Seed cafe_tables
INSERT IGNORE INTO cafe_tables (table_number, capacity, status, location) VALUES
('T01', 2, 'available', 'Window'),
('T02', 4, 'available', 'Indoor'),
('T03', 4, 'available', 'Indoor'),
('T04', 6, 'available', 'Outdoor'),
('T05', 2, 'available', 'Window'),
('T06', 8, 'available', 'Private Room');

-- Seed menu items
INSERT IGNORE INTO menu (category_id, name, description, price, image_url, is_available, is_veg) VALUES
(1, 'Espresso', 'Rich and bold single shot espresso', 80.00, '/static/images/espresso.jpg', 1, 1),
(1, 'Cappuccino', 'Classic cappuccino with steamed milk foam', 120.00, '/static/images/cappuccino.jpg', 1, 1),
(1, 'Latte', 'Smooth espresso with creamy steamed milk', 130.00, '/static/images/latte.jpg', 1, 1),
(1, 'Masala Chai', 'Aromatic Indian spiced tea', 60.00, '/static/images/chai.jpg', 1, 1),
(1, 'Hot Chocolate', 'Rich velvety hot chocolate', 100.00, '/static/images/hot_chocolate.jpg', 1, 1),
(2, 'Cold Coffee', 'Refreshing iced cold brew coffee', 120.00, '/static/images/cold_coffee.jpg', 1, 1),
(2, 'Mango Smoothie', 'Fresh mango blended with yogurt', 140.00, '/static/images/mango_smoothie.jpg', 1, 1),
(2, 'Fresh Lime Soda', 'Zesty lime with sparkling water', 70.00, '/static/images/lime_soda.jpg', 1, 1),
(2, 'Strawberry Shake', 'Creamy strawberry milkshake', 150.00, '/static/images/strawberry_shake.jpg', 1, 1),
(3, 'Bruschetta', 'Toasted bread with tomato and herbs', 150.00, '/static/images/bruschetta.jpg', 1, 1),
(3, 'Veg Spring Rolls', 'Crispy rolls with vegetable filling', 120.00, '/static/images/spring_rolls.jpg', 1, 1),
(3, 'Chicken Wings', 'Spicy buffalo chicken wings', 200.00, '/static/images/chicken_wings.jpg', 1, 0),
(3, 'Nachos', 'Crispy nachos with salsa and cheese', 160.00, '/static/images/nachos.jpg', 1, 1),
(4, 'Pasta Arrabiata', 'Spicy tomato pasta with herbs', 220.00, '/static/images/pasta.jpg', 1, 1),
(4, 'Club Sandwich', 'Triple-decker sandwich with veggies', 180.00, '/static/images/club_sandwich.jpg', 1, 1),
(4, 'Chicken Burger', 'Grilled chicken burger with fries', 260.00, '/static/images/chicken_burger.jpg', 1, 0),
(4, 'Paneer Wrap', 'Spiced paneer in a whole wheat wrap', 190.00, '/static/images/paneer_wrap.jpg', 1, 1),
(5, 'Chocolate Brownie', 'Warm fudgy chocolate brownie', 110.00, '/static/images/brownie.jpg', 1, 1),
(5, 'Cheesecake', 'Classic New York style cheesecake', 160.00, '/static/images/cheesecake.jpg', 1, 1),
(5, 'Tiramisu', 'Italian coffee flavored dessert', 180.00, '/static/images/tiramisu.jpg', 1, 1),
(6, 'Pancake Stack', 'Fluffy pancakes with maple syrup', 170.00, '/static/images/pancakes.jpg', 1, 1),
(6, 'Avocado Toast', 'Sourdough with smashed avocado', 160.00, '/static/images/avocado_toast.jpg', 1, 1),
(6, 'English Breakfast', 'Full English with eggs and toast', 240.00, '/static/images/english_breakfast.jpg', 1, 0);

-- Seed admin staff (password: Admin@123)
INSERT IGNORE INTO staff (name, email, password_hash, role, phone) VALUES
('Admin', 'admin@cafenest.com', 'pbkdf2:sha256:600000$cafenest_salt$hashed_placeholder', 'admin', '9999999999');

-- Seed suppliers
INSERT IGNORE INTO suppliers (supplier_name, contact_name, phone, email) VALUES
('Fresh Farms Co.', 'Rajesh Kumar', '9876543210', 'rajesh@freshfarms.com'),
('Dairy Plus', 'Priya Singh', '9876543211', 'priya@dairyplus.com'),
('Brew Masters', 'Amit Patel', '9876543212', 'amit@brewmasters.com');

-- Seed inventory
INSERT IGNORE INTO inventory (supplier_id, item_name, unit, quantity, reorder_level, unit_cost) VALUES
(1, 'Coffee Beans', 'kg', 50.00, 10.00, 800.00),
(1, 'Milk', 'litre', 100.00, 20.00, 60.00),
(1, 'Sugar', 'kg', 30.00, 5.00, 45.00),
(1, 'All-Purpose Flour', 'kg', 25.00, 5.00, 40.00),
(2, 'Butter', 'kg', 10.00, 2.00, 450.00),
(2, 'Cream', 'litre', 15.00, 3.00, 200.00),
(3, 'Tea Leaves', 'kg', 20.00, 5.00, 500.00),
(1, 'Chicken', 'kg', 8.00, 3.00, 300.00),
(1, 'Tomatoes', 'kg', 12.00, 3.00, 30.00),
(1, 'Pasta', 'kg', 15.00, 5.00, 80.00);
