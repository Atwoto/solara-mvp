// src/components/Header.tsx
'use client';

import { useState, useEffect, useRef, Fragment, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useComparison } from '@/context/ComparisonContext';
import { useSession, signOut } from 'next-auth/react';
import { 
    ShoppingCartIcon, Bars3Icon, XMarkIcon, HeartIcon, 
    ArrowsRightLeftIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, 
    ArrowRightOnRectangleIcon, ChevronDownIcon, ChevronRightIcon, WrenchScrewdriverIcon // Added for Services
} from '@heroicons/react/24/outline';
import NextImage from 'next/image';
import CartSidebar from './CartSidebar';
import ComparisonModal from './ComparisonModal';
import { motion, AnimatePresence } from 'framer-motion';

// --- START: Interface Definitions for Navigation Data ---
interface ProductOrServiceLink {
  name: string;
  href: string;
  price?: string; 
}

interface BrandOrServiceGroup {
  name: string; 
  products: ProductOrServiceLink[]; 
}

interface SubCategory {
  name: string;
  href: string;
  count?: number; 
  brands?: BrandOrServiceGroup[]; 
}

interface TopLevelCategory {
  name: string;
  href: string;
  count?: number; 
  subcategories?: SubCategory[];
}
// --- END: Interface Definitions ---


// Main navigation links (excluding Products & Services dropdowns)
const mainNavLinks = [
  { name: 'Projects', href: '/projects' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Blog', href: '/blog'},
];


const productCategoriesData: TopLevelCategory[] = [
  { name: 'Solar Panels', href: '/products?category=solar-panels', count: 21 },
  {
    name: 'Inverters', 
    href: '/products?category=inverters', // Main "Inverters" link (shows all with category 'inverters' if you have such products)
                                         // OR, this could link to a page that lists inverter types rather than products.
                                         // For now, let's assume it tries to show products with category='inverters'.
    subcategories: [
      // --- CHANGE THESE HREFS ---
      { name: 'Off-grid Inverters', href: '/products?category=off-grid-inverters', count: 8 },
      { name: 'Hybrid Inverters', href: '/products?category=hybrid-inverters', count: 26 },
      { name: 'Grid-tied Inverters', href: '/products?category=grid-tied-inverters', count: 15 } // e.g., portable/flexible product
    ]
  },
  {
    name: 'Battery', 
    href: '/products?category=batteries', // A general slug for all batteries
    subcategories: [
      { 
        name: 'Valve Regulated Lead Acid Battery', 
        href: '/products?category=vrla-battery', // Specific slug
        brands: [ /* ... */ ]
      },
      { name: 'Lithium Ion Battery', href: '/products?category=lithium-ion-battery', count: 17 } // Specific slug
    ]
  },
  { name: 'Portable Power Station', href: '/products?category=portable-power-station', count: 5 },
];


// Installation Service categories
// src/components/Header.tsx
// ...
const installationServiceCategories: TopLevelCategory[] = [
  {
    name: 'Residential',
    href: '/services/residential', // This links to src/app/services/residential/page.tsx (Residential Overview)
    subcategories: [
      {
        name: 'Solar Hybrid Systems',
        // This could be a specific service page or another overview page
        href: '/services/residential-solar-hybrid-systems', // Will be caught by [serviceSlug]
        brands: [ 
          {
            name: 'Available Systems',
            products: [
              // CHANGE THESE HREFS
              { name: '3kW Solar Hybrid System', href: '/services/residential-solar-hybrid-3kw' },
              { name: '5kW Solar Hybrid System', href: '/services/residential-solar-hybrid-5kw' },
              { name: '8kW Solar Hybrid System', href: '/services/residential-solar-hybrid-8kw' },
            ]
          }
        ]
      },
      {
        name: 'Power Backup Systems',
        href: '/services/residential-power-backup-systems', // Will be caught by [serviceSlug]
      }
    ]
  },
  {
    name: 'Commercial',
    href: '/services/commercial-solar-solutions', // Example slug, caught by [serviceSlug]
  },
  {
    name: 'Industrial',
    href: '/services/industrial-solar-solutions', // Example slug, caught by [serviceSlug]
  },
  {
    name: 'Water Pumps Installation', // Make sure slug matches this or is defined
    href: '/services/water-pump-installation', // Example slug, caught by [serviceSlug]
  }
];



const Header = () => {
  const { openCart, getTotalItems } = useCart(); 
  const { wishlistCount, isLoading: isWishlistLoading } = useWishlist();
  const { comparisonItems } = useComparison();
  const pathname = usePathname();

  const totalItemsInCart = getTotalItems();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  const { data: session, status: sessionStatus } = useSession();

  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProductsDropdownOpen(false);
    setIsServicesDropdownOpen(false);
    setIsMobileProductsOpen(false);
    setIsMobileServicesOpen(false);
  }, [pathname]);

  // Click outside handler for Products Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setIsProductsDropdownOpen(false);
      }
    };
    if (isProductsDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductsDropdownOpen]);

  // Click outside handler for Services Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    };
    if (isServicesDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesDropdownOpen]);


  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1 && pathname.split('/')[1] === href.split('/')[1]);
    return (
      <Link 
        href={href} 
        onClick={() => {
            setIsProductsDropdownOpen(false);
            setIsServicesDropdownOpen(false);
            if (onClick) onClick();
        }}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                    hover:text-solar-flare-start hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-solar-flare-start
                    ${isActive ? 'text-solar-flare-start bg-gray-700/30 font-semibold' : 'text-gray-300'}`}
      >
        {children}
      </Link>
    );
  };

// Products Dropdown Component
const ProductsDropdown = () => (
    <div className="relative" ref={productsDropdownRef}>
      <button
        type="button"
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                    hover:text-solar-flare-start hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-solar-flare-start
                    ${pathname.startsWith('/products') || isProductsDropdownOpen ? 'text-solar-flare-start bg-gray-700/30 font-semibold' : 'text-gray-300'}`}
        onClick={() => {
            setIsProductsDropdownOpen(prev => !prev);
            setIsServicesDropdownOpen(false); // Close other dropdown
        }}
        aria-expanded={isProductsDropdownOpen}
      >
        Products
        <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isProductsDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-72 md:w-80 bg-deep-night rounded-lg shadow-xl border border-gray-700 z-[9999]" 
          >
            <div className="py-1">
              {productCategoriesData.map((categoryL1) => (
                <div key={categoryL1.name} className="group/L1 relative text-gray-300"> 
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-700 hover:text-white transition-colors rounded-md mx-1 my-0.5">
                    <Link href={categoryL1.href || '#'} onClick={() => setIsProductsDropdownOpen(false)} className="flex-grow">
                      {categoryL1.name} {categoryL1.count !== undefined && <span className="text-xs text-gray-500 ml-1">({categoryL1.count})</span>}
                    </Link>
                    {(categoryL1.subcategories) && <ChevronRightIcon className="h-4 w-4 text-gray-500 group-hover/L1:text-white" />}
                  </div>
                  {categoryL1.subcategories && (
                    <div className="absolute left-full top-0 -mt-[0px] ml-px w-72 bg-deep-night rounded-r-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover/L1:opacity-100 group-hover/L1:visible transition-all duration-200 ease-in-out z-[99999] group-hover/L1:delay-50 pointer-events-none group-hover/L1:pointer-events-auto">
                      <div className="py-1">
                        {categoryL1.subcategories.map((categoryL2) => (
                          <div key={categoryL2.name} className="group/L2 relative text-gray-300">
                            <div className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-700 hover:text-white transition-colors rounded-md mx-1 my-0.5">
                              <Link href={categoryL2.href || '#'} onClick={() => setIsProductsDropdownOpen(false)} className="flex-grow">
                                {categoryL2.name} {categoryL2.count !== undefined && <span className="text-xs text-gray-500 ml-1">({categoryL2.count})</span>}
                              </Link>
                              {categoryL2.brands && <ChevronRightIcon className="h-4 w-4 text-gray-500 group-hover/L2:text-white" />}
                            </div>
                            {categoryL2.brands && ( 
                              <div className="absolute left-full top-0 -mt-[0px] ml-px w-72 bg-deep-night rounded-r-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover/L2:opacity-100 group-hover/L2:visible transition-all duration-200 ease-in-out z-[999999] group-hover/L2:delay-50 pointer-events-none group-hover/L2:pointer-events-auto">
                                <div className="py-1">
                                  {categoryL2.brands.map((brand, brandIndex) => ( 
                                    <div key={brand.name} className={`px-3 py-1 ${brandIndex > 0 ? 'pt-2 border-t border-gray-700/50 mt-1' : ''}`}>
                                      <div className="text-xs font-semibold text-gray-400 mb-1 uppercase pt-1 px-1">{brand.name}</div>
                                      {brand.products.map((product) => ( 
                                        <Link key={product.name} href={product.href || '#'} onClick={() => setIsProductsDropdownOpen(false)} className="block px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                                          {product.name} {product.price && <span className="text-gray-500 text-[10px]"> ({product.price})</span>}
                                        </Link>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

// Services Dropdown Component
const ServicesDropdown = () => (
    <div className="relative" ref={servicesDropdownRef}>
      <button
        type="button"
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                    hover:text-solar-flare-start hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-solar-flare-start
                    ${pathname.startsWith('/services') || isServicesDropdownOpen ? 'text-solar-flare-start bg-gray-700/30 font-semibold' : 'text-gray-300'}`}
        onClick={() => {
            setIsServicesDropdownOpen(prev => !prev);
            setIsProductsDropdownOpen(false); // Close other dropdown
        }}
        aria-expanded={isServicesDropdownOpen}
      >
        Installation Services
        <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isServicesDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-72 md:w-80 bg-deep-night rounded-lg shadow-xl border border-gray-700 z-[9999]" 
          >
            <div className="py-1">
              {installationServiceCategories.map((categoryL1) => ( // Use installationServiceCategories data
                <div key={categoryL1.name} className="group/L1 relative text-gray-300"> 
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-700 hover:text-white transition-colors rounded-md mx-1 my-0.5">
                    <Link href={categoryL1.href || '#'} onClick={() => setIsServicesDropdownOpen(false)} className="flex-grow">
                      {categoryL1.name} {/* No count for services generally, but can be added if needed */}
                    </Link>
                    {(categoryL1.subcategories) && <ChevronRightIcon className="h-4 w-4 text-gray-500 group-hover/L1:text-white" />}
                  </div>
                  {categoryL1.subcategories && (
                    <div className="absolute left-full top-0 -mt-[0px] ml-px w-72 bg-deep-night rounded-r-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover/L1:opacity-100 group-hover/L1:visible transition-all duration-200 ease-in-out z-[99999] group-hover/L1:delay-50 pointer-events-none group-hover/L1:pointer-events-auto">
                      <div className="py-1">
                        {categoryL1.subcategories.map((categoryL2) => (
                          <div key={categoryL2.name} className="group/L2 relative text-gray-300">
                            <div className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-700 hover:text-white transition-colors rounded-md mx-1 my-0.5">
                              <Link href={categoryL2.href || '#'} onClick={() => setIsServicesDropdownOpen(false)} className="flex-grow">
                                {categoryL2.name}
                              </Link>
                              {categoryL2.brands && <ChevronRightIcon className="h-4 w-4 text-gray-500 group-hover/L2:text-white" />}
                            </div>
                            {categoryL2.brands && ( // 'brands' here can mean service sub-types or specific offerings
                              <div className="absolute left-full top-0 -mt-[0px] ml-px w-72 bg-deep-night rounded-r-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover/L2:opacity-100 group-hover/L2:visible transition-all duration-200 ease-in-out z-[999999] group-hover/L2:delay-50 pointer-events-none group-hover/L2:pointer-events-auto">
                                <div className="py-1">
                                  {categoryL2.brands.map((brand, brandIndex) => ( 
                                    <div key={brand.name} className={`px-3 py-1 ${brandIndex > 0 ? 'pt-2 border-t border-gray-700/50 mt-1' : ''}`}>
                                      <div className="text-xs font-semibold text-gray-400 mb-1 uppercase pt-1 px-1">{brand.name}</div>
                                      {brand.products.map((serviceLink) => ( // Renamed 'product' to 'serviceLink' for clarity
                                        <Link key={serviceLink.name} href={serviceLink.href || '#'} onClick={() => setIsServicesDropdownOpen(false)} className="block px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                                          {serviceLink.name} {/* No price for services generally */}
                                        </Link>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

// Mobile Products Menu
const MobileProductsMenu = () => (
    <div className="py-1">
      <button
        onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
        className={`flex items-center justify-between w-full px-3 py-3 rounded-md text-base font-medium transition-colors text-left
                    ${pathname.startsWith('/products') || isMobileProductsOpen ? 'text-solar-flare-start bg-gray-700/50' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`}
        aria-expanded={isMobileProductsOpen}
      >
        Products
        <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isMobileProductsOpen ? 'rotate-180 text-solar-flare-start' : 'text-gray-400'}`} />
      </button>
      <AnimatePresence>
        {isMobileProductsOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden pl-3 mt-1 border-l-2 border-gray-700 ml-1 space-y-1">
            {productCategoriesData.map((categoryL1) => ( 
              <div key={categoryL1.name} className="py-1">
                <Link href={categoryL1.href || '#'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors">
                  <span>{categoryL1.name}</span>
                  {categoryL1.count !== undefined && <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">{categoryL1.count}</span>}
                </Link>
                {categoryL1.subcategories && ( 
                  <div className="ml-3 mt-1 space-y-1 border-l border-gray-600 pl-3">
                    {categoryL1.subcategories.map((categoryL2) => (
                      <div key={categoryL2.name} className="py-0.5">
                         <Link href={categoryL2.href || '#'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors">
                            <span>{categoryL2.name}</span>
                            {categoryL2.count !== undefined && <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">{categoryL2.count}</span>}
                        </Link>
                        {categoryL2.brands && ( 
                          <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-500 pl-3">
                            {categoryL2.brands.map((brand) => ( 
                              <div key={brand.name} className="py-0.5">
                                <div className="text-xs font-medium text-gray-500 px-2 py-0.5">{brand.name}</div>
                                {brand.products.map((product) => ( 
                                  <Link key={product.name} href={product.href || '#'} onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-1 text-[11px] text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors">
                                    {product.name} {product.price && <span className="text-gray-600"> ({product.price})</span>}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

// Mobile Services Menu
const MobileServicesMenu = () => (
    <div className="py-1">
      <button
        onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
        className={`flex items-center justify-between w-full px-3 py-3 rounded-md text-base font-medium transition-colors text-left
                    ${pathname.startsWith('/services') || isMobileServicesOpen ? 'text-solar-flare-start bg-gray-700/50' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`}
        aria-expanded={isMobileServicesOpen}
      >
        Installation Services
        <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180 text-solar-flare-start' : 'text-gray-400'}`} />
      </button>
      <AnimatePresence>
        {isMobileServicesOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden pl-3 mt-1 border-l-2 border-gray-700 ml-1 space-y-1">
            {installationServiceCategories.map((categoryL1) => ( 
              <div key={categoryL1.name} className="py-1">
                <Link href={categoryL1.href || '#'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors">
                  <span>{categoryL1.name}</span>
                </Link>
                {categoryL1.subcategories && ( 
                  <div className="ml-3 mt-1 space-y-1 border-l border-gray-600 pl-3">
                    {categoryL1.subcategories.map((categoryL2) => (
                      <div key={categoryL2.name} className="py-0.5">
                         <Link href={categoryL2.href || '#'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors">
                            <span>{categoryL2.name}</span>
                        </Link>
                        {categoryL2.brands && ( 
                          <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-500 pl-3">
                            {categoryL2.brands.map((brand) => ( 
                              <div key={brand.name} className="py-0.5">
                                <div className="text-xs font-medium text-gray-500 px-2 py-0.5">{brand.name}</div>
                                {brand.products.map((serviceLink) => ( 
                                  <Link key={serviceLink.name} href={serviceLink.href || '#'} onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-1 text-[11px] text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors">
                                    {serviceLink.name}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );


  const IconButton = ({ onClick, ariaLabel, children, badgeCount }: { onClick?: () => void; ariaLabel: string; children: React.ReactNode; badgeCount?: number; }) => ( <button onClick={onClick} className="relative p-1.5 sm:p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-night focus:ring-white transition-colors duration-200" aria-label={ariaLabel} > {children} {badgeCount !== undefined && badgeCount > 0 && ( <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-1 ring-deep-night"> {badgeCount > 9 ? '9+' : badgeCount} </span> )} </button> );

  return (
    <>
      <header className="sticky top-0 z-[9998] w-full bg-deep-night text-white shadow-lg">
        <div className="container mx-auto flex items-center justify-between p-3 sm:p-4">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative h-8 w-8 sm:h-10 sm:w-10">
                <NextImage src="/images/logo.png" alt="Bills On Solar EA Limited Logo" fill className="object-contain" sizes="40px"/>
              </div>
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold group-hover:text-solar-flare-start transition-colors">Bills On Solar</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <ProductsDropdown />
            <ServicesDropdown />
            {mainNavLinks.map((link) => ( <NavLink key={link.name} href={link.href}>{link.name}</NavLink> ))}
          </nav>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="hidden lg:flex items-center space-x-3">
              {sessionStatus === 'authenticated' && session ? ( <> <span className="text-xs sm:text-sm text-gray-300 truncate max-w-[100px] md:max-w-[120px] xl:max-w-[180px]" title={session.user?.email || undefined}> Hi, {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]} </span> <button onClick={() => signOut()} className="px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors" title="Log Out"> <ArrowLeftOnRectangleIcon className="h-5 w-5 inline-block md:hidden" /> <span className="hidden md:inline">Log Out</span> </button> </> ) : sessionStatus === 'unauthenticated' ? ( <Link href="/login" className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-white bg-solar-flare-start hover:bg-solar-flare-end transition-colors flex items-center"> <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Log In </Link> ) : ( <div className="h-8 w-16 sm:w-20 bg-gray-700/50 rounded-md animate-pulse"></div> )}
            </div>
            <IconButton onClick={() => setIsComparisonModalOpen(true)} ariaLabel="Compare items" badgeCount={comparisonItems.length}> <ArrowsRightLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" /> </IconButton>
            
            <Link href="/wishlist" className="relative p-1.5 sm:p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-night focus:ring-white transition-colors duration-200" aria-label="View Wishlist" >
              <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              {!isWishlistLoading && wishlistCount > 0 && ( <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-1 ring-deep-night"> {wishlistCount > 9 ? '9+' : wishlistCount} </span> )}
            </Link>

            <IconButton onClick={openCart} ariaLabel="Open shopping cart" badgeCount={totalItemsInCart}> <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" /> </IconButton>
            <div className="lg:hidden flex items-center"> <button className="p-1.5 sm:p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-deep-night focus:ring-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu"> {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />} </button> </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-700 bg-deep-night/95 backdrop-blur-sm absolute w-full shadow-2xl left-0 right-0 max-h-[calc(100vh-4.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-deep-night z-[9997]"
            >
              <nav className="flex flex-col px-4 py-3 divide-y divide-gray-700">
                <MobileProductsMenu />
                <MobileServicesMenu />
                {mainNavLinks.map((link) => ( <div className="py-1" key={link.name}> <Link href={link.href} className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href) && link.href.length > 1) ? 'text-solar-flare-start bg-gray-700' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)} > {link.name} </Link> </div> ))}
                <div className="pt-4 mt-2"> {sessionStatus === 'authenticated' && session ? ( <div className="flex flex-col items-start space-y-3 px-3 py-2"> <div className="flex items-center mb-2"> {session.user?.image ? ( <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3"> <NextImage src={session.user.image} alt="User avatar" fill className="object-cover"/> </div> ) : ( <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3"/> )} <div> <p className="text-sm font-medium text-white">Hi, {session.user?.name || session.user?.email?.split('@')[0]}</p> <p className="text-xs text-gray-400">{session.user?.email}</p> </div> </div> <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center px-3 py-3 rounded-md text-base font-medium text-gray-200 bg-gray-700/50 hover:bg-gray-600 hover:text-white transition-colors" > <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2"/> Log Out </button> </div> ) : sessionStatus === 'unauthenticated' ? ( <Link href="/login" className="flex items-center justify-center w-full px-3 py-3 rounded-md text-base font-medium text-white bg-solar-flare-start hover:bg-solar-flare-end transition-colors mt-2" onClick={() => setIsMobileMenuOpen(false)} > <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2"/> Log In / Sign Up </Link> ) : null} </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSidebar /> 
      <ComparisonModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} />
      <style jsx global>{`
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4B5563 #1f2937; }
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb { background-color: #4B5563; border-radius: 6px; border: 2px solid #1f2937; }
        .scrollbar-track-deep-night\\/50::-webkit-scrollbar-track { background-color: rgba(31, 41, 55, 0.5); border-radius: 6px; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
      `}</style>
    </>
  );
};

export default Header;