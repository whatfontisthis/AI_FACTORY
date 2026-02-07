# Coupang Clone - PostgreSQL Schema (Supabase)

## Entity Relationship

```
users 1──N addresses
users 1──N cart_items
users 1──N orders
categories 1──N products
products 1──N cart_items
orders 1──N order_items
products 1──N order_items
addresses 1──N orders (shipping)
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| firebase_uid | varchar(128) | UNIQUE, NOT NULL |
| email | varchar(255) | NOT NULL |
| display_name | varchar(100) | |
| photo_url | text | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### categories
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| name | varchar(100) | NOT NULL |
| parent_id | uuid | FK -> categories(id), nullable |
| image_url | text | |
| sort_order | int | default 0 |
| created_at | timestamptz | default now() |

### products
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| name | varchar(300) | NOT NULL |
| description | text | |
| price | int | NOT NULL (KRW, no decimals) |
| discount_price | int | nullable |
| image_url | text | NOT NULL |
| images | text[] | additional images array |
| category_id | uuid | FK -> categories(id) |
| rating | decimal(2,1) | default 0.0 |
| review_count | int | default 0 |
| is_rocket_delivery | boolean | default false |
| stock | int | default 0 |
| options | jsonb | nullable, e.g. [{"name":"Color","values":["Red","Blue"]}] |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### addresses
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK -> users(id), NOT NULL |
| label | varchar(50) | e.g. "Home", "Office" |
| recipient | varchar(100) | NOT NULL |
| phone | varchar(20) | NOT NULL |
| zip_code | varchar(10) | NOT NULL |
| address1 | varchar(300) | NOT NULL |
| address2 | varchar(300) | |
| is_default | boolean | default false |
| created_at | timestamptz | default now() |

### cart_items
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK -> users(id), NOT NULL |
| product_id | uuid | FK -> products(id), NOT NULL |
| quantity | int | NOT NULL, default 1 |
| selected_options | jsonb | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| | | UNIQUE(user_id, product_id) |

### orders
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK -> users(id), NOT NULL |
| total_price | int | NOT NULL |
| status | varchar(20) | NOT NULL, default 'pending' |
| shipping_address_id | uuid | FK -> addresses(id) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**Status values**: `pending`, `paid`, `shipping`, `delivered`, `cancelled`

### order_items
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| order_id | uuid | FK -> orders(id), NOT NULL |
| product_id | uuid | FK -> products(id), NOT NULL |
| product_name | varchar(300) | NOT NULL (snapshot) |
| price | int | NOT NULL (snapshot) |
| quantity | int | NOT NULL |
| selected_options | jsonb | nullable |

## SQL Migration

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid varchar(128) UNIQUE NOT NULL,
  email varchar(255) NOT NULL,
  display_name varchar(100),
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  parent_id uuid REFERENCES categories(id),
  image_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(300) NOT NULL,
  description text,
  price int NOT NULL,
  discount_price int,
  image_url text NOT NULL,
  images text[],
  category_id uuid REFERENCES categories(id),
  rating decimal(2,1) DEFAULT 0.0,
  review_count int DEFAULT 0,
  is_rocket_delivery boolean DEFAULT false,
  stock int DEFAULT 0,
  options jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Addresses
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  label varchar(50),
  recipient varchar(100) NOT NULL,
  phone varchar(20) NOT NULL,
  zip_code varchar(10) NOT NULL,
  address1 varchar(300) NOT NULL,
  address2 varchar(300),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Cart Items
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  selected_options jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  total_price int NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  shipping_address_id uuid REFERENCES addresses(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  product_name varchar(300) NOT NULL,
  price int NOT NULL,
  quantity int NOT NULL,
  selected_options jsonb
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_rocket ON products(is_rocket_delivery) WHERE is_rocket_delivery = true;
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Seed Data Notes
- Categories: Electronics, Fashion, Food, Home & Living, Beauty
- Products: 20-30 sample items with Korean product names
- Use Coupang-style pricing (KRW integers, e.g., 29900, 15800)
