# Testing Instructions - Sold Count & Rating Feature

## ✅ What Was Fixed

The API routes now properly save `sold_count` and `rating` to the database!

## 🔧 Files Updated

1. ✅ `src/app/api/admin/products/route.ts` - POST (create new product)
2. ✅ `src/app/api/admin/products/[productId]/route.ts` - PUT (update product)

Both routes now:

- Extract `sold_count` and `rating` from form data
- Handle empty values as NULL (not 0)
- Save them to the database

## 🧪 How to Test

### Step 1: Run the Migration (If Not Done Yet)

```sql
-- In Supabase SQL Editor, run:
-- Copy contents from add_sold_count_migration.sql
```

### Step 2: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
rmdir /s /q .next
npm run dev
```

### Step 3: Test Creating a New Product

1. Go to `http://localhost:3000/admin/products/new`
2. Fill in all required fields
3. In "Social Proof" section:
   - Units Sold: `450`
   - Rating: `4.8`
4. Click "Create Product"
5. Check Supabase database - should see `sold_count: 450` and `rating: 4.8`

### Step 4: Test Editing an Existing Product

1. Go to `http://localhost:3000/admin/products`
2. Click "Edit" on any product
3. Scroll to "Social Proof" section
4. Add values:
   - Units Sold: `1250`
   - Rating: `4.5`
5. Click "Update Product"
6. Check Supabase database - values should be updated

### Step 5: Test Leaving Fields Empty

1. Edit a product
2. Leave both "Units Sold" and "Rating" empty
3. Click "Update Product"
4. Check database - both should be NULL (not 0)
5. Check frontend - no stars/sold count should display

### Step 6: Verify Frontend Display

1. Go to products page: `http://localhost:3000/products`
2. Products with sold_count should show: "⭐⭐⭐⭐⭐ 450 sold"
3. Click on a product to see detail page
4. Should show: "⭐⭐⭐⭐⭐ 4.8 | 450 sold"

## 🐛 Troubleshooting

### Issue: Values still showing as NULL in database

**Solution**: Make sure you restarted the dev server after the code changes

### Issue: Form says "success" but values not saved

**Solution**: Check browser console for errors. Make sure migration was run.

### Issue: Stars not showing on frontend

**Solution**:

- Check that `sold_count` is NOT NULL in database
- If `sold_count` is NULL, stars won't show (by design)
- Only shows when sold_count has a value

### Issue: Rating shows as 5.0 even though I set 4.8

**Solution**: Check database - if rating is NULL, it defaults to 5.0 on display

## ✨ Expected Results

### In Database (Supabase):

```
| id | name | price | sold_count | rating |
|----|------|-------|------------|--------|
| 1  | ...  | 25000 | 450        | 4.8    |
| 2  | ...  | 15000 | NULL       | NULL   |
| 3  | ...  | 30000 | 1250       | 5.0    |
```

### On Frontend (Product Card):

- Product 1: Shows "⭐⭐⭐⭐⭐ 450 sold"
- Product 2: Shows nothing (clean)
- Product 3: Shows "⭐⭐⭐⭐⭐ 1,250 sold"

### On Frontend (Product Detail):

- Product 1: Shows "⭐⭐⭐⭐⭐ 4.8 | 450 sold"
- Product 2: Shows nothing (clean)
- Product 3: Shows "⭐⭐⭐⭐⭐ 5.0 | 1,250 sold"

---

Everything should work now! 🎉
