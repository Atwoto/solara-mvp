'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { productCategoriesData } from '@/lib/navigationData';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- ANIMATION VARIANTS ---
const subMenuVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
};

// --- IMPRESSIVE NEW CATEGORY ITEM COMPONENT ---
const CategoryItem = ({
    category,
    currentCategory,
    openCategory,
    setOpenCategory,
}: {
    category: typeof productCategoriesData[0];
    currentCategory: string | null;
    openCategory: string | null;
    setOpenCategory: (name: string | null) => void;
}) => {
    const categorySlug = category.href.split('=').pop() || null;
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isParentActive = currentCategory === categorySlug;
    const isChildActive = category.subcategories?.some(sub => sub.href.split('=').pop() === currentCategory);
    const isOpen = openCategory === category.name;

    const handleToggle = () => {
        if (hasSubcategories) {
            setOpenCategory(isOpen ? null : category.name);
        }
    };

    return (
        <div className="relative">
            <Link
                href={category.href}
                onClick={handleToggle}
                className={`flex justify-between items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    isParentActive && !isChildActive ? 'text-deep-night' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
                {/* The "Magic Motion" highlight for the parent category */}
                {isParentActive && !isChildActive && (
                    <motion.div
                        layoutId="active-category-highlight"
                        className="absolute inset-0 bg-solar-flare-start/10 rounded-lg"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                )}
                <span className="relative z-10">{category.name}</span>
                {hasSubcategories && (
                    <ChevronDownIcon
                        className={`relative z-10 h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-solar-flare-end' : 'text-gray-400'}`}
                    />
                )}
            </Link>

            <AnimatePresence>
                {isOpen && hasSubcategories && (
                    <motion.div
                        variants={subMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="pl-4 mt-1 space-y-1 border-l-2 ml-4 border-gray-200 overflow-hidden"
                    >
                        {category.subcategories?.map(sub => {
                            const subCategorySlug = sub.href.split('=').pop();
                            const isSubActive = currentCategory === subCategorySlug;
                            return (
                                <Link
                                    key={sub.name}
                                    href={sub.href}
                                    className={`relative block px-3 py-2 text-xs rounded-md transition-colors ${
                                        isSubActive ? 'font-semibold text-deep-night' : 'text-gray-500 hover:text-deep-night hover:bg-gray-100'
                                    }`}
                                >
                                    {/* The "Magic Motion" highlight for the subcategory */}
                                    {isSubActive && (
                                        <motion.div
                                            layoutId="active-category-highlight"
                                            className="absolute inset-0 bg-solar-flare-start/10 rounded-md"
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    <span className="relative z-10">{sub.name}</span>
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- REDESIGNED PRODUCT SIDEBAR ---
const ProductSidebar = () => {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');
    const [openCategory, setOpenCategory] = useState<string | null>(() => {
        // Automatically open the category that contains the active subcategory on page load
        const activeParent = productCategoriesData.find(cat =>
            cat.subcategories?.some(sub => sub.href.split('=').pop() === currentCategory)
        );
        return activeParent?.name || null;
    });

    return (
        <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-28 bg-white p-4 rounded-2xl shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-bold text-deep-night mb-4 border-b pb-3 px-2">
                    Product Categories
                </h3>
                <nav className="space-y-1">
                    {productCategoriesData.map((category) => (
                        <CategoryItem
                            key={category.name}
                            category={category}
                            currentCategory={currentCategory}
                            openCategory={openCategory}
                            setOpenCategory={setOpenCategory}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default ProductSidebar;
