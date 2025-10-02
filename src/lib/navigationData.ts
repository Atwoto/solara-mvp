// src/lib/navigationData.ts

// Type definitions (can be shared or kept here)
interface SubCategory {
  name: string;
  href: string;
}
interface TopLevelCategory {
  name: string;
  href: string;
  subcategories?: SubCategory[];
}

export const productCategoriesData: TopLevelCategory[] = [
  { name: "All Products", href: "/products" },
  { name: "Solar Panels", href: "/products?category=solar-panels" },
  {
    name: "Inverters",
    href: "/products?category=inverters",
    subcategories: [
      {
        name: "Off-grid Inverters",
        href: "/products?category=off-grid-inverters",
      },
      { name: "Hybrid Inverters", href: "/products?category=hybrid-inverters" },
      {
        name: "Grid-tied Inverters",
        href: "/products?category=grid-tied-inverters",
      },
    ],
  },
  {
    name: "Battery",
    href: "/products?category=batteries",
    subcategories: [
      {
        name: "Valve Regulated Lead Acid Battery",
        href: "/products?category=vrla-battery",
      },
      {
        name: "Lithium Ion Battery",
        href: "/products?category=lithium-ion-battery",
      },
    ],
  },
  // --- THIS IS THE FIX ---
  // Added "Solar Lights" and the other missing categories below.
  { name: "Solar Lights", href: "/products?category=solar-lights" },
  {
    name: "Pumps",
    href: "/products?category=pumps",
    subcategories: [
      { name: "Heat Pumps", href: "/products?category=heat-pumps" },
      { name: "Pumping Inverter", href: "/products?category=pumping-inverter" },
      { name: "Borehole Pumps", href: "/products?category=borehole-pumps" },
      { name: "Surface Pump", href: "/products?category=surface-pump" },
    ],
  },
  {
    name: "Solar Water Heaters",
    href: "/products?category=solar-water-heaters",
    subcategories: [
      { name: "Direct / Indirect", href: "/products?category=direct-indirect" },
      {
        name: "Pressurised / Non Pressurised",
        href: "/products?category=pressurised-non-pressurised",
      },
    ],
  },
  { name: "Solar Fridge", href: "/products?category=solar-fridge" },
  {
    name: "Portable Power Station",
    href: "/products?category=portable-power-station",
  },
  { name: "Residential", href: "/products?category=residential" },
  { name: "Commercial", href: "/products?category=commercial" },
  { name: "Accessories", href: "/products?category=accessories" },
];
