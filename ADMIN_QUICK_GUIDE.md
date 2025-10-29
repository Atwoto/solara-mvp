# Quick Guide for Admin - Adding Sold Count & Rating

## 🎯 What This Does

Your admin can now add "social proof" to products - showing how many units were sold and the product rating, just like AliExpress!

## 📋 Step-by-Step for Admin

### 1. First Time Setup (Run Once)

Go to Supabase Dashboard → SQL Editor → Paste this SQL and click Run:

```sql
-- Copy everything from add_sold_count_migration.sql file
```

### 2. Adding to Products

#### When Creating New Product:

1. Go to `/admin/products/new`
2. Fill in product details as usual
3. Look for **"Social Proof"** section (right sidebar)
4. Add:
   - **Units Sold**: Type a number (e.g., 450)
   - **Rating**: Type 0.0 to 5.0 (e.g., 4.8)
5. Click "Create Product"

#### When Editing Existing Product:

1. Go to `/admin/products`
2. Click "Edit" on any product
3. Scroll to **"Social Proof"** section
4. Add the numbers
5. Click "Update Product"

### 3. What Customers See

**If you add sold count = 450 and rating = 4.8:**

```
Product Name
⭐⭐⭐⭐⭐ 4.8 | 450 sold
Ksh 25,000
```

**If you leave both empty:**

```
Product Name
Ksh 25,000
```

(Nothing shows - clean look for new products)

## 💡 Tips

### For Popular Products

- Sold Count: 500+
- Rating: 4.5 - 5.0

### For New Products

- Leave both empty until you have real data

### For Moderate Products

- Sold Count: 50 - 500
- Rating: 4.0 - 4.8

## ⚠️ Important

- **Leave empty to hide** - Don't put 0 if you want to hide it
- **Rating must be 0.0 to 5.0** - System won't accept higher
- **Changes show immediately** - After saving, refresh the product page

## 🔍 Where to Find It

Admin Panel → Products → Edit/New → Right Sidebar → "Social Proof" section

---

That's it! Your admin can now add social proof to boost sales! 🚀
