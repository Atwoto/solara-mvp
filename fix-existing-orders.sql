-- Fix existing orders that are stuck in 'Processing' status
-- Run this in your Supabase SQL editor to update existing orders

-- First, check which orders will be updated (run this first to see what will change)
SELECT id, status, paystack_reference, created_at, total_amount
FROM orders 
WHERE status = 'Processing' 
  AND paystack_reference IS NOT NULL;

-- Then run this to actually update the orders
UPDATE orders 
SET status = 'paid' 
WHERE status = 'Processing' 
  AND paystack_reference IS NOT NULL;