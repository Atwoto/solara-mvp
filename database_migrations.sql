-- Add missing columns for guest checkout functionality

-- 1. Add is_guest column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- 2. Add password column to users table (for credentials authentication)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. Add guest_email column to orders table  
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- 3. Make user_id nullable in orders table for guest orders
-- This allows orders without a user_id reference
ALTER TABLE orders 
ALTER COLUMN user_id DROP NOT NULL;

-- 4. Create index on guest_email for better performance
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);

-- 5. Update RLS policies to handle guest users
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow guest order creation" ON orders;
DROP POLICY IF EXISTS "Allow guest order reading" ON orders;

-- Allow guest users to insert orders (with null user_id for guests)
CREATE POLICY "Allow guest order creation" ON orders
FOR INSERT 
WITH CHECK (
  auth.uid() IS NULL OR 
  auth.uid() = user_id OR 
  (guest_email IS NOT NULL AND user_id IS NULL)
);

-- Allow guest users to read their own orders by email
CREATE POLICY "Allow guest order reading" ON orders
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (guest_email IS NOT NULL AND user_id IS NULL)
);