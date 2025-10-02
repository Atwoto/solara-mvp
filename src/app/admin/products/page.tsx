// src/app/admin/products/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, PRODUCT_CATEGORY_SLUGS } from "@/types";
import PageHeader from "@/components/admin/PageHeader";
import PageLoader from "@/components/PageLoader";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, Variants } from "framer-motion";

const ADMIN_EMAIL = "kenbillsonsolararea@gmail.com";
const allFilters = ["All", ...PRODUCT_CATEGORY_SLUGS];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: () => void;
}) => {
  return (
    <motion.div
      layout
      variants={itemVariants}
      exit="exit"
      className="bg-white rounded-xl shadow-sm border border-slate-200/80 flex flex-col"
    >
      <div className="relative h-48 w-full bg-slate-100 rounded-t-xl overflow-hidden">
        {product.image_url && product.image_url[0] ? (
          // --- THIS IS THE FIX ---
          <img
            src={product.image_url[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <CubeIcon className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-xs font-semibold text-solar-flare-end uppercase tracking-wider">
          {product.category}
        </p>
        <h3
          className="font-bold text-slate-800 mt-1 line-clamp-2"
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="flex-grow"></div>
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/80">
          <p className="font-bold text-slate-900">
            Ksh {product.price.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/products/edit/${product.id}`}
              className="p-2 rounded-lg text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              title="Edit Product"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Delete Product"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- ADMIN PRODUCTS PAGE ---
const AdminProductsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchAdminProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/admin/products/all");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products");
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error: any) {
      setFetchError(error.message || "Could not load products.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email === ADMIN_EMAIL) {
      fetchAdminProducts();
    }
  }, [status, session, fetchAdminProducts]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=/admin/products`);
    } else if (
      status === "authenticated" &&
      session?.user?.email !== ADMIN_EMAIL
    ) {
      router.replace("/");
    }
  }, [session, status, router]);

  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to archive the product: "${productName}"?`
      )
    ) {
      return;
    }
    setActionMessage(null);
    try {
      // We use an archive endpoint now instead of DELETE
      const response = await fetch(`/api/admin/products/archive/${productId}`, {
        method: "PUT",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to archive product");

      setActionMessage({ type: "success", text: result.message });
      // Instead of filtering, we just refetch the list to show the change
      fetchAdminProducts();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: `Error archiving product: ${err.message}`,
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => !product.is_archived)
      .filter((product) => {
        if (activeCategory === "All") return true;
        // Case-insensitive filtering
        return product.category?.toLowerCase() === activeCategory.toLowerCase();
      })
      .filter((product) => {
        const search = searchTerm.toLowerCase();
        if (!search) return true;
        return product.name.toLowerCase().includes(search);
      });
  }, [products, searchTerm, activeCategory]);

  if (
    status === "loading" ||
    (isLoadingProducts && products.length === 0 && !fetchError)
  ) {
    return (
      <div className="p-6">
        <PageLoader message="Loading products..." />
      </div>
    );
  }
  if (status !== "authenticated" || session?.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="p-6">
        <PageLoader message="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Manage Products"
        description="View, add, edit, or delete products from the catalog."
      >
        <Link
          href="/admin/products/new"
          className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1.5 -ml-0.5" />
          Add New Product
        </Link>
      </PageHeader>

      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 my-4 rounded-md text-sm ${actionMessage.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}
          >
            {actionMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
      {fetchError && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">
          {fetchError}
        </p>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start transition"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {allFilters.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-200 ${
                    activeCategory === cat
                      ? "text-white"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  {activeCategory === cat && (
                    <motion.div
                      layoutId="active-product-category-highlight"
                      className="absolute inset-0 bg-deep-night rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {cat
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!isLoadingProducts && filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-dashed border-2 border-slate-200">
          <CubeIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-lg font-medium text-slate-900">
            No Products Found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            No products match your current search and filter combination.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={() => handleDeleteProduct(product.id, product.name)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default AdminProductsPage;
