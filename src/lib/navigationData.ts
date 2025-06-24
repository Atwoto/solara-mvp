// src/lib/navigationData.ts

// Type definitions (can be shared or kept here)
interface SubCategory { name: string; href: string; }
interface TopLevelCategory { name: string; href: string; subcategories?: SubCategory[]; }

export const productCategoriesData: TopLevelCategory[] = [
  { name: 'All Products', href: '/products' }, // Added an "All" option
  { name: 'Solar Panels', href: '/products?category=solar-panels' },
  { name: 'Inverters', href: '/products?category=inverters', subcategories: [
      { name: 'Off-grid Inverters', href: '/products?category=off-grid-inverters' },
      { name: 'Hybrid Inverters', href: '/products?category=hybrid-inverters' },
      { name: 'Grid-tied Inverters', href: '/products?category=grid-tied-inverters' }
  ]},
  { name: 'Battery', href: '/products?category=batteries', subcategories: [
      { name: 'Valve Regulated Lead Acid Battery', href: '/products?category=vrla-battery' },
      { name: 'Lithium Ion Battery', href: '/products?category=lithium-ion-battery' }
  ]},
  { name: 'Portable Power Station', href: '/products?category=portable-power-station' },
];