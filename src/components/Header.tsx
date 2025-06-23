'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useComparison } from '@/context/ComparisonContext';
import { useSession, signOut } from 'next-auth/react';
import { 
    ShoppingCartIcon, Bars3Icon, XMarkIcon, HeartIcon, 
    ArrowsRightLeftIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, 
    ArrowRightOnRectangleIcon, ChevronDownIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import NextImage from 'next/image';
import CartSidebar from './CartSidebar';
import ComparisonModal from './ComparisonModal';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPE DEFINITIONS ---
interface ProductOrServiceLink { name: string; href: string; price?: string; }
interface BrandOrServiceGroup { name: string; products: ProductOrServiceLink[]; }
interface SubCategory { name: string; href: string; count?: number; brands?: BrandOrServiceGroup[]; }
interface TopLevelCategory { name: string; href: string; count?: number; subcategories?: SubCategory[]; }

// =======================================================================================
// --- NAVIGATION DATA (IMPORTANT: PASTE YOUR DATA HERE) ---
// =======================================================================================
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
    href: '/products?category=inverters',
    subcategories: [
      { name: 'Off-grid Inverters', href: '/products?category=off-grid-inverters', count: 8 },
      { name: 'Hybrid Inverters', href: '/products?category=hybrid-inverters', count: 26 },
      { name: 'Grid-tied Inverters', href: '/products?category=grid-tied-inverters', count: 15 }
    ]
  },
  {
    name: 'Battery', 
    href: '/products?category=batteries',
    subcategories: [
      { name: 'Valve Regulated Lead Acid Battery', href: '/products?category=vrla-battery' },
      { name: 'Lithium Ion Battery', href: '/products?category=lithium-ion-battery', count: 17 }
    ]
  },
  { name: 'Portable Power Station', href: '/products?category=portable-power-station', count: 5 },
];

const installationServiceCategories: TopLevelCategory[] = [
  {
    name: 'Residential',
    href: '/services/residential',
    subcategories: [
      {
        name: 'Solar Hybrid Systems',
        href: '/services/residential-solar-hybrid-systems',
        brands: [ 
          {
            name: 'Available Systems',
            products: [
              { name: '3kW Solar Hybrid System', href: '/services/residential-solar-hybrid-3kw' },
              { name: '5kW Solar Hybrid System', href: '/services/residential-solar-hybrid-5kw' },
              { name: '8kW Solar Hybrid System', href: '/services/residential-solar-hybrid-8kw' },
            ]
          }
        ]
      },
      { name: 'Power Backup Systems', href: '/services/residential-power-backup-systems' }
    ]
  },
  { name: 'Commercial', href: '/services/commercial-solar-solutions' },
  { name: 'Industrial', href: '/services/industrial-solar-solutions' },
  { name: 'Water Pumps Installation', href: '/services/water-pump-installation' }
];

// =======================================================================================
//  INTERNAL SUB-COMPONENTS
// =======================================================================================

const DesktopNav = ({ pathname }: { pathname: string }) => {
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1 && pathname.split('/')[1] === href.split('/')[1]);
    return <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out hover:text-solar-flare-end ${isActive ? 'font-semibold text-solar-flare-end' : 'text-graphite/70'}`}>{children}</Link>;
  };

  const DropdownMenu = ({ categoryL1, closeDropdown }: { categoryL1: TopLevelCategory, closeDropdown: () => void }) => (
    <div key={categoryL1.name} className="group/L1 relative text-gray-600"> 
        <div className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-solar-flare-start/10 hover:text-solar-flare-end transition-colors rounded-lg mx-1 my-0.5">
            <Link href={categoryL1.href || '#'} onClick={closeDropdown} className="flex-grow font-medium">{categoryL1.name}</Link>
            {categoryL1.subcategories && <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover/L1:text-solar-flare-end" />}
        </div>
        {categoryL1.subcategories && (
            <div className="absolute left-full top-0 mt-0 ml-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200/80 opacity-0 invisible group-hover/L1:opacity-100 group-hover/L1:visible transition-all duration-200 ease-in-out z-20 group-hover/L1:delay-50 pointer-events-none group-hover/L1:pointer-events-auto">
                <div className="py-1">
                    {categoryL1.subcategories.map((categoryL2) => (
                        <div key={categoryL2.name} className="group/L2 relative text-gray-600">
                           <Link href={categoryL2.href || '#'} onClick={closeDropdown} className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-solar-flare-start/10 hover:text-solar-flare-end transition-colors rounded-lg mx-1 my-0.5 font-medium">
                                {categoryL2.name}
                                {categoryL2.brands && <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover/L2:text-solar-flare-end" />}
                            </Link>
                            {categoryL2.brands && (
                                <div className="absolute left-full top-0 mt-0 ml-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200/80 opacity-0 invisible group-hover/L2:opacity-100 group-hover/L2:visible transition-all z-30 pointer-events-none group-hover/L2:pointer-events-auto">
                                    <div className="p-2">
                                        {categoryL2.brands.map((brand) => (
                                            <div key={brand.name} className="py-1">
                                                <div className="text-xs font-semibold text-gray-400 mb-1 uppercase px-2">{brand.name}</div>
                                                {brand.products.map((product) => (
                                                    <Link key={product.name} href={product.href || '#'} onClick={closeDropdown} className="block px-2 py-1.5 text-xs text-gray-500 hover:text-solar-flare-end hover:bg-solar-flare-start/10 rounded-md transition-colors">{product.name}</Link>
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
  );

  return (
    <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
      <div className="relative" onMouseEnter={() => { setIsProductsDropdownOpen(true); setIsServicesDropdownOpen(false); }} onMouseLeave={() => setIsProductsDropdownOpen(false)}>
        <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ease-in-out hover:text-solar-flare-end ${pathname.startsWith('/products') || isProductsDropdownOpen ? 'font-semibold text-solar-flare-end' : 'text-graphite/70'}`}>
          Products <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
        <AnimatePresence>
          {isProductsDropdownOpen && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="absolute left-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/80 z-20 p-1">
                {productCategoriesData.map((cat) => <DropdownMenu key={cat.name} categoryL1={cat} closeDropdown={() => setIsProductsDropdownOpen(false)} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative" onMouseEnter={() => { setIsServicesDropdownOpen(true); setIsProductsDropdownOpen(false); }} onMouseLeave={() => setIsServicesDropdownOpen(false)}>
        <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ease-in-out hover:text-solar-flare-end ${pathname.startsWith('/services') || isServicesDropdownOpen ? 'font-semibold text-solar-flare-end' : 'text-graphite/70'}`}>
          Installation Services <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
         <AnimatePresence>
          {isServicesDropdownOpen && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="absolute left-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/80 z-20 p-1">
                {installationServiceCategories.map((cat) => <DropdownMenu key={cat.name} categoryL1={cat} closeDropdown={() => setIsServicesDropdownOpen(false)} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {mainNavLinks.map((link) => <NavLink key={link.name} href={link.href}>{link.name}</NavLink>)}
    </nav>
  );
};

const ActionIcons = ({ openComparisonModal }: { openComparisonModal: () => void; }) => {
  const { openCart, getTotalItems } = useCart();
  const { wishlistCount, isLoading: isWishlistLoading } = useWishlist();
  const { comparisonItems } = useComparison();
  const { data: session, status: sessionStatus } = useSession();

  const IconButton = ({ onClick, href, ariaLabel, children, badgeCount }: { onClick?: () => void; href?: string; ariaLabel: string; children: React.ReactNode; badgeCount?: number; }) => {
    const content = (
      <div className="relative p-2 rounded-full text-graphite/70 hover:text-solar-flare-end hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-end transition-all duration-200">
        {children}
        {badgeCount !== undefined && badgeCount > 0 && (<span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">{badgeCount > 9 ? '9+' : badgeCount}</span>)}
      </div>
    );
    return href ? <Link href={href} aria-label={ariaLabel}>{content}</Link> : <button onClick={onClick} aria-label={ariaLabel}>{content}</button>;
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <div className="hidden lg:flex items-center space-x-4">
        {sessionStatus === 'authenticated' ? (
          <>
            <span className="text-sm text-graphite/80 truncate max-w-[150px]" title={session.user?.email ?? undefined}>Hi, {session.user?.name?.split(' ')[0] ?? ''}</span>
            <button onClick={() => signOut()} className="group flex items-center text-sm font-medium text-graphite/70 hover:text-solar-flare-end transition-colors" title="Log Out"><ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" /><span>Log Out</span></button>
          </>
        ) : sessionStatus === 'unauthenticated' ? (
          <Link href="/login" className="flex justify-center items-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end px-5 py-2 text-sm font-semibold text-white rounded-full shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-300">Log In</Link>
        ) : <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>}
      </div>
      <IconButton onClick={openComparisonModal} ariaLabel="Compare items" badgeCount={comparisonItems.length}><ArrowsRightLeftIcon className="h-6 w-6" /></IconButton>
      <IconButton href="/wishlist" ariaLabel="View Wishlist" badgeCount={isWishlistLoading ? undefined : wishlistCount}><HeartIcon className="h-6 w-6" /></IconButton>
      <IconButton onClick={openCart} ariaLabel="Open shopping cart" badgeCount={getTotalItems()}><ShoppingCartIcon className="h-6 w-6" /></IconButton>
    </div>
  );
};

const MobileMenu = ({ isOpen, closeMenu, pathname }: { isOpen: boolean; closeMenu: () => void; pathname: string; }) => {
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  const MobileAccordion = ({ title, data, isOpen, onToggle }: { title: string; data: TopLevelCategory[]; isOpen: boolean; onToggle: () => void; }) => (
    <div className="py-2 border-b border-gray-200">
      <button onClick={onToggle} className={`flex items-center justify-between w-full py-2 text-left text-lg font-semibold ${isOpen ? 'text-solar-flare-end' : 'text-graphite'}`}>
        <span>{title}</span>
        <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (<motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden"><div className="pt-2 pl-2 space-y-1">{data.map((cat) => (<Link key={cat.name} href={cat.href || '#'} onClick={closeMenu} className="block pl-2 pr-2 py-2 text-md font-medium text-gray-600 hover:text-solar-flare-end hover:bg-gray-100 rounded-lg">{cat.name}</Link>))}</div></motion.div>)}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="lg:hidden bg-white/95 backdrop-blur-lg absolute w-full shadow-2xl left-0 right-0 h-[calc(100vh-64px)] overflow-y-auto z-50">
          <div className="px-5 pt-5 pb-10">
            <nav className="flex flex-col">
              <MobileAccordion title="Products" data={productCategoriesData} isOpen={isMobileProductsOpen} onToggle={() => setIsMobileProductsOpen(p => !p)} />
              <MobileAccordion title="Installation Services" data={installationServiceCategories} isOpen={isMobileServicesOpen} onToggle={() => setIsMobileServicesOpen(p => !p)} />
              {mainNavLinks.map((link) => (<Link key={link.name} href={link.href} className="block py-3 text-lg font-semibold border-b border-gray-200 text-graphite hover:text-solar-flare-end" onClick={closeMenu}>{link.name}</Link>))}
              <div className="pt-8">
                {sessionStatus === 'authenticated' ? (
                  <div className="space-y-4">
                     <div className="flex items-center">
                        {session.user?.image ? <NextImage src={session.user.image} alt="Avatar" width={40} height={40} className="rounded-full mr-3"/> : <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3"/>}
                        <div><p className="font-semibold text-graphite">{session.user?.name}</p><p className="text-sm text-gray-500">{session.user?.email}</p></div>
                     </div>
                     <button onClick={() => { signOut(); closeMenu(); }} className="w-full flex items-center justify-center py-3 rounded-lg text-md font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"><ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2"/>Log Out</button>
                  </div>
                ) : sessionStatus === 'unauthenticated' ? (
                  <Link href="/login" onClick={closeMenu} className="w-full flex items-center justify-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 text-md font-semibold text-white rounded-full shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-300">Log In / Sign Up</Link>
                ) : null}
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 text-graphite shadow-sm backdrop-blur-md border-b border-gray-200/80">
        <div className="container mx-auto flex items-center justify-between p-3 sm:p-4">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative h-8 w-8 sm:h-10 sm:w-10"><NextImage src="/images/logo.png" alt="Bills On Solar EA Limited Logo" fill className="object-contain" sizes="40px"/></div>
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-graphite group-hover:text-solar-flare-end transition-colors">Bills On Solar</span>
            </Link>
          </div>
          <DesktopNav pathname={pathname} />
          <div className="flex items-center">
            <ActionIcons openComparisonModal={() => setIsComparisonModalOpen(true)} />
            <div className="lg:hidden flex items-center ml-2">
              <button className="p-2 rounded-md text-graphite/70 hover:text-solar-flare-end hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu">
                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        <MobileMenu isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} pathname={pathname}/>
      </header>
      <CartSidebar /> 
      <ComparisonModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} />
    </>
  );
};

export default Header;