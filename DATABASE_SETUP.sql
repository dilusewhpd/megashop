-- MegaShop Database Schema for PostgreSQL

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount DECIMAL(5,2) DEFAULT 0,
    rating DECIMAL(3,2),
    review INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    seller VARCHAR(255),
    category VARCHAR(255),
    images JSONB,
    badges JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_color VARCHAR(100),
    selected_size VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, selected_color, selected_size)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    shipping_address JSONB,
    promo_code VARCHAR(100),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    selected_color VARCHAR(100),
    selected_size VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist table
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Promo codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token blacklist table for JWT tokens
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_sold_count ON products(sold_count);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_token_blacklist_token ON token_blacklist(token);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Sample data for testing
-- Insert sample products
INSERT INTO products (name, price, original_price, discount, rating, review, sold_count, seller, category, images, badges) VALUES
('Wireless Bluetooth Headphones', 2999.99, 3999.99, 25.00, 4.5, 128, 245, 'TechStore', 'Electronics', '["headphones1.jpg", "headphones2.jpg"]', '["Best Seller", "Free Shipping"]'),
('Smart Fitness Watch', 4999.99, 5999.99, 16.67, 4.2, 89, 156, 'FitLife', 'Wearables', '["watch1.jpg", "watch2.jpg"]', '["New Arrival"]'),
('Organic Cotton T-Shirt', 1299.99, 1299.99, 0.00, 4.8, 67, 203, 'EcoFashion', 'Clothing', '["tshirt1.jpg", "tshirt2.jpg"]', '["Eco-Friendly", "Best Seller"]'),
('Gaming Mechanical Keyboard', 3499.99, 4499.99, 22.22, 4.6, 95, 178, 'GameZone', 'Electronics', '["keyboard1.jpg", "keyboard2.jpg"]', '["Gaming", "RGB Lighting"]'),
('Wireless Charging Pad', 899.99, 1199.99, 25.00, 4.3, 42, 89, 'TechStore', 'Accessories', '["charger1.jpg"]', '["Fast Charging"]'),
('Smart Home Security Camera', 2499.99, 2999.99, 16.67, 4.4, 156, 267, 'SecureHome', 'Electronics', '["camera1.jpg", "camera2.jpg"]', '["1080p HD", "Night Vision"]'),
('Ergonomic Office Chair', 8999.99, 11999.99, 25.00, 4.7, 203, 134, 'OfficePro', 'Furniture', '["chair1.jpg", "chair2.jpg"]', '["Ergonomic", "Adjustable"]'),
('Bluetooth Portable Speaker', 1799.99, 2299.99, 21.74, 4.1, 78, 145, 'AudioTech', 'Electronics', '["speaker1.jpg"]', '["Waterproof", "Long Battery"]'),
('Yoga Mat Premium', 1999.99, 2499.99, 20.00, 4.5, 134, 198, 'FitLife', 'Sports', '["yogamat1.jpg", "yogamat2.jpg"]', '["Non-Slip", "Eco-Friendly"]'),
('LED Desk Lamp', 1499.99, 1799.99, 16.67, 4.2, 67, 123, 'HomeDecor', 'Home', '["lamp1.jpg"]', '["Adjustable", "USB Charging"]');

-- Insert sample promo codes
INSERT INTO promo_codes (code, title, description, discount_type, discount_value, minimum_order, image_url, is_active) VALUES
('WELCOME10', 'Welcome Discount', 'Get 10% off on your first order', 'percentage', 10.00, 1000.00, '10-discount', true),
('SAVE500', 'Flash Sale', 'Save Rs. 500 on orders above Rs. 2000', 'fixed', 500.00, 2000.00, 'flash-sale', true),
('FLASH20', 'Mega Deal', '20% off on orders above Rs. 1500', 'percentage', 20.00, 1500.00, 'mega-deal', true),
('NEWUSER15', 'New User Special', '15% off for new customers', 'percentage', 15.00, 800.00, 'new-user', true),
('BLACKFRIDAY', 'Black Friday Sale', 'Up to 30% off on selected items', 'percentage', 30.00, 2500.00, 'black-friday', true);