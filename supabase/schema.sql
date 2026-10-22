-- ============================================================
-- Restaurant website template schema
-- PostgreSQL / Supabase Complete Production Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  must_change_password BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(60) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  category_slug VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  base_price NUMERIC(10, 2) NOT NULL,
  has_variants BOOLEAN DEFAULT FALSE,
  image TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  preparation_time VARCHAR(50),
  qr_code_data_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured);

-- 4. Menu Item Variants Table
CREATE TABLE IF NOT EXISTS menu_item_variants (
  id VARCHAR(60) PRIMARY KEY,
  menu_item_id VARCHAR(60) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_menu_item ON menu_item_variants(menu_item_id);

-- 5. Add-Ons Table
CREATE TABLE IF NOT EXISTS add_ons (
  id VARCHAR(60) PRIMARY KEY,
  menu_item_id VARCHAR(60) REFERENCES menu_items(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Menu Item Images Table
CREATE TABLE IF NOT EXISTS menu_item_images (
  id VARCHAR(60) PRIMARY KEY,
  menu_item_id VARCHAR(60) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(200),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY, -- e.g. ORD-2026-1001
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  whatsapp_number VARCHAR(30),
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('delivery', 'takeaway')),
  delivery_address TEXT,
  address_notes TEXT,
  customer_instructions TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('easypaisa', 'jazzcash', 'bank_transfer', 'cash_on_delivery')),
  payment_verification_status VARCHAR(30) DEFAULT 'pending_verification' CHECK (payment_verification_status IN ('pending_verification', 'verified', 'rejected', 'cod')),
  payment_receipt_url TEXT,
  payment_reference VARCHAR(100),
  order_status VARCHAR(30) DEFAULT 'placed' CHECK (order_status IN ('placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_verification_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 8. Order Items Table (Immutable snapshot of purchase)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id VARCHAR(60) NOT NULL,
  name VARCHAR(150) NOT NULL,
  variant_id VARCHAR(60),
  variant_name VARCHAR(100),
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 9. Order Item Add-Ons Table
CREATE TABLE IF NOT EXISTS order_item_add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  add_on_id VARCHAR(60) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

-- 10. Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  note TEXT,
  updated_by VARCHAR(50) DEFAULT 'admin',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_order_id ON order_status_history(order_id);

-- 11. Customer Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(60) PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  dish_recommended VARCHAR(100),
  source VARCHAR(30) DEFAULT 'customer_submitted' CHECK (source IN ('google_historical', 'customer_submitted')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  order_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- 12. Restaurant & Payment Settings Table (Key-Value or JSON storage)
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Durable full order payloads used by the application on serverless deployments.
CREATE TABLE IF NOT EXISTS public.grillvi_order_records (
  id TEXT PRIMARY KEY,
  order_data JSONB NOT NULL CHECK (jsonb_typeof(order_data) = 'object'),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_grillvi_order_records_created_at
  ON public.grillvi_order_records (created_at DESC);

ALTER TABLE public.grillvi_order_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.grillvi_order_records FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.grillvi_order_records TO service_role;

-- 13. QR Metadata Table
CREATE TABLE IF NOT EXISTS qr_metadata (
  product_id VARCHAR(60) PRIMARY KEY,
  product_url TEXT NOT NULL,
  qr_code_data_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
