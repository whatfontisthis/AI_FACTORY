-- Mac Shopping Website Database Schema
-- All tables use w4q2_ prefix to avoid conflicts in shared Supabase instance

-- Users table
CREATE TABLE IF NOT EXISTS w4q2_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON w4q2_users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON w4q2_users(email);

-- Email validation constraint
ALTER TABLE w4q2_users
  DROP CONSTRAINT IF EXISTS chk_email_format;
ALTER TABLE w4q2_users
  ADD CONSTRAINT chk_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Products table
CREATE TABLE IF NOT EXISTS w4q2_products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url VARCHAR(500),
  specs JSONB,
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_category ON w4q2_products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON w4q2_products(in_stock);

-- Category validation constraint
ALTER TABLE w4q2_products
  DROP CONSTRAINT IF EXISTS chk_category;
ALTER TABLE w4q2_products
  ADD CONSTRAINT chk_category
  CHECK (category IN ('macbook-air', 'macbook-pro', 'imac', 'mac-mini', 'mac-studio', 'mac-pro'));

-- Cart items table
CREATE TABLE IF NOT EXISTS w4q2_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES w4q2_users(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES w4q2_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraint for cart items (same product+config can't be duplicated)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_unique_item
  ON w4q2_cart_items(user_id, product_id, (config::text));

-- Indexes for cart items
CREATE INDEX IF NOT EXISTS idx_cart_user ON w4q2_cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON w4q2_cart_items(product_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cart items updated_at
DROP TRIGGER IF EXISTS update_cart_updated_at ON w4q2_cart_items;
CREATE TRIGGER update_cart_updated_at
BEFORE UPDATE ON w4q2_cart_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Orders table
CREATE TABLE IF NOT EXISTS w4q2_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES w4q2_users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL CHECK (tax >= 0),
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  payment_id VARCHAR(255) UNIQUE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- Status validation constraint
ALTER TABLE w4q2_orders
  DROP CONSTRAINT IF EXISTS chk_order_status;
ALTER TABLE w4q2_orders
  ADD CONSTRAINT chk_order_status
  CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded'));

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user ON w4q2_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON w4q2_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON w4q2_orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON w4q2_orders(created_at DESC);

-- Order items table
CREATE TABLE IF NOT EXISTS w4q2_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES w4q2_orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON w4q2_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON w4q2_order_items(product_id);

-- Comments for documentation
COMMENT ON TABLE w4q2_users IS 'User accounts with Firebase authentication';
COMMENT ON TABLE w4q2_products IS 'Mac product catalog';
COMMENT ON TABLE w4q2_cart_items IS 'Shopping cart items for authenticated users';
COMMENT ON TABLE w4q2_orders IS 'Order records with Toss payment info';
COMMENT ON TABLE w4q2_order_items IS 'Line items for each order (snapshot at purchase time)';
