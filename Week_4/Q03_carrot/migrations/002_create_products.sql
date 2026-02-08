-- Migration: Create products table
-- Description: Table for storing marketplace product listings

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  location VARCHAR(100) DEFAULT '내 동네',
  images JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  user_id INTEGER NOT NULL,
  chat_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_title ON products USING gin(to_tsvector('korean', title));

-- Add check constraints
ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price >= 0);
ALTER TABLE products ADD CONSTRAINT chk_status_valid CHECK (status IN ('active', 'reserved', 'sold', 'deleted'));

COMMENT ON TABLE products IS 'Marketplace product listings';
COMMENT ON COLUMN products.title IS 'Product title';
COMMENT ON COLUMN products.category IS 'Product category (digital, furniture, etc.)';
COMMENT ON COLUMN products.price IS 'Product price in KRW';
COMMENT ON COLUMN products.description IS 'Detailed product description';
COMMENT ON COLUMN products.location IS 'Trading location';
COMMENT ON COLUMN products.images IS 'Array of image URLs stored as JSON';
COMMENT ON COLUMN products.status IS 'Product status: active, reserved, sold, deleted';
COMMENT ON COLUMN products.user_id IS 'ID of the user who created this product';
