-- Migration: Create favorites table
-- Description: Table for storing user's favorite products (관심 목록/찜)

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can only favorite a product once
  UNIQUE(user_id, product_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Add foreign key constraints (optional, depends on your setup)
-- ALTER TABLE favorites ADD CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
-- ALTER TABLE favorites ADD CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

COMMENT ON TABLE favorites IS 'User favorite products (찜 목록)';
COMMENT ON COLUMN favorites.user_id IS 'ID of the user who favorited the product';
COMMENT ON COLUMN favorites.product_id IS 'ID of the favorited product';
COMMENT ON COLUMN favorites.created_at IS 'When the product was added to favorites';
