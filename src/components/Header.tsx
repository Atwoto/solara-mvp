'use client';

import { useState, useEffect, ReactNode, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useComparison } from '@/context/ComparisonContext';
import { useSession, signOut } from 'next-auth/react';
import {
    ShoppingCartIcon, Bars3Icon, XMarkIcon, HeartIcon,
    ArrowsRightLeftIcon, UserCircleIcon, ArrowLeftOnRectangleIcon,
    ChevronDownIcon, BuildingStorefrontIcon, WrenchScrewdriverIcon,
    ComputerDesktopIcon, StarIcon, MapIcon // <-- NEW ICON
} from '@heroicons/react/24/outline';
import NextImage from 'next/image';
import CartSidebar from './CartSidebar';
import ComparisonModal from './ComparisonModal';
import { motion, AnimatePresence } from 'framer-motion';
import { productCategoriesData } from '@/lib/navigationData';

// --- TYPE DEFINITIONS (Unchanged) ---
interface NavCategory {
    name: string;
    href: string;
    count?: number;
    subcategories?: NavCategory[];
}

// --- NAVIGATION DATA (UPDATED) ---
const mainNavLinks = [
    { name: 'Projects', href: '/projects' },
    { name: 'County Resources', href: '/county-resources' }, // <-- ADDED THIS LINE
    { name: 'About Us', href: '/#about-us' },
    { name: 'Contact Us', href: '/#contact-us' },
    { name: 'Blog', href: '/#blog' },
];

const installationServiceCategories: NavCategory[] = [
    { name: 'Residential', href: '/services/residential', subcategories: [
        { name: 'Solar Hybrid Systems', href: '/services/residential-solar-hybrid-systems', subcategories: [
            { name: '3kW Solar Hybrid System', href: '/services/residential-solar-hybrid-3kw' },
            { name: '5kW Solar Hybrid System', href: '/services/residential-solar-hybrid-5kw' },
            { name: '8kW Solar Hybrid System', href: '/services/residential-solar-hybrid-8kw' },
        ]},
        { name: 'Power Backup Systems', href: '/services/residential-power-backup-systems' }
    ]},
    { name: 'Commercial', href: '/services/commercial-solar-solutions' },
    { name: 'Industrial', href: '/services/industrial-solar-solutions' },
    { name: 'Water Pumps Installation', href: '/services/water-pump-installation' }
];

// --- DESKTOP MEGA MENU (Unchanged) ---
const MegaMenu = ({ categories, closeMenu, featuredItem }: { categories: NavCategory[], closeMenu: () => void, featuredItem: { name: string, href: string, image: string, description: string } }) => (
    <div className="grid grid-cols-12 gap-x-8 p-6">
        <div className="col-span-8 grid grid-cols-3 gap-x-6 gap-y-8">
            {categories.map((categoryL1) => (
                <div key={categoryL1.name}>
                    <Link href={categoryL1.href} onClick={closeMenu} className="text-sm font-semibold text-gray-900 hover:text-solar-flare-end transition-colors duration-200">
                        {categoryL1.name}
                    </Link>
                    <div className="mt-3 space-y-2 border-l border-gray-200 pl-4">
                        {categoryL1.subcategories?.map((categoryL2) => (
                            <Fragment key={categoryL2.name}>
                                <Link href={categoryL2.href} onClick={closeMenu} className="block text-sm text-gray-600 hover:text-solar-flare-end transition-colors duration-200">
                                    {categoryL2.name}
                                </Link>
                                {categoryL2.subcategories?.map((categoryL3) => (
                                    <Link key={categoryL3.name} href={categoryL3.href} onClick={closeMenu} className="block pl-3 text-xs text-gray-500 hover:text-solar-flare-end transition-colors duration-200">
                                        {categoryL3.name}
                                    </Link>
                                ))}
                            </Fragment>
                        ))}
                    </div>
                </div>
            ))}
        </div>
        <div className="col-span-4">
            <Link href={featuredItem.href} onClick={closeMenu} className="group block h-full w-full rounded-lg overflow-hidden relative bg-gray-100 p-6">
                 <NextImage src={featuredItem.image} alt={featuredItem.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="relative h-full flex flex-col justify-end text-white">
                    <p className="text-xs font-bold uppercase tracking-wider">Featured</p>
                    <h3 className="font-bold text-lg mt-1">{featuredItem.name}</h3>
                    <p className="text-sm text-gray-200">{featuredItem.description}</p>
                 </div>
            </Link>
        </div>
    </div>
);

// --- DESKTOP NAVIGATION (Unchanged) ---
const DesktopNav = ({ pathname }: { pathname: string }) => {
    const [activeMenu, setActiveMenu] = useState<'products' | 'services' | null>(null);

    const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1 && pathname.split('/')[1] === href.split('/')[1]);
        return <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out hover:text-solar-flare-end ${isActive ? 'font-semibold text-solar-flare-end' : 'text-gray-700'}`}>{children}</Link>;
    };

    const featuredProduct = { name: "Complete 5kW Hybrid System", href: "/products/solar-kits/5kw-hybrid-system", image: "/images/featured-product.jpg", description: "Our bestselling all-in-one solution." };
    const featuredService = { name: "Commercial Solar Solutions", href: "/services/commercial-solar-solutions", image: "/images/featured-service.jpg", description: "Power your business with solar." };

    return (
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 h-full" onMouseLeave={() => setActiveMenu(null)}>
            <div className="relative h-full flex items-center" onMouseEnter={() => setActiveMenu('products')}>
                <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ease-in-out hover:text-solar-flare-end ${pathname.startsWith('/products') || activeMenu === 'products' ? 'font-semibold text-solar-flare-end' : 'text-gray-700'}`}>
                    Products <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeMenu === 'products' ? 'rotate-180' : ''}`} />
                </div>
            </div>
            <div className="relative h-full flex items-center" onMouseEnter={() => setActiveMenu('services')}>
                <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ease-in-out hover:text-solar-flare-end ${pathname.startsWith('/services') || activeMenu === 'services' ? 'font-semibold text-solar-flare-end' : 'text-gray-700'}`}>
                    Installation Services <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeMenu === 'services' ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {mainNavLinks.map((link) => <NavLink key={link.name} href={link.href}>{link.name}</NavLink>)}
            
            <AnimatePresence>
                {activeMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="absolute top-full left-0 right-0 bg-white rounded-b-xl shadow-2xl border-x border-b border-gray-200/80 z-20"
                    >
                        {activeMenu === 'products' ? (
                            <MegaMenu categories={productCategoriesData} closeMenu={() => setActiveMenu(null)} featuredItem={featuredProduct} />
                        ) : (
                            <MegaMenu categories={installationServiceCategories} closeMenu={() => setActiveMenu(null)} featuredItem={featuredService} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

// --- ACTION ICONS & USER MENU (Unchanged) ---
const ActionIcons = ({ openComparisonModal }: { openComparisonModal: () => void; }) => {
    const { openCart, getTotalItems } = useCart();
    const { wishlistProducts, isLoading: isWishlistLoading } = useWishlist();
    const { comparisonItems } = useComparison();
    const { data: session, status: sessionStatus } = useSession();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const IconButton = ({ onClick, href, ariaLabel, children, badgeCount }: { onClick?: () => void; href?: string; ariaLabel: string; children: React.ReactNode; badgeCount?: number; }) => {
        const content = (<div className="relative p-2 rounded-full text-gray-600 hover:text-solar-flare-end hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-end transition-all duration-200">{children}{badgeCount !== undefined && badgeCount > 0 && (<span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">{badgeCount > 9 ? '9+' : badgeCount}</span>)}</div>);
        return href ? <Link href={href} aria-label={ariaLabel}>{content}</Link> : <button onClick={onClick} aria-label={ariaLabel}>{content}</button>;
    };

    return (
        <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center">
                {sessionStatus === 'authenticated' ? (
                    <div className="relative">
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                           {session.user?.image ?
                                <NextImage src={session.user.image} alt="User" width={32} height={32} className="rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-solar-flare-start transition-all" /> :
                                <UserCircleIcon className="h-8 w-8 text-gray-500 hover:text-solar-flare-end transition-colors" />
                           }
                        </button>
                        <AnimatePresence>
                        {isUserMenuOpen && (
                             <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200/80 z-30 p-2">
                                <div className="p-2 border-b border-gray-200">
                                    <p className="font-semibold text-sm text-gray-800 truncate">{session.user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="flex items-center w-full text-left p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-solar-flare-end transition-colors"><ComputerDesktopIcon className="h-5 w-5 mr-3"/>My Dashboard</Link>
                                    <button onClick={() => { signOut(); setIsUserMenuOpen(false); }} className="flex items-center w-full text-left p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500 transition-colors"><ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3"/>Log Out</button>
                                </div>
                             </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                ) : sessionStatus === 'unauthenticated' ? (
                    <Link href="/login" className="hidden lg:flex justify-center items-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end px-5 py-2 text-sm font-semibold text-deep-night rounded-full shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-300">Log In</Link>
                ) : <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse hidden lg:block"></div>}
            </div>
            
            <div className="flex items-center border-l border-gray-200 ml-2 pl-2">
              <IconButton onClick={openComparisonModal} ariaLabel="Compare items" badgeCount={comparisonItems.length}><ArrowsRightLeftIcon className="h-6 w-6" /></IconButton>
              <IconButton href="/wishlist" ariaLabel="View Wishlist" badgeCount={isWishlistLoading ? undefined : wishlistProducts.length}><HeartIcon className="h-6 w-6" /></IconButton>
              <IconButton onClick={openCart} ariaLabel="Open shopping cart" badgeCount={getTotalItems()}><ShoppingCartIcon className="h-6 w-6" /></IconButton>
            </div>
        </div>
    );
};

// --- MOBILE MENU (Unchanged) ---
const MobileFeaturedItem = ({ item, closeMenu }: { item: { name: string, href: string, image: string, description: string }, closeMenu: () => void }) => (
    <Link href={item.href} onClick={closeMenu} className="group block rounded-lg overflow-hidden relative bg-gray-100 p-4 my-2 mx-2">
        <NextImage src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end text-white">
           <p className="text-xs font-bold uppercase tracking-wider flex items-center"><StarIcon className="h-4 w-4 mr-1.5 text-yellow-400"/>Featured</p>
           <h3 className="font-bold text-md mt-1">{item.name}</h3>
        </div>
    </Link>
);

const MobileRecursiveMenu = ({ items, closeMenu, level = 0 }: { items: NavCategory[]; closeMenu: () => void; level?: number; }) => {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const toggleItem = (name: string) => setOpenItems(prev => ({ ...prev, [name]: !prev[name] }));
    const hasSubcategories = (item: NavCategory) => (item.subcategories && item.subcategories.length > 0);

    return (
        <div className={`space-y-1 ${level > 0 ? `pl-4 border-l-2 border-solar-flare-start/20 ml-2` : ''}`}>
            {items.map((item) => (
                <div key={item.name}>
                    <div className="flex items-center justify-between rounded-md hover:bg-gray-100">
                        <Link href={item.href || '#'} onClick={(e) => { if (!hasSubcategories(item)) { closeMenu(); } else { e.preventDefault(); toggleItem(item.name); } }} className="flex-grow py-3 px-2 text-md font-medium text-gray-800">{item.name}</Link>
                        {hasSubcategories(item) && (<button onClick={() => toggleItem(item.name)} className="p-3 text-gray-400"><ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${openItems[item.name] ? 'rotate-180 text-solar-flare-end' : ''}`} /></button>)}
                    </div>
                    <AnimatePresence>
                        {hasSubcategories(item) && openItems[item.name] && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <MobileRecursiveMenu items={item.subcategories!} closeMenu={closeMenu} level={level + 1} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const MobileMenu = ({ isOpen, closeMenu }: { isOpen: boolean; closeMenu: () => void; }) => {
    const { data: session, status: sessionStatus } = useSession();
    const featuredProduct = { name: "Complete 5kW Hybrid System", href: "/products/solar-kits/5kw-hybrid-system", image: "/images/featured-product.jpg", description: "Our bestselling all-in-one solution." };
    const featuredService = { name: "Commercial Solar Solutions", href: "/services/commercial-solar-solutions", image: "/images/featured-service.jpg", description: "Power your business with solar." };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="lg:hidden fixed inset-0 bg-black/40 z-[9998]" onClick={closeMenu}>
                    <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute w-full max-w-sm bg-white shadow-2xl left-0 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-bold text-lg">Menu</h2>
                            <button onClick={closeMenu} className="p-2 -mr-2"><XMarkIcon className="h-6 w-6 text-gray-600"/></button>
                        </div>
                        <div className="pt-4 pb-10">
                            <nav className="flex flex-col">
                                <div className="border-b pb-2">
                                    <h3 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Products</h3>
                                    <MobileFeaturedItem item={featuredProduct} closeMenu={closeMenu} />
                                    <div className="px-2"><MobileRecursiveMenu items={productCategoriesData} closeMenu={closeMenu} /></div>
                                </div>
                                <div className="border-b pb-2">
                                    <h3 className="px-4 pt-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Services</h3>
                                    <MobileFeaturedItem item={featuredService} closeMenu={closeMenu} />
                                    <div className="px-2"><MobileRecursiveMenu items={installationServiceCategories} closeMenu={closeMenu} /></div>
                                </div>
                                <div className="pt-2 px-2">
                                    {mainNavLinks.map((link) => (<Link key={link.name} href={link.href} className="block py-3 px-2 text-md font-medium text-gray-800 hover:bg-gray-100 rounded-md" onClick={closeMenu}>{link.name}</Link>))}
                                </div>
                                 {sessionStatus === 'unauthenticated' && (
                                     <div className="px-4 pt-8">
                                        <Link href="/login" onClick={closeMenu} className="w-full flex items-center justify-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 text-md font-semibold text-deep-night rounded-full shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-300">
                                            Log In / Sign Up
                                        </Link>
                                     </div>
                                 )}
                            </nav>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- FINAL HEADER ORCHESTRATOR (Unchanged) ---
const Header = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    useEffect(() => { 
        setIsMobileMenuOpen(false); 
    }, [pathname]);

    return (
        <>
            <header className={`sticky top-0 z-[50] w-full bg-white/80 text-gray-900 backdrop-blur-lg transition-all duration-300 ${scrolled ? 'shadow-lg border-b border-gray-200/80' : 'shadow-sm border-b border-transparent'}`}>
                <div className="container mx-auto flex items-center justify-between h-20 px-4 sm:px-6">
                    <div className="flex items-center">
                        <div className="lg:hidden flex items-center mr-2">
                            <button className="p-2 rounded-md text-gray-600 hover:text-solar-flare-end hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu">
                                {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
                            </button>
                        </div>
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center group">
                                <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                                    <NextImage src="/images/logo.png" alt="Bills On Solar EA Limited Logo" fill className="object-contain" sizes="48px"/>
                                </div>
                                <span className="hidden sm:block ml-3 text-xl font-bold text-gray-900 group-hover:text-solar-flare-end transition-colors">Bills On Solar</span>
                            </Link>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex justify-center h-full">
                      <DesktopNav pathname={pathname} />
                    </div>

                    <div className="flex items-center">
                        <ActionIcons openComparisonModal={() => setIsComparisonModalOpen(true)} />
                    </div>
                </div>
            </header>
            
            <MobileMenu isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />
            
            <CartSidebar /> 
            <ComparisonModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} />
        </>
    );
};

export default Header;
