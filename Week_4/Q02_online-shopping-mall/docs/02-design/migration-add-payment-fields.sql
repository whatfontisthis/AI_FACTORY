-- Migration: Add payment tracking fields to orders table
-- Purpose: Support TossPayments integration
-- Run this in Supabase SQL Editor before testing payments

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_key varchar(200),
ADD COLUMN IF NOT EXISTS payment_method varchar(50),
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add comments for documentation
COMMENT ON COLUMN orders.payment_key IS 'TossPayments paymentKey from successful payment';
COMMENT ON COLUMN orders.payment_method IS 'Payment method (card, transfer, etc)';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was confirmed';
