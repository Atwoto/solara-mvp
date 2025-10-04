// src/app/admin/orders/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import PageLoader from "@/components/PageLoader";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";

const ADMIN_EMAIL = "kenbillsonsolararea@gmail.com";

interface OrderItem {
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string[] | null;
    category: string;
    wattage: number | null;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
  guest_email: string | null;
  users: {
    email: string | null;
  } | null;
  order_items: OrderItem[];
}

const statusStyles: { [key: string]: string } = {
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-300",
  paid: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-300",
  shipped: "bg-teal-100 text-teal-800 border-teal-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  failed: "bg-pink-100 text-pink-800 border-pink-300",
};

const statusFilters = [
  "All",
  "Paid",
  "Shipped",
  "Delivered",
  "Pending Payment",
  "Processing",
  "Cancelled",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

const AdminOrdersPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=/admin/orders`);
    } else if (
      sessionStatus === "authenticated" &&
      session?.user?.email !== ADMIN_EMAIL
    ) {
      router.replace("/");
    }
  }, [session, sessionStatus, router]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error: any) {
      setFetchError(error.message || "Could not load orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      session?.user?.email === ADMIN_EMAIL
    ) {
      fetchOrders();
    }
  }, [sessionStatus, session, fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (activeStatus === "All") return true;
        return (
          order.status.replace(/_/g, " ").toLowerCase() ===
          activeStatus.toLowerCase()
        );
      })
      .filter((order) => {
        const search = searchTerm.toLowerCase();
        if (!search) return true;
        return (
          order.id.toLowerCase().includes(search) ||
          order.users?.email?.toLowerCase().includes(search)
        );
      });
  }, [orders, searchTerm, activeStatus]);

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="p-6">
        <PageLoader message="Loading orders..." />
      </div>
    );
  }
  if (
    sessionStatus !== "authenticated" ||
    session?.user?.email !== ADMIN_EMAIL
  ) {
    return (
      <div className="p-6">
        <PageLoader message="Redirecting..." />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage Orders"
        description="View and manage all customer orders."
      />

      {fetchError && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">
          {fetchError}
        </p>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start transition"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`relative px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-200 ${
                  activeStatus === status
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {activeStatus === status && (
                  <motion.div
                    layoutId="active-order-status-highlight"
                    className="absolute inset-0 bg-deep-night rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <motion.div
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -50 }}
                  key={order.id}
                  className="p-4 rounded-lg hover:bg-slate-50/70 transition-colors border border-slate-200"
                >
                  {/* Order Header */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-3">
                    <div className="md:col-span-3 font-mono text-xs text-slate-600">
                      <span className="font-sans text-slate-400 text-xs">
                        ID:
                      </span>{" "}
                      {order.id.substring(0, 8)}
                    </div>
                    <div className="md:col-span-3 text-sm text-slate-800 font-medium">
                      {order.users?.email || order.guest_email || "N/A"}
                    </div>
                    <div className="md:col-span-2 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="md:col-span-2 text-sm font-semibold text-slate-900">
                      Ksh {order.total_amount.toLocaleString()}
                    </div>
                    <div className="md:col-span-1 text-center">
                      <span
                        className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusStyles[order.status.toLowerCase().replace(/ /g, "_")] || "bg-gray-100 text-gray-800"}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="md:col-span-1 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 rounded-lg text-slate-500 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                        title="View Order Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Product Details */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-2">
                        Products Ordered:
                      </p>
                      <div className="space-y-2">
                        {order.order_items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 text-sm"
                          >
                            {item.products.image_url &&
                              item.products.image_url.length > 0 && (
                                <img
                                  src={item.products.image_url[0]}
                                  alt={item.products.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                            <div className="flex-1">
                              <span className="font-medium text-slate-700">
                                {item.products.name}
                              </span>
                              {item.products.wattage && (
                                <span className="text-slate-500 ml-2">
                                  ({item.products.wattage}W)
                                </span>
                              )}
                            </div>
                            <div className="text-slate-600">
                              Qty: {item.quantity} × Ksh{" "}
                              {item.price_at_purchase.toLocaleString()}
                            </div>
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <p className="text-xs text-slate-500 italic">
                            +{order.order_items.length - 3} more item(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-2 text-lg font-medium text-slate-800">
                  No Orders Found
                </h3>
                <p className="mt-1 text-sm">
                  No orders match your current filter and search term.
                </p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default AdminOrdersPage;
