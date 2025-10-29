-- Add sold_count and rating columns to products table
-- These fields allow displaying social proof on product listings

-- Add sold_count column (number of units sold)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT NULL;

-- Add rating column (product rating out of 5)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT NULL;

-- Add comments to the columns
COMMENT ON COLUMN products.sold_count IS 'Number of units sold. NULL means not displayed, 0+ means display the count';
COMMENT ON COLUMN products.rating IS 'Product rating from 0.0 to 5.0. NULL means not displayed';

-- Add constraint to ensure rating is between 0 and 5
ALTER TABLE products 
ADD CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- Create indexes for better performance when filtering/sorting
CREATE INDEX IF NOT EXISTS idx_products_sold_count ON products(sold_count) WHERE sold_count IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating) WHERE rating IS NOT NULL;
